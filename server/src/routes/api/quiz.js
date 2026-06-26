const express = require('express');
const prisma = require('../../services/prisma');
const { success, fail, paginate } = require('../../utils/response');
const { optionalAuth, requireAuth } = require('../../middleware/apiAuth');

const router = express.Router();

/**
 * GET /api/quiz/banks — 题库列表
 */
router.get('/banks', optionalAuth, async (req, res) => {
  try {
    const { categoryId } = req.query;
    const where = { status: 1 };
    if (categoryId) where.categoryId = Number(categoryId);

    const list = await prisma.quizBank.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(success(list));
  } catch (err) {
    console.error('Quiz banks error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

/**
 * GET /api/quiz/banks/:id — 题库详情
 */
router.get('/banks/:id', optionalAuth, async (req, res) => {
  try {
    const bank = await prisma.quizBank.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { questions: true } },
      },
    });
    if (!bank || bank.status !== 1) return res.status(404).json(fail(404, '题库不存在'));
    return res.json(success(bank));
  } catch (err) {
    console.error('Quiz bank detail error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

/**
 * GET /api/quiz/banks/:id/questions — 题目列表（分页，默认每页 10 题）
 */
router.get('/banks/:id/questions', optionalAuth, async (req, res) => {
  try {
    const bankId = Number(req.params.id);
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 10));

    const where = { bankId };
    const [list, total] = await Promise.all([
      prisma.quizQuestion.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'asc' },
      }),
      prisma.quizQuestion.count({ where }),
    ]);

    // 返回题目时隐藏正确答案（客户端按需请求）
    const safeList = list.map(q => ({
      id: q.id,
      bankId: q.bankId,
      type: q.type,
      question: q.question,
      options: q.options,
      explanation: q.explanation,
    }));

    return res.json(paginate(safeList, page, pageSize, total));
  } catch (err) {
    console.error('Quiz questions error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

/**
 * POST /api/quiz/submit — 提交答题
 * Body: { bankId, answers: [{ questionId, selected }], duration }
 * 后端自动判分，返回得分和每题正误
 */
router.post('/submit', requireAuth, async (req, res) => {
  try {
    const { bankId, answers, duration } = req.body;
    if (!bankId || !answers || !Array.isArray(answers)) {
      return res.status(422).json(fail(422, '参数错误'));
    }

    // 获取所有题目的正确答案
    const questionIds = answers.map(a => a.questionId);
    const questions = await prisma.quizQuestion.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, correctAnswer: true, type: true },
    });

    const answerMap = {};
    questions.forEach(q => { answerMap[q.id] = q; });

    // 判分
    let score = 0;
    const results = answers.map(a => {
      const q = answerMap[a.questionId];
      if (!q) return { questionId: a.questionId, correct: false, correctAnswer: '' };

      let isCorrect = false;
      if (q.type === 'multi') {
        // 多选题：比较排序后的字符串（如 "A,B"）
        const userAnswer = (a.selected || '').split(',').sort().join(',');
        const correct = q.correctAnswer.split(',').sort().join(',');
        isCorrect = userAnswer === correct;
      } else {
        isCorrect = (a.selected || '').trim() === q.correctAnswer.trim();
      }

      if (isCorrect) score++;
      return {
        questionId: a.questionId,
        selected: a.selected,
        correct: isCorrect,
        correctAnswer: q.correctAnswer,
      };
    });

    const total = questions.length;

    // 保存答题记录
    const record = await prisma.quizRecord.create({
      data: {
        userId: req.userId,
        bankId: Number(bankId),
        score,
        total,
        answers: results,
        duration: duration || 0,
      },
    });

    return res.json(success({
      recordId: record.id,
      score,
      total,
      accuracy: total > 0 ? Math.round((score / total) * 100) : 0,
      results,
      duration: record.duration,
    }, '交卷成功'));
  } catch (err) {
    console.error('Quiz submit error:', err);
    return res.status(500).json(fail(500, '交卷失败'));
  }
});

/**
 * GET /api/quiz/records — 答题历史
 */
router.get('/records', requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 20));

    const where = { userId: req.userId };
    const [list, total] = await Promise.all([
      prisma.quizRecord.findMany({
        where,
        include: { bank: { select: { id: true, title: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.quizRecord.count({ where }),
    ]);

    return res.json(paginate(list, page, pageSize, total));
  } catch (err) {
    console.error('Quiz records error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

/**
 * GET /api/quiz/records/wrong — 错题本（筛选含错题的记录，score < total）
 */
router.get('/records/wrong', requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 20));

    // Prisma 不支持 where 中比较两个字段，使用 $queryRaw 获取有错题的记录
    const totalResult = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as cnt FROM quiz_records WHERE user_id = ? AND score < total`,
      req.userId
    );
    const total = Number(totalResult[0].cnt);

    const list = await prisma.$queryRawUnsafe(
      `SELECT qr.*, qb.title as bank_title FROM quiz_records qr
       LEFT JOIN quiz_banks qb ON qr.bank_id = qb.id
       WHERE qr.user_id = ? AND qr.score < qr.total
       ORDER BY qr.created_at DESC
       LIMIT ? OFFSET ?`,
      req.userId, pageSize, (page - 1) * pageSize
    );

    // 格式化返回
    const formatted = list.map(r => ({
      id: r.id,
      userId: r.user_id,
      bankId: r.bank_id,
      score: r.score,
      total: r.total,
      answers: typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers,
      duration: r.duration,
      createdAt: r.created_at,
      bank: { id: r.bank_id, title: r.bank_title || '' },
    }));

    return res.json(paginate(formatted, page, pageSize, total));
  } catch (err) {
    console.error('Quiz wrong records error:', err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

module.exports = router;
