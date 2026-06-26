const express = require('express');
const prisma = require('../../services/prisma');
const { adminAuth } = require('../../middleware/adminAuth');

const router = express.Router();
router.use(adminAuth);

// GET /admin/banners — Banner + 推荐列表
router.get('/', async (req, res) => {
  const [banners, recommends] = await Promise.all([
    prisma.banner.findMany({ where: { status: { not: -1 } }, orderBy: { sort: 'asc' } }),
    prisma.recommend.findMany({ where: { status: { not: -1 } }, orderBy: { sort: 'asc' } }),
  ]);
  res.render('banners/list', { title: '轮播图 & 推荐管理', banners, recommends });
});

// POST /admin/banners — 新增 Banner
router.post('/banner', async (req, res) => {
  await prisma.banner.create({
    data: {
      title: req.body.title,
      imageUrl: req.body.imageUrl,
      linkUrl: req.body.linkUrl || '',
      sort: Number(req.body.sort) || 0,
    },
  });
  res.redirect('/admin/banners');
});

// POST /admin/banners/:id — 更新 Banner
router.post('/banner/:id', async (req, res) => {
  await prisma.banner.update({
    where: { id: Number(req.params.id) },
    data: {
      title: req.body.title,
      imageUrl: req.body.imageUrl,
      linkUrl: req.body.linkUrl || '',
      sort: Number(req.body.sort) || 0,
      status: Number(req.body.status),
    },
  });
  res.redirect('/admin/banners');
});

// POST /admin/banners/:id/delete — 删除 Banner
router.post('/banner/:id/delete', async (req, res) => {
  await prisma.banner.update({ where: { id: Number(req.params.id) }, data: { status: -1 } });
  res.redirect('/admin/banners');
});

// POST /admin/recommends — 新增推荐
router.post('/recommend', async (req, res) => {
  await prisma.recommend.create({
    data: {
      title: req.body.title,
      type: req.body.type,
      targetId: Number(req.body.targetId) || 0,
      coverUrl: req.body.coverUrl || '',
      tag: req.body.tag || '',
      sort: Number(req.body.sort) || 0,
    },
  });
  res.redirect('/admin/banners');
});

// POST /admin/recommend/:id — 更新推荐
router.post('/recommend/:id', async (req, res) => {
  const { title, type, targetId, coverUrl, tag, sort, status } = req.body;
  await prisma.recommend.update({
    where: { id: Number(req.params.id) },
    data: {
      title,
      type,
      targetId: Number(targetId) || 0,
      coverUrl: coverUrl || '',
      tag: tag || '',
      sort: Number(sort) || 0,
      status: Number(status) || 1,
    },
  });
  res.redirect('/admin/banners');
});

// POST /admin/recommend/:id/delete — 删除推荐
router.post('/recommend/:id/delete', async (req, res) => {
  await prisma.recommend.update({ where: { id: Number(req.params.id) }, data: { status: -1 } });
  res.redirect('/admin/banners');
});

module.exports = router;
