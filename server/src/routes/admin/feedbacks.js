const express = require('express');
const prisma = require('../../services/prisma');
const { adminAuth } = require('../../middleware/adminAuth');

const router = express.Router();
router.use(adminAuth);

/**
 * GET /admin/feedbacks — 反馈列表
 */
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = 20;

    const where = {};
    const [list, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        include: { user: { select: { id: true, nickname: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.feedback.count({ where }),
    ]);

    res.render('feedbacks/list', {
      title: '反馈管理',
      list,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error('Admin feedbacks error:', err);
    res.status(500).send('服务器错误');
  }
});

/**
 * POST /admin/feedbacks/:id/reply — 回复反馈
 */
router.post('/:id/reply', async (req, res) => {
  try {
    const { reply } = req.body;
    await prisma.feedback.update({
      where: { id: Number(req.params.id) },
      data: { reply, status: 1 },
    });
    res.redirect('/admin/feedbacks');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/feedbacks');
  }
});

module.exports = router;
