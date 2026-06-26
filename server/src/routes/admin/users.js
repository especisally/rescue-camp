const express = require('express');
const prisma = require('../../services/prisma');
const { adminAuth } = require('../../middleware/adminAuth');

const router = express.Router();
router.use(adminAuth);

/**
 * GET /admin/users — 用户列表
 */
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = 20;
    const { keyword, role } = req.query;

    const where = {};
    if (keyword) {
      where.OR = [
        { nickname: { contains: keyword } },
        { phone: { contains: keyword } },
      ];
    }
    if (role) where.role = role;

    const [list, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.render('users/list', {
      title: '用户管理',
      list,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      keyword: keyword || '',
      role: role || '',
    });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).send('服务器错误');
  }
});

/**
 * POST /admin/users/:id/ban — 禁用/启用用户
 */
router.post('/:id/ban', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
    if (!user) return res.redirect('/admin/users');

    await prisma.user.update({
      where: { id: user.id },
      data: { status: user.status === 1 ? 0 : 1 },
    });
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/users');
  }
});

/**
 * POST /admin/users/:id/certify — 切换认证状态
 */
router.post('/:id/certify', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
    if (!user) return res.redirect('/admin/users');

    const newRole = user.role === 'certified' ? 'user' : 'certified';
    const newLevel = newRole === 'certified' ? '认证用户' : '普通用户';

    await prisma.user.update({
      where: { id: user.id },
      data: { role: newRole, level: newLevel },
    });
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/users');
  }
});

module.exports = router;
