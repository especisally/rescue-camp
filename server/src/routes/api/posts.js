const express = require('express');
const prisma = require('../../services/prisma');
const { success, fail, paginate } = require('../../utils/response');
const { optionalAuth, requireAuth } = require('../../middleware/apiAuth');
const { detect } = require('../../utils/sensitiveFilter');

const router = express.Router();

/**
 * GET /api/posts
 * 帖子列表（tab: latest/hot/essence/resource + 分页 + 搜索）
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 20));
    const { tab = 'latest', keyword } = req.query;

    const where = { status: 1 };
    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { content: { contains: keyword } },
      ];
    }
    if (tab === 'essence') where.isEssence = true;
    if (tab === 'resource') where.type = 'video';

    const orderBy = tab === 'hot' ? { likes: 'desc' } : { createdAt: 'desc' };

    const [list, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          user: { select: { id: true, nickname: true, avatar: true, level: true } },
          category: { select: { id: true, name: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy,
      }),
      prisma.post.count({ where }),
    ]);

    // 如果已登录，标记是否点赞/收藏
    if (req.userId && list.length > 0) {
      const postIds = list.map(p => p.id);
      const [likedIds, favedIds] = await Promise.all([
        prisma.like.findMany({
          where: { userId: req.userId, targetType: 'post', targetId: { in: postIds } },
          select: { targetId: true },
        }),
        prisma.favorite.findMany({
          where: { userId: req.userId, targetType: 'post', targetId: { in: postIds } },
          select: { targetId: true },
        }),
      ]);
      const likedSet = new Set(likedIds.map(l => l.targetId));
      const favedSet = new Set(favedIds.map(f => f.targetId));
      list.forEach(p => {
        p.isLiked = likedSet.has(p.id);
        p.isFavorited = favedSet.has(p.id);
      });
    }

    return res.json(paginate(list, page, pageSize, total));
  } catch (err) {
    console.error('Post list error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

/**
 * GET /api/posts/:id — 帖子详情
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        user: { select: { id: true, nickname: true, avatar: true, level: true } },
        category: { select: { id: true, name: true } },
      },
    });
    if (!post || post.status === -1) {
      return res.status(404).json(fail(404, '帖子不存在'));
    }

    // 增加浏览量
    await prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });

    // 已登录则标记点赞/收藏
    if (req.userId) {
      const [liked, faved] = await Promise.all([
        prisma.like.findFirst({ where: { userId: req.userId, targetType: 'post', targetId: post.id } }),
        prisma.favorite.findFirst({ where: { userId: req.userId, targetType: 'post', targetId: post.id } }),
      ]);
      post.isLiked = !!liked;
      post.isFavorited = !!faved;
    }

    return res.json(success(post));
  } catch (err) {
    console.error('Post detail error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

/**
 * POST /api/posts — 发布帖子
 * Body: { title, content, type, images?, videoUrl?, categoryId?, tags?, points? }
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, content, type = 'text', images, videoUrl, categoryId, tags, points } = req.body;

    if (!title || !title.trim()) {
      return res.status(422).json(fail(422, '标题不能为空'));
    }
    if (!content || !content.trim()) {
      return res.status(422).json(fail(422, '内容不能为空'));
    }

    // 敏感词检测
    const titleCheck = detect(title);
    const contentCheck = detect(content);
    if (titleCheck.hasSensitive || contentCheck.hasSensitive) {
      const words = [...new Set([...titleCheck.words, ...contentCheck.words])];
      return res.status(422).json(fail(422, `内容包含敏感词：${words.join('、')}`));
    }

    const post = await prisma.post.create({
      data: {
        userId: req.userId,
        title: title.trim(),
        content: content.trim(),
        type,
        images: images || [],
        videoUrl: videoUrl || null,
        categoryId: categoryId ? Number(categoryId) : null,
        tags: tags || [],
        points: points ? Number(points) : 0,
        status: 1,
      },
      include: {
        user: { select: { id: true, nickname: true, avatar: true, level: true } },
      },
    });

    return res.json(success(post, '发布成功'));
  } catch (err) {
    console.error('Post create error:', err);
    return res.status(500).json(fail(500, '发布失败'));
  }
});

/**
 * DELETE /api/posts/:id — 删除帖子（仅作者本人）
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: Number(req.params.id) } });
    if (!post) return res.status(404).json(fail(404, '帖子不存在'));
    if (post.userId !== req.userId) {
      return res.status(403).json(fail(403, '只能删除自己的帖子'));
    }

    await prisma.post.update({
      where: { id: post.id },
      data: { status: -1 },
    });
    return res.json(success(null, '删除成功'));
  } catch (err) {
    console.error('Post delete error:', err);
    return res.status(500).json(fail(500, '删除失败'));
  }
});

/**
 * POST /api/posts/:id/like — 点赞/取消点赞
 */
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const existing = await prisma.like.findFirst({
      where: { userId: req.userId, targetType: 'post', targetId: postId },
    });

    if (existing) {
      // 取消点赞
      await prisma.$transaction([
        prisma.like.delete({ where: { id: existing.id } }),
        prisma.post.update({ where: { id: postId }, data: { likes: { decrement: 1 } } }),
      ]);
      return res.json(success({ liked: false }, '已取消点赞'));
    } else {
      // 点赞
      await prisma.$transaction([
        prisma.like.create({ data: { userId: req.userId, targetType: 'post', targetId: postId } }),
        prisma.post.update({ where: { id: postId }, data: { likes: { increment: 1 } } }),
      ]);

      // 发通知给帖子作者
      const post = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true } });
      if (post && post.userId !== req.userId) {
        await prisma.notification.create({
          data: {
            userId: post.userId,
            type: 'like',
            content: '有人赞了你的帖子',
            targetType: 'post',
            targetId: postId,
          },
        });
      }

      return res.json(success({ liked: true }, '点赞成功'));
    }
  } catch (err) {
    console.error('Post like error:', err);
    return res.status(500).json(fail(500, '操作失败'));
  }
});

