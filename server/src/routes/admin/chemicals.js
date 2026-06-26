const express = require('express');
const prisma = require('../../services/prisma');
const { adminList, adminCreate, adminUpdate, adminDelete } = require('../../services/adminCrud');
const { adminAuth } = require('../../middleware/adminAuth');

const router = express.Router();
router.use(adminAuth);

router.get('/', async (req, res) => {
  await adminList({
    model: 'chemical', req, res, view: 'chemicals/list',
    searchField: 'name',
    extraData: { title: '危化品管理' },
  });
});

router.get('/create', (req, res) => {
  res.render('chemicals/form', { title: '新增危化品', chemical: {}, isEdit: false, errors: {} });
});

router.post('/', async (req, res) => {
  await adminCreate({ model: 'chemical', req, res, redirect: '/admin/chemicals' });
});

router.get('/:id/edit', async (req, res) => {
  const chemical = await prisma.chemical.findUnique({ where: { id: Number(req.params.id) } });
  res.render('chemicals/form', { title: '编辑危化品', chemical, isEdit: true, errors: {} });
});

router.post('/:id', async (req, res) => {
  await adminUpdate({ model: 'chemical', req, res, redirect: '/admin/chemicals' });
});

router.post('/:id/delete', async (req, res) => {
  await adminDelete({ model: 'chemical', req, res, redirect: '/admin/chemicals' });
});

module.exports = router;
