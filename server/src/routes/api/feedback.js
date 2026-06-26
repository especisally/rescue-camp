const express = require('express');
const prisma = require('../../services/prisma');
const { success, fail } = require('../../utils/response');
const { requireAuth } = require('../../middleware/apiAuth');

const router = express.Router();

/**
 * POST /api/feedback — 提交反馈
 * Body: { content, images?, contact? }
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { content, images, contact } = req.body;

    if (!content || !content.trim()) {
      return res.status(422).json(fail(422, '反馈内容不能为空'));
    }

    await prisma.feedback.create({
      data: {
        userId: req.userId,
        content: content.trim(),
        images: images || [],
        contact: contact || '',
      },
    });

    return res.json(success(null, '感谢你的反馈！'));
  } catch (err) {
    console.error('Feedback error:', err);
    return res.status(500).json(fail(500, '提交失败'));
  }
});

module.exports = router;
