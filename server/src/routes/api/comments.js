const express = require('express');
const prisma = require('../../services/prisma');
const { success, fail } = require('../../utils/response');
const { requireAuth } = require('../../middleware/apiAuth');
const { detect } = require('../../utils/sensitiveFilter');

const router = express.Router();

/**
 * POST /api/comments — 发表评论/回复
 * Body: { postId, content, parentId?, replyToUid? }
 *   parentId=null → 一级评论；parentId≠null → 子回复
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { postId, content, parentId, replyToUid } = req.body;

    if (!postId) return res.status(422).json(fail(422, '缺少帖子 ID'));
    if (!content || !content.trim()) return res.status(422).json(fail(422, '评论内容不能为空'));

    // 敏感词检测
    const check = detect(content);
    if (check.hasSensitive) {
      return res.status(422).json(fail(422, `内容包含敏感词：${check.words.join('、')}`));
    }

    // 验证帖子存在
    const post = await prisma.post.findUnique({ where: { id: Number(postId) } });
    if (!post || post.status !== 1) return res.status(404).json(fail(404, '帖子不存在'));

    // 如果是回复，验证父评论存在
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({ where: { id: Number(parentId) } });
      if (!parentComment) return res.status(404).json(fail(404, '父评论不存在'));
    }

    const comment = await prisma.comment.create({
      data: {
        userId: req.userId,
        postId: Number(postId),
        parentId: parentId ? Number(parentId) : null,
        replyToUid: replyToUid ? Number(replyToUid) : null,
        content: content.trim(),
      },
      include: {
        user: { select: { id: true, nickname: true, avatar: true, level: true } },
      },
    });

    // 更新帖子评论数
    await prisma.post.update({
      where: { id: Number(postId) },
      data: { commentsCount: { increment: 1 } },
    });

    // 通知帖子作者（非自己评论时）
    if (post.userId !== req.userId) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          type: 'comment',
          content: `有人评论了你的帖子`,
          targetType: 'post',
          targetId: post.id,
        },
      });
    }

    // 如果是回复，通知被回复用户
    if (replyToUid && replyToUid !== req.userId) {
      await prisma.notification.create({
        data: {
          userId: replyToUid,
          type: 'comment',
          content: '有人回复了你的评论',
          targetType: 'comment',
          targetId: comment.id,
        },
      });
    }

    return res.json(success(comment, '评论成功'));
  } catch (err) {
    console.error('Comment create error:', err);
    return res.status(500).json(fail(500, '评论失败'));
  }
});

/**
 * DELETE /api/comments/:id — 删除评论（仅作者本人）
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: Number(req.params.id) } });
    if (!comment) return res.status(404).json(fail(404, '评论不存在'));
    if (comment.userId !== req.userId) {
      return res.status(403).json(fail(403, '只能删除自己的评论'));
    }

    await prisma.comment.update({
      where: { id: comment.id },
      data: { status: -1 },
    });

    // 减少帖子评论数
    await prisma.post.update({
      where: { id: comment.postId },
      data: { commentsCount: { decrement: 1 } },
    });

    return res.json(success(null, '删除成功'));
  } catch (err) {
    console.error('Comment delete error:', err);
    return res.status(500).json(fail(500, '删除失败'));
  }
});

/**
 * POST /api/comments/:id/like — 评论点赞/取消
 */
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const commentId = Number(req.params.id);
    const existing = await prisma.like.findFirst({
      where: { userId: req.userId, targetType: 'comment', targetId: commentId },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.like.delete({ where: { id: existing.id } }),
        prisma.comment.update({ where: { id: commentId }, data: { likes: { decrement: 1 } } }),
      ]);
      return res.json(success({ liked: false }, '已取消点赞'));
    } else {
      await prisma.$transaction([
        prisma.like.create({ data: { userId: req.userId, targetType: 'comment', targetId: commentId } }),
        prisma.comment.update({ where: { id: commentId }, data: { likes: { increment: 1 } } }),
      ]);
      return res.json(success({ liked: true }, '点赞成功'));
    }
  } catch (err) {
    console.error('Comment like error:', err);
    return res.status(500).json(fail(500, '操作失败'));
  }
});

module.exports = router;
