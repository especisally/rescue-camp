const express = require('express');
const prisma = require('../../services/prisma');
const { success, fail, paginate } = require('../../utils/response');

const router = express.Router();

/**
 * GET /api/search?type=video|post|equipment|learning&keyword=X&page=X
 * 全局搜索：按 type 在不同表中搜索
 */
router.get('/', async (req, res) => {
  try {
    const { type = 'video', keyword, page: pageStr } = req.query;
    const page = Math.max(1, parseInt(pageStr) || 1);
    const pageSize = 20;

    if (!keyword) {
      return res.json(paginate([], page, pageSize, 0));
    }

    let list = [], total = 0;

    switch (type) {
      case 'video': {
        const where = { status: 1, title: { contains: keyword } };
        [list, total] = await Promise.all([
          prisma.video.findMany({
            where,
            include: { category: { select: { id: true, name: true } } },
            skip: (page - 1) * pageSize, take: pageSize,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.video.count({ where }),
        ]);
        break;
      }
      case 'post': {
        const where = {
          status: 1,
          OR: [{ title: { contains: keyword } }, { content: { contains: keyword } }],
        };
        [list, total] = await Promise.all([
          prisma.post.findMany({
            where,
            include: {
              user: { select: { id: true, nickname: true, avatar: true } },
            },
            skip: (page - 1) * pageSize, take: pageSize,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.post.count({ where }),
        ]);
        break;
      }
      case 'equipment': {
        const where = { status: { not: 3 }, name: { contains: keyword } };
        [list, total] = await Promise.all([
          prisma.equipment.findMany({
            where,
            include: { category: { select: { id: true, name: true } } },
            skip: (page - 1) * pageSize, take: pageSize,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.equipment.count({ where }),
        ]);
        break;
      }
      case 'learning': {
        const where = { status: 1, title: { contains: keyword } };
        [list, total] = await Promise.all([
          prisma.learning.findMany({
            where,
            skip: (page - 1) * pageSize, take: pageSize,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.learning.count({ where }),
        ]);
        break;
      }
      default:
        return res.status(422).json(fail(422, '不支持搜索类型'));
    }

    return res.json(paginate(list, page, pageSize, total));
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json(fail(500, '搜索失败'));
  }
});

module.exports = router;
