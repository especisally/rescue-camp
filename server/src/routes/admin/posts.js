const express = require('express');
const prisma = require('../../services/prisma');
const { adminAuth } = require('../../middleware/adminAuth');

const router = express.Router();
router.use(adminAuth);

/**
 * GET /admin/posts — 帖子审核列表
 * 支持筛选状态：all / pending(0) / normal(1) / deleted(-1)
 */
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = 20;
    const { keyword, status: statusFilter } = req.query;

    const where = {};
    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { content: { contains: keyword } },
      ];
    }
    if (statusFilter === 'pending') where.status = 0;
    else if (statusFilter === 'deleted') where.status = -1;
    else if (statusFilter === 'all') { /* no filter */ }
    else where.status = { not: -1 }; // default: show normal + pending

    const [list, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          user: { select: { id: true, nickname: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.post.count({ where }),
    ]);

    res.render('posts/list', {
      title: '帖子审核',
      list,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      keyword: keyword || '',
      statusFilter: statusFilter || '',
    });
  } catch (err) {
    console.error('Admin posts error:', err);
    res.status(500).send('服务器错误');
  }
});

/**
 * POST /admin/posts/:id/approve — 审核通过
 */
router.post('/:id/approve', async (req, res) => {
  try {
    await prisma.post.update({
      where: { id: Number(req.params.id) },
      data: { status: 1 },
    });
    res.redirect('/admin/posts');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/posts');
  }
});

/**
 * POST /admin/posts/:id/reject — 拒绝（软删除）
 */
router.post('/:id/reject', async (req, res) => {
  try {
    await prisma.post.update({
      where: { id: Number(req.params.id) },
      data: { status: -1 },
    });
    res.redirect('/admin/posts');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/posts');
  }
});

/**
 * POST /admin/posts/:id/essence — 切换精华
 */
router.post('/:id/essence', async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: Number(req.params.id) } });
    await prisma.post.update({
      where: { id: post.id },
      data: { isEssence: !post.isEssence },
    });
    res.redirect('/admin/posts');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/posts');
  }
});

/**
 * POST /admin/posts/:id/delete — 软删除
 */
router.post('/:id/delete', async (req, res) => {
  try {
    await prisma.post.update({
      where: { id: Number(req.params.id) },
      data: { status: -1 },
    });
    res.redirect('/admin/posts');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/posts');
  }
});

module.exports = router;
