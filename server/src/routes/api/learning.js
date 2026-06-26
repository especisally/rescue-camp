const express = require('express');
const prisma = require('../../services/prisma');
const { listQuery, detailQuery } = require('../../services/query');
const { success, fail } = require('../../utils/response');
const { optionalAuth } = require('../../middleware/apiAuth');

const router = express.Router();

// GET /api/learning — 拓展学习列表
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 20));
    const { keyword, type } = req.query;

    const where = { status: 1 };
    if (keyword) where.title = { contains: keyword };
    if (type) where.type = type;  // video / doc

    const [list, total] = await Promise.all([
      prisma.learning.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.learning.count({ where }),
    ]);

    return res.json({
      code: 0, message: 'success',
      data: { list, page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    console.error('Learning list error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

// GET /api/learning/:id — 学习详情
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const learning = await detailQuery({ model: 'learning', id: req.params.id });
    if (!learning || learning.status !== 1) {
      return res.status(404).json(fail(404, '内容不存在'));
    }
    // 增加浏览量
    await prisma.learning.update({
      where: { id: learning.id },
      data: { views: { increment: 1 } },
    });
    return res.json(success(learning));
  } catch (err) {
    console.error('Learning detail error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

module.exports = router;
