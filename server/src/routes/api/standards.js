const express = require('express');
const prisma = require('../../services/prisma');
const { listQuery, detailQuery } = require('../../services/query');
const { success, fail } = require('../../utils/response');
const { optionalAuth } = require('../../middleware/apiAuth');

const router = express.Router();

// GET /api/standards — 考核标准列表
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 20));
    const { keyword, category } = req.query;

    const where = { status: 1 };
    if (keyword) where.title = { contains: keyword };
    if (category) where.category = category;

    const [list, total] = await Promise.all([
      prisma.standard.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.standard.count({ where }),
    ]);

    return res.json({
      code: 0, message: 'success',
      data: { list, page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    console.error('Standard list error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

// GET /api/standards/:id — 考核标准详情
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const standard = await detailQuery({ model: 'standard', id: req.params.id });
    if (!standard || standard.status !== 1) {
      return res.status(404).json(fail(404, '标准不存在'));
    }
    return res.json(success(standard));
  } catch (err) {
    console.error('Standard detail error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

module.exports = router;
