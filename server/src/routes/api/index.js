const express = require('express');
const prisma = require('../../services/prisma');
const { success, fail } = require('../../utils/response');

const router = express.Router();

// 各模块子路由
const authRouter = require('./auth');
const usersRouter = require('./users');
const videosRouter = require('./videos');
const trainingsRouter = require('./trainings');
const chemicalsRouter = require('./chemicals');
const standardsRouter = require('./standards');
const equipmentRouter = require('./equipment');
const learningRouter = require('./learning');
const bannersRouter = require('./banners');
const uploadRouter = require('./upload');
const postsRouter = require('./posts');
const commentsRouter = require('./comments');
const quizRouter = require('./quiz');
const searchRouter = require('./search');
const notificationsRouter = require('./notifications');
const feedbackRouter = require('./feedback');

/**
 * GET /api/health — 健康检查
 */
router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json(success({
      status: 'ok',
      db: 'connected',
      uptime: process.uptime(),
      version: '0.2.0',
    }));
  } catch (err) {
    return res.status(500).json(fail(500, '服务异常'));
  }
});

// 挂载子路由
router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/videos', videosRouter);
router.use('/trainings', trainingsRouter);
router.use('/chemicals', chemicalsRouter);
router.use('/standards', standardsRouter);
router.use('/equipment', equipmentRouter);
router.use('/learning', learningRouter);
router.use('/banners', bannersRouter);     // GET /api/banners
router.use('/upload', uploadRouter);      // POST /api/upload/image|video|file
router.use('/posts', postsRouter);        // 论坛帖子
router.use('/comments', commentsRouter);  // 评论
router.use('/quiz', quizRouter);          // 刷题系统
router.use('/search', searchRouter);      // 全局搜索
router.use('/notifications', notificationsRouter); // 消息通知
router.use('/feedback', feedbackRouter);  // 意见反馈

// GET /api/recommends — 首页推荐（放在这里避免和 banners 路由冲突）
router.get('/recommends', async (req, res) => {
  try {
    const list = await prisma.recommend.findMany({
      where: { status: 1 },
      orderBy: { sort: 'asc' },
      take: 10,
    });
    return res.json(success(list));
  } catch (err) {
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

module.exports = router;
