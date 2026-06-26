const express = require('express');
const prisma = require('../../services/prisma');
const { adminAuth } = require('../../middleware/adminAuth');

const router = express.Router();

// 子路由
const authRouter = require('./auth');
const videosRouter = require('./videos');
const trainingsRouter = require('./trainings');
const chemicalsRouter = require('./chemicals');
const standardsRouter = require('./standards');
const equipmentRouter = require('./equipment');
const learningRouter = require('./learning');
const bannersRouter = require('./banners');
const postsRouter = require('./posts');
const quizRouter = require('./quiz');
const usersRouter = require('./users');
const feedbacksRouter = require('./feedbacks');
const settingsRouter = require('./settings');
const uploadRouter = require('./upload');

/**
 * GET /admin — 数据看板
 */
router.get('/', adminAuth, async (req, res) => {
  try {
    const [
      userCount, videoCount, postCount, todaySignCount,
      trainingCount, chemicalCount, equipmentCount, quizBankCount,
      feedbackPendingCount, postPendingCount,
    ] = await Promise.all([
      prisma.user.count({ where: { status: 1 } }),
      prisma.video.count({ where: { status: 1 } }),
      prisma.post.count({ where: { status: 1 } }),
      prisma.signRecord.count({
        where: { signDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
      prisma.training.count({ where: { status: 1 } }),
      prisma.chemical.count({ where: { status: 1 } }),
      prisma.equipment.count({ where: { status: { not: 3 } } }),
      prisma.quizBank.count({ where: { status: 1 } }),
      prisma.feedback.count({ where: { status: 0 } }),
      prisma.post.count({ where: { status: 0 } }),
    ]);

    res.render('dashboard/index', {
      title: '数据看板',
      stats: {
        userCount, videoCount, postCount, todaySignCount,
        trainingCount, chemicalCount, equipmentCount, quizBankCount,
        feedbackPendingCount, postPendingCount,
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.render('dashboard/index', {
      title: '数据看板',
      stats: { userCount: 0, videoCount: 0, postCount: 0, todaySignCount: 0,
        trainingCount: 0, chemicalCount: 0, equipmentCount: 0, quizBankCount: 0,
        feedbackPendingCount: 0, postPendingCount: 0 },
    });
  }
});

// 挂载子路由（auth 不需要 adminAuth，登录页对外开放）
router.use('/', authRouter);
router.use('/videos', videosRouter);
router.use('/trainings', trainingsRouter);
router.use('/chemicals', chemicalsRouter);
router.use('/standards', standardsRouter);
router.use('/equipment', equipmentRouter);
router.use('/learning', learningRouter);
router.use('/banners', bannersRouter);
router.use('/posts', postsRouter);
router.use('/quiz', quizRouter);
router.use('/users', usersRouter);
router.use('/feedbacks', feedbacksRouter);
router.use('/settings', settingsRouter);
router.use('/upload', uploadRouter);

module.exports = router;
