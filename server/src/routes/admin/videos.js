const express = require('express');
const prisma = require('../../services/prisma');
const { adminList, adminCreate, adminUpdate, adminDelete } = require('../../services/adminCrud');
const { adminAuth } = require('../../middleware/adminAuth');

const router = express.Router();
router.use(adminAuth);

// GET /admin/videos — 视频列表
router.get('/', async (req, res) => {
  const categories = await prisma.category.findMany({ where: { type: 'video', status: 1 } });
  await adminList({
    model: 'video', req, res, view: 'videos/list',
    include: { category: true },
    extraData: { title: '视频管理', categories },
  });
});

// GET /admin/videos/create — 新增表单
router.get('/create', async (req, res) => {
  const categories = await prisma.category.findMany({ where: { type: 'video', status: 1 } });
  res.render('videos/form', { title: '新增视频', video: {}, categories, isEdit: false, errors: {} });
});

// POST /admin/videos — 保存新增
router.post('/', async (req, res) => {
  await adminCreate({ model: 'video', req, res, redirect: '/admin/videos' });
});

// GET /admin/videos/:id/edit — 编辑表单
router.get('/:id/edit', async (req, res) => {
  const [video, categories] = await Promise.all([
    prisma.video.findUnique({ where: { id: Number(req.params.id) } }),
    prisma.category.findMany({ where: { type: 'video', status: 1 } }),
  ]);
  if (!video) return res.redirect('/admin/videos');
  res.render('videos/form', { title: '编辑视频', video, categories, isEdit: true, errors: {} });
});

// POST /admin/videos/:id — 更新
router.post('/:id', async (req, res) => {
  await adminUpdate({ model: 'video', req, res, redirect: '/admin/videos' });
});

// POST /admin/videos/:id/delete — 软删除
router.post('/:id/delete', async (req, res) => {
  await adminDelete({ model: 'video', req, res, redirect: '/admin/videos' });
});

module.exports = router;
