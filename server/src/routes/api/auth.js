const express = require('express');
const prisma = require('../../services/prisma');
const wechat = require('../../utils/wechat');
const { signToken } = require('../../utils/jwt');
const { success, fail } = require('../../utils/response');

const router = express.Router();

/**
 * POST /api/auth/login
 * Body: { code: string, nickname?: string, avatar?: string }
 *
 * 微信登录流程：
 * 1. 接收小程序端 wx.login() 返回的 code
 * 2. 用 code 请求微信接口换取 openid
 * 3. 查找或创建用户记录
 * 4. 签发 JWT token 返回
 */
router.post('/login', async (req, res) => {
  try {
    const { code, nickname, avatar } = req.body;
    if (!code) {
      return res.status(422).json(fail(422, '缺少登录凭证 code'));
    }

    // 1. code 换 openid
    const { openid, session_key } = await wechat.code2Session(code);
    if (!openid) {
      return res.status(500).json(fail(500, '微信登录失败，请重试'));
    }

    // 2. 查找或创建用户
    let user = await prisma.user.findUnique({ where: { openid } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          openid,
          nickname: nickname || '消防员',
          avatar: avatar || '',
          role: 'user',
          level: '普通用户',
        },
      });
    }

    if (user.status === 0) {
      return res.status(403).json(fail(403, '账号已被禁用'));
    }

    // 3. 签发 JWT
    const token = signToken({ userId: user.id, role: user.role });

    return res.json(success({
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
        level: user.level,
        role: user.role,
        points: user.points,
      },
    }));

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json(fail(500, '登录失败'));
  }
});

module.exports = router;
