const express = require('express');
const prisma = require('../../services/prisma');
const { listQuery, detailQuery } = require('../../services/query');
const { success, fail } = require('../../utils/response');
const { optionalAuth } = require('../../middleware/apiAuth');

const router = express.Router();

// GET /api/equipment — 器材装备列表
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 20));
    const { keyword, categoryId } = req.query;

    const where = { status: { not: 3 } };  // 排除已报废
    if (keyword) where.name = { contains: keyword };
    if (categoryId) where.categoryId = Number(categoryId);

    const [list, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        include: { category: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.equipment.count({ where }),
    ]);

    return res.json({
      code: 0, message: 'success',
      data: { list, page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    console.error('Equipment list error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

// GET /api/equipment/:id — 装备详情
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const equipment = await prisma.equipment.findFirst({
      where: { id: Number(req.params.id) },
      include: { category: true },
    });
    if (!equipment) return res.status(404).json(fail(404, '装备不存在'));
    return res.json(success(equipment));
  } catch (err) {
    console.error('Equipment detail error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

module.exports = router;
