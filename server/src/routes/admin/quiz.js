const express = require('express');
const prisma = require('../../services/prisma');
const { adminAuth } = require('../../middleware/adminAuth');

const router = express.Router();
router.use(adminAuth);

// ==================== 题库管理 ====================

/**
 * GET /admin/quiz/banks — 题库列表
 */
router.get('/banks', async (req, res) => {
  try {
    const list = await prisma.quizBank.findMany({
      where: { status: { not: -1 } },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.render('quiz/banks', { title: '题库管理', list });
  } catch (err) {
    console.error(err);
    res.status(500).send('服务器错误');
  }
});

/**
 * GET /admin/quiz/banks/create — 新增题库表单
 */
router.get('/banks/create', async (req, res) => {
  const categories = await prisma.category.findMany({ where: { type: 'quiz', status: 1 } });
  res.render('quiz/bank-form', { title: '新增题库', bank: {}, categories, isEdit: false, errors: {} });
});

/**
 * POST /admin/quiz/banks — 保存新增题库
 */
router.post('/banks', async (req, res) => {
  try {
    const { title, categoryId, icon } = req.body;
    await prisma.quizBank.create({
      data: {
        title,
        categoryId: Number(categoryId),
        icon: icon || '',
      },
    });
    res.redirect('/admin/quiz/banks');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/quiz/banks/create');
  }
});

/**
 * GET /admin/quiz/banks/:id/edit — 编辑题库
 */
router.get('/banks/:id/edit', async (req, res) => {
  const [bank, categories] = await Promise.all([
    prisma.quizBank.findUnique({ where: { id: Number(req.params.id) } }),
    prisma.category.findMany({ where: { type: 'quiz', status: 1 } }),
  ]);
  if (!bank) return res.redirect('/admin/quiz/banks');
  res.render('quiz/bank-form', { title: '编辑题库', bank, categories, isEdit: true, errors: {} });
});

/**
 * POST /admin/quiz/banks/:id — 更新题库
 */
router.post('/banks/:id', async (req, res) => {
  try {
    const { title, categoryId, icon, status } = req.body;
    await prisma.quizBank.update({
      where: { id: Number(req.params.id) },
      data: {
        title,
        categoryId: Number(categoryId),
        icon: icon || '',
        status: Number(status) || 1,
      },
    });
    res.redirect('/admin/quiz/banks');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/quiz/banks');
  }
});

/**
 * POST /admin/quiz/banks/:id/delete — 软删除题库
 */
router.post('/banks/:id/delete', async (req, res) => {
  await prisma.quizBank.update({
    where: { id: Number(req.params.id) },
    data: { status: -1 },
  });
  res.redirect('/admin/quiz/banks');
});

// ==================== 题目管理 ====================

/**
 * GET /admin/quiz/banks/:bankId/questions — 题目列表
 */
router.get('/banks/:bankId/questions', async (req, res) => {
  try {
    const bankId = Number(req.params.bankId);
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = 20;

    const [bank, questions, total] = await Promise.all([
      prisma.quizBank.findUnique({ where: { id: bankId } }),
      prisma.quizQuestion.findMany({
        where: { bankId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'asc' },
      }),
      prisma.quizQuestion.count({ where: { bankId } }),
    ]);

    if (!bank) return res.redirect('/admin/quiz/banks');

    res.render('quiz/questions', {
      title: `题目管理 — ${bank.title}`,
      bank,
      list: questions,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('服务器错误');
  }
});

/**
 * GET /admin/quiz/banks/:bankId/questions/create — 新增题目
 */
router.get('/banks/:bankId/questions/create', async (req, res) => {
  const bank = await prisma.quizBank.findUnique({ where: { id: Number(req.params.bankId) } });
  if (!bank) return res.redirect('/admin/quiz/banks');
  res.render('quiz/question-form', {
    title: '新增题目',
    bank,
    question: {},
    isEdit: false,
    errors: {},
  });
});

/**
 * POST /admin/quiz/banks/:bankId/questions — 保存新增题目
 */
router.post('/banks/:bankId/questions', async (req, res) => {
  try {
    const bankId = Number(req.params.bankId);
    const { type, question, options, correctAnswer, explanation } = req.body;

    await prisma.quizQuestion.create({
      data: {
        bankId,
        type,
        question,
        options: options ? JSON.parse(options) : null,
        correctAnswer,
        explanation: explanation || '',
      },
    });

    // 更新题库题目数
    const count = await prisma.quizQuestion.count({ where: { bankId } });
    await prisma.quizBank.update({
      where: { id: bankId },
      data: { questionCount: count },
    });

    res.redirect(`/admin/quiz/banks/${bankId}/questions`);
  } catch (err) {
    console.error(err);
    res.redirect(`/admin/quiz/banks/${req.params.bankId}/questions/create`);
  }
});

/**
 * GET /admin/quiz/banks/:bankId/questions/:id/edit — 编辑题目
 */
router.get('/banks/:bankId/questions/:id/edit', async (req, res) => {
  const [bank, question] = await Promise.all([
    prisma.quizBank.findUnique({ where: { id: Number(req.params.bankId) } }),
    prisma.quizQuestion.findUnique({ where: { id: Number(req.params.id) } }),
  ]);
  if (!bank || !question) return res.redirect('/admin/quiz/banks');
  res.render('quiz/question-form', {
    title: '编辑题目',
    bank,
    question,
    isEdit: true,
    errors: {},
  });
});

/**
 * POST /admin/quiz/banks/:bankId/questions/:id — 更新题目
 */
router.post('/banks/:bankId/questions/:id', async (req, res) => {
  try {
    const bankId = Number(req.params.bankId);
    const id = Number(req.params.id);
    const { type, question, options, correctAnswer, explanation } = req.body;

    await prisma.quizQuestion.update({
      where: { id },
      data: {
        type,
        question,
        options: options ? JSON.parse(options) : null,
        correctAnswer,
        explanation: explanation || '',
      },
    });

    res.redirect(`/admin/quiz/banks/${bankId}/questions`);
  } catch (err) {
    console.error(err);
    res.redirect(`/admin/quiz/banks/${req.params.bankId}/questions/${req.params.id}/edit`);
  }
});

/**
 * POST /admin/quiz/banks/:bankId/questions/:id/delete — 删除题目
 */
router.post('/banks/:bankId/questions/:id/delete', async (req, res) => {
  try {
    const bankId = Number(req.params.bankId);
    const id = Number(req.params.id);

    await prisma.quizQuestion.delete({ where: { id } });

    // 更新题库题目数
    const count = await prisma.quizQuestion.count({ where: { bankId } });
    await prisma.quizBank.update({
      where: { id: bankId },
      data: { questionCount: count },
    });

    res.redirect(`/admin/quiz/banks/${bankId}/questions`);
  } catch (err) {
    console.error(err);
    res.redirect(`/admin/quiz/banks/${req.params.bankId}/questions`);
  }
});

module.exports = router;
