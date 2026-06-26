const express = require('express');
const prisma = require('../../services/prisma');
const { success, fail } = require('../../utils/response');

const router = express.Router();

// GET /api/banners — 首页 Banner 列表
router.get('/', async (req, res) => {
  try {
    const list = await prisma.banner.findMany({
      where: { status: 1 },
      orderBy: { sort: 'asc' },
    });
    return res.json(success(list));
  } catch (err) {
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

// GET /api/recommends — 首页推荐内容
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
