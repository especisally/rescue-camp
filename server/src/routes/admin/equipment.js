const express = require('express');
const prisma = require('../../services/prisma');
const { adminList, adminCreate, adminUpdate, adminDelete } = require('../../services/adminCrud');
const { adminAuth } = require('../../middleware/adminAuth');

const router = express.Router();
router.use(adminAuth);

// ==================== 装备 CRUD ====================

router.get('/', async (req, res) => {
  const categories = await prisma.category.findMany({ where: { type: 'equipment', status: 1 } });
  await adminList({
    model: 'equipment', req, res, view: 'equipment/list',
    include: { category: true },
    searchField: 'name',
    extraData: { title: '器材装备管理', categories },
  });
});

router.get('/create', async (req, res) => {
  const categories = await prisma.category.findMany({ where: { type: 'equipment', status: 1 } });
  res.render('equipment/form', { title: '新增装备', equipment: {}, categories, isEdit: false, errors: {} });
});

router.post('/', async (req, res) => {
  await adminCreate({ model: 'equipment', req, res, redirect: '/admin/equipment' });
});

router.get('/:id/edit', async (req, res) => {
  const [equipment, categories] = await Promise.all([
    prisma.equipment.findUnique({ where: { id: Number(req.params.id) } }),
    prisma.category.findMany({ where: { type: 'equipment', status: 1 } }),
  ]);
  res.render('equipment/form', { title: '编辑装备', equipment, categories, isEdit: true, errors: {} });
});

router.post('/:id', async (req, res) => {
  await adminUpdate({ model: 'equipment', req, res, redirect: '/admin/equipment' });
});

router.post('/:id/delete', async (req, res) => {
  await adminDelete({ model: 'equipment', req, res, redirect: '/admin/equipment' });
});

// ==================== 报修审批 ====================

/**
 * GET /admin/equipment/repairs — 报修申请列表
 */
router.get('/repairs', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = 20;

    const where = {};
    const [list, total] = await Promise.all([
      prisma.repairRequest.findMany({
        where,
        include: {
          equipment: { select: { id: true, name: true, model: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.repairRequest.count({ where }),
    ]);

    res.render('equipment/repairs', {
      title: '报修审批',
      list,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error('Admin repairs error:', err);
    res.status(500).send('服务器错误');
  }
});

/**
 * POST /admin/equipment/repairs/:id/approve — 通过报修
 */
router.post('/repairs/:id/approve', async (req, res) => {
  try {
    await prisma.repairRequest.update({
      where: { id: Number(req.params.id) },
      data: { status: 2 },
    });
    res.redirect('/admin/equipment/repairs');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/equipment/repairs');
  }
});

/**
 * POST /admin/equipment/repairs/:id/process — 标记处理中
 */
router.post('/repairs/:id/process', async (req, res) => {
  try {
    await prisma.repairRequest.update({
      where: { id: Number(req.params.id) },
      data: { status: 1 },
    });
    res.redirect('/admin/equipment/repairs');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/equipment/repairs');
  }
});

// ==================== 领用审批 ====================

/**
 * GET /admin/equipment/requisitions — 领用申请列表
 */
router.get('/requisitions', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = 20;

    const where = {};
    const [list, total] = await Promise.all([
      prisma.requisitionForm.findMany({
        where,
        include: {
          equipment: { select: { id: true, name: true, model: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.requisitionForm.count({ where }),
    ]);

    res.render('equipment/requisitions', {
      title: '领用审批',
      list,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error('Admin requisitions error:', err);
    res.status(500).send('服务器错误');
  }
});

/**
 * POST /admin/equipment/requisitions/:id/approve — 通过领用
 */
router.post('/requisitions/:id/approve', async (req, res) => {
  try {
    await prisma.requisitionForm.update({
      where: { id: Number(req.params.id) },
      data: { status: 2 },
    });
    res.redirect('/admin/equipment/requisitions');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/equipment/requisitions');
  }
});

/**
 * POST /admin/equipment/requisitions/:id/reject — 拒绝领用
 */
router.post('/requisitions/:id/reject', async (req, res) => {
  try {
    await prisma.requisitionForm.update({
      where: { id: Number(req.params.id) },
      data: { status: -1 },
    });
    res.redirect('/admin/equipment/requisitions');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/equipment/requisitions');
  }
});

module.exports = router;
