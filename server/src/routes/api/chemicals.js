const express = require('express');
const prisma = require('../../services/prisma');
const { listQuery, detailQuery } = require('../../services/query');
const { success, fail } = require('../../utils/response');
const { optionalAuth } = require('../../middleware/apiAuth');

const router = express.Router();

// GET /api/chemicals — 危化品列表（搜索+分类+分页）
router.get('/', optionalAuth, async (req, res) => {
  try {
    const result = await listQuery({
      model: 'chemical',
      req,
      where: { status: 1 },
      searchField: 'name',  // 危化品按名称搜索
    });
    return res.json(result);
  } catch (err) {
    console.error('Chemical list error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

// GET /api/chemicals/:id — 危化品详情
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const chemical = await detailQuery({
      model: 'chemical',
      id: req.params.id,
    });
    if (!chemical || chemical.status !== 1) {
      return res.status(404).json(fail(404, '危化品不存在'));
    }
    return res.json(success(chemical));
  } catch (err) {
    console.error('Chemical detail error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

module.exports = router;
