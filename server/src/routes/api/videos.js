const express = require('express');
const prisma = require('../../services/prisma');
const { listQuery, detailQuery } = require('../../services/query');
const { success, fail } = require('../../utils/response');
const { optionalAuth } = require('../../middleware/apiAuth');

const router = express.Router();

// GET /api/videos — 视频列表（分类/搜索/筛选/分页）
router.get('/', optionalAuth, async (req, res) => {
  try {
    const result = await listQuery({
      model: 'video',
      req,
      where: { status: 1 },
      searchField: 'title',
    });
    return res.json(result);
  } catch (err) {
    console.error('Video list error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

// GET /api/videos/:id — 视频详情
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const video = await detailQuery({
      model: 'video',
      id: req.params.id,
      include: { category: true },
    });
    if (!video || video.status !== 1) {
      return res.status(404).json(fail(404, '视频不存在'));
    }
    return res.json(success(video));
  } catch (err) {
    console.error('Video detail error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

// POST /api/videos/:id/view — 播放量 +1
router.post('/:id/view', async (req, res) => {
  try {
    await prisma.video.update({
      where: { id: Number(req.params.id) },
      data: { views: { increment: 1 } },
    });
    return res.json(success(null, 'ok'));
  } catch (err) {
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

module.exports = router;
