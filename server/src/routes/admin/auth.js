const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../../services/prisma');
const { adminAuth } = require('../../middleware/adminAuth');

const router = express.Router();

/**
 * GET /admin/login
 * 后台登录页
 */
router.get('/login', (req, res) => {
  if (req.session && req.session.adminId) {
    return res.redirect('/admin');
  }
  res.render('login', { error: null });
});

/**
 * POST /admin/login
 * 处理登录表单提交
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render('login', { error: '请输入用户名和密码' });
    }

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin || admin.status === 0) {
      return res.render('login', { error: '用户名或密码错误' });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.render('login', { error: '用户名或密码错误' });
    }

    req.session.adminId = admin.id;
    req.session.adminUsername = admin.username;
    return res.redirect('/admin');
  } catch (err) {
    console.error('Admin login error:', err);
    return res.render('login', { error: '登录失败，请重试' });
  }
});

/**
 * GET /admin/logout
 * 退出登录
 */
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

module.exports = router;