/**
 * POST /api/posts/:id/favorite — 收藏/取消收藏
 */
router.post('/:id/favorite', requireAuth, async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const existing = await prisma.favorite.findFirst({
      where: { userId: req.userId, targetType: 'post', targetId: postId },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return res.json(success({ favorited: false }, '已取消收藏'));
    } else {
      await prisma.favorite.create({
        data: { userId: req.userId, targetType: 'post', targetId: postId },
      });
      return res.json(success({ favorited: true }, '收藏成功'));
    }
  } catch (err) {
    console.error('Post favorite error:', err);
    return res.status(500).json(fail(500, '操作失败'));
  }
});

/**
 * GET /api/posts/:id/comments — 帖子评论列表
 * 支持 sort=hot(按点赞) / new(按时间)
 * 支持 page/pageSize 分页
 * 返回嵌套结构：一级评论内嵌子回复
 */
router.get('/:id/comments', optionalAuth, async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 20));
    const { sort = 'new' } = req.query;

    // 只取一级评论（parentId = null）
    const where = { postId, parentId: null, status: 1 };
    const orderBy = sort === 'hot' ? { likes: 'desc' } : { createdAt: 'desc' };

    const [list, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          user: { select: { id: true, nickname: true, avatar: true, level: true } },
          replies: {
            where: { status: 1 },
            include: {
              user: { select: { id: true, nickname: true, avatar: true, level: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy,
      }),
      prisma.comment.count({ where }),
    ]);

    // 已登录则标记评论是否被当前用户点赞
    if (req.userId && list.length > 0) {
      const allIds = [];
      list.forEach(c => {
        allIds.push(c.id);
        c.replies.forEach(r => allIds.push(r.id));
      });
      const likedList = await prisma.like.findMany({
        where: { userId: req.userId, targetType: 'comment', targetId: { in: allIds } },
        select: { targetId: true },
      });
      const likedSet = new Set(likedList.map(l => l.targetId));
      list.forEach(c => {
        c.isLiked = likedSet.has(c.id);
        c.replies.forEach(r => { r.isLiked = likedSet.has(r.id); });
      });
    }

    return res.json(paginate(list, page, pageSize, total));
  } catch (err) {
    console.error('Comment list error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

module.exports = router;
