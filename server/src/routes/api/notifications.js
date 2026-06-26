const express = require('express');
const prisma = require('../../services/prisma');
const { success, fail, paginate } = require('../../utils/response');
const { requireAuth } = require('../../middleware/apiAuth');

const router = express.Router();

// 所有通知接口都需要登录
router.use(requireAuth);

/**
 * GET /api/notifications — 通知列表（分页，按时间倒序）
 */
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 20));

    const where = { userId: req.userId };
    const [list, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    return res.json(paginate(list, page, pageSize, total));
  } catch (err) {
    console.error('Notifications error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

/**
 * GET /api/notifications/unread-count — 未读通知数
 */
router.get('/unread-count', async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.userId, isRead: false },
    });
    return res.json(success({ count }));
  } catch (err) {
    console.error('Unread count error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

/**
 * POST /api/notifications/:id/read — 标记已读
 */
router.post('/:id/read', async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { id: Number(req.params.id), userId: req.userId },
      data: { isRead: true },
    });
    return res.json(success(null, '已标记为已读'));
  } catch (err) {
    console.error('Mark read error:', err);
    return res.status(500).json(fail(500, '操作失败'));
  }
});

module.exports = router;
