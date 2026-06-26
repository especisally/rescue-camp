const express = require('express');
const prisma = require('../../services/prisma');
const { adminList, adminCreate, adminUpdate, adminDelete } = require('../../services/adminCrud');
const { adminAuth } = require('../../middleware/adminAuth');

const router = express.Router();
router.use(adminAuth);

const STD_CATEGORIES = ['体能考核', '技能考核', '理论考核', '综合考核'];

router.get('/', async (req, res) => {
  await adminList({
    model: 'standard', req, res, view: 'standards/list',
    searchField: 'title',
    extraData: { title: '考核标准管理', categories: STD_CATEGORIES },
  });
});

router.get('/create', (req, res) => {
  res.render('standards/form', { title: '新增考核标准', standard: {}, categories: STD_CATEGORIES, isEdit: false, errors: {} });
});

router.post('/', async (req, res) => {
  await adminCreate({ model: 'standard', req, res, redirect: '/admin/standards' });
});

router.get('/:id/edit', async (req, res) => {
  const standard = await prisma.standard.findUnique({ where: { id: Number(req.params.id) } });
  res.render('standards/form', { title: '编辑考核标准', standard, categories: STD_CATEGORIES, isEdit: true, errors: {} });
});

router.post('/:id', async (req, res) => {
  await adminUpdate({ model: 'standard', req, res, redirect: '/admin/standards' });
});

router.post('/:id/delete', async (req, res) => {
  await adminDelete({ model: 'standard', req, res, redirect: '/admin/standards' });
});

module.exports = router;
