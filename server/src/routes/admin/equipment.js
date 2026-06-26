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

module.exports = router;
