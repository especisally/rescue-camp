const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../../services/prisma');
const { adminAuth } = require('../../middleware/adminAuth');

const router = express.Router();
router.use(adminAuth);

/**
 * GET /admin/settings — 系统设置页（管理员列表 + 修改密码）
 */
router.get('/', async (req, res) => {
  try {
    const admins = await prisma.admin.findMany({
      select: { id: true, username: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    res.render('settings/index', {
      title: '系统设置',
      admins,
      message: req.query.message || null,
      error: req.query.error || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('服务器错误');
  }
});

/**
 * POST /admin/settings/change-password — 修改当前管理员密码
 */
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.redirect('/admin/settings?error=' + encodeURIComponent('密码不能为空'));
    }
    if (newPassword !== confirmPassword) {
      return res.redirect('/admin/settings?error=' + encodeURIComponent('两次新密码不一致'));
    }
    if (newPassword.length < 6) {
      return res.redirect('/admin/settings?error=' + encodeURIComponent('密码至少 6 位'));
    }

    const admin = await prisma.admin.findUnique({ where: { id: req.session.adminId } });
    const valid = await bcrypt.compare(currentPassword, admin.password);
    if (!valid) {
      return res.redirect('/admin/settings?error=' + encodeURIComponent('当前密码不正确'));
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hash },
    });

    return res.redirect('/admin/settings?message=' + encodeURIComponent('密码修改成功'));
  } catch (err) {
    console.error(err);
    return res.redirect('/admin/settings?error=' + encodeURIComponent('操作失败'));
  }
});

module.exports = router;
