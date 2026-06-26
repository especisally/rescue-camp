const express = require('express');
const prisma = require('../../services/prisma');
const { success, fail, paginate } = require('../../utils/response');
const { requireAuth } = require('../../middleware/apiAuth');

const router = express.Router();

/**
 * GET /api/users/me
 * 获取当前登录用户信息
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        phone: true,
        level: true,
        role: true,
        points: true,
        createdAt: true,
      },
    });
    if (!user) {
      return res.status(404).json(fail(404, '用户不存在'));
    }
    return res.json(success(user));
  } catch (err) {
    console.error('Get user error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

/**
 * PUT /api/users/me
 * 更新用户资料（昵称/头像/手机）
 */
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { nickname, avatar, phone } = req.body;
    const data = {};
    if (nickname !== undefined) data.nickname = nickname;
    if (avatar !== undefined) data.avatar = avatar;
    if (phone !== undefined) data.phone = phone;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: {
        id: true,
        nickname: true,
        avatar: true,
        phone: true,
        level: true,
        role: true,
        points: true,
      },
    });
    return res.json(success(user, '更新成功'));
  } catch (err) {
    console.error('Update user error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

/**
 * POST /api/users/signin
 * 每日签到（+5 积分）
 */
router.post('/signin', requireAuth, async (req, res) => {
  try {
    // 检查今天是否已签到
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.signRecord.findFirst({
      where: {
        userId: req.userId,
        signDate: today,
      },
    });

    if (existing) {
      return res.json(success({ signed: false, points: 0 }, '今日已签到'));
    }

    // 创建签到记录 + 增加积分
    const [signRecord] = await prisma.$transaction([
      prisma.signRecord.create({
        data: {
          userId: req.userId,
          signDate: today,
          points: 5,
        },
      }),
      prisma.user.update({
        where: { id: req.userId },
        data: { points: { increment: 5 } },
      }),
    ]);

    return res.json(success({
      signed: true,
      points: signRecord.points,
    }, '签到成功，+5 积分'));
  } catch (err) {
    console.error('Signin error:', err);
    return res.status(500).json(fail(500, '签到失败'));
  }
});

/**
 * GET /api/users/me/favorites — 我的收藏（分页）
 */
router.get('/me/favorites', requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 20));
    const { targetType } = req.query;

    const where = { userId: req.userId };
    if (targetType) where.targetType = targetType;

    const [list, total] = await Promise.all([
      prisma.favorite.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.favorite.count({ where }),
    ]);

    return res.json(paginate(list, page, pageSize, total));
  } catch (err) {
    console.error('Get favorites error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

/**
 * GET /api/users/me/comments — 我的评论（分页）
 */
router.get('/me/comments', requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 20));

    const where = { userId: req.userId, status: { not: -1 } };
    const [list, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          post: { select: { id: true, title: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.comment.count({ where }),
    ]);

    return res.json(paginate(list, page, pageSize, total));
  } catch (err) {
    console.error('Get comments error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

/**
 * GET /api/users/me/uploads — 我的上传（帖子列表）
 */
router.get('/me/uploads', requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 20));

    const where = { userId: req.userId, status: { not: -1 } };
    const [list, total] = await Promise.all([
      prisma.post.findMany({
        where,
        select: { id: true, title: true, type: true, createdAt: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.post.count({ where }),
    ]);

    return res.json(paginate(list, page, pageSize, total));
  } catch (err) {
    console.error('Get uploads error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

/**
 * GET /api/users/me/progress — 学习进度统计
 */
router.get('/me/progress', requireAuth, async (req, res) => {
  try {
    const [quizCount, quizAvgScore, signCount] = await Promise.all([
      prisma.quizRecord.count({ where: { userId: req.userId } }),
      prisma.quizRecord.aggregate({
        where: { userId: req.userId },
        _avg: { score: true },
      }),
      prisma.signRecord.count({ where: { userId: req.userId } }),
    ]);

    return res.json(success({
      quizCount,
      avgScore: Math.round(quizAvgScore._avg.score || 0),
      signCount,
    }));
  } catch (err) {
    console.error('Get progress error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

module.exports = router;
