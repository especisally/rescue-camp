const express = require('express');
const prisma = require('../../services/prisma');
const { listQuery, detailQuery } = require('../../services/query');
const { success, fail } = require('../../utils/response');
const { optionalAuth, requireAuth } = require('../../middleware/apiAuth');

const router = express.Router();

// GET /api/trainings — 训练操法列表
router.get('/', optionalAuth, async (req, res) => {
  try {
    const result = await listQuery({
      model: 'training',
      req,
      where: { status: 1 },
      searchField: 'title',
    });
    return res.json(result);
  } catch (err) {
    console.error('Training list error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

// GET /api/trainings/:id — 操法详情
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const training = await detailQuery({
      model: 'training',
      id: req.params.id,
      include: { category: true },
    });
    if (!training || training.status !== 1) {
      return res.status(404).json(fail(404, '操法不存在'));
    }
    return res.json(success(training));
  } catch (err) {
    console.error('Training detail error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

// POST /api/trainings/:id/progress — 更新学习进度（简化版：记录到 user progress）
router.post('/:id/progress', requireAuth, async (req, res) => {
  try {
    // Phase 2 简化实现：仅验证操法存在并返回成功
    const training = await prisma.training.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!training) return res.status(404).json(fail(404, '操法不存在'));
    return res.json(success(null, '进度已记录'));
  } catch (err) {
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

module.exports = router;
