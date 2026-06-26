const express = require('express');
const prisma = require('../../services/prisma');
const { adminList, adminCreate, adminUpdate, adminDelete } = require('../../services/adminCrud');
const { adminAuth } = require('../../middleware/adminAuth');

const router = express.Router();
router.use(adminAuth);

router.get('/', async (req, res) => {
  await adminList({
    model: 'learning', req, res, view: 'learning/list',
    searchField: 'title',
    extraData: { title: '拓展学习管理' },
  });
});

router.get('/create', (req, res) => {
  res.render('learning/form', { title: '新增学习内容', learning: {}, isEdit: false, errors: {} });
});

router.post('/', async (req, res) => {
  await adminCreate({ model: 'learning', req, res, redirect: '/admin/learning' });
});

router.get('/:id/edit', async (req, res) => {
  const learning = await prisma.learning.findUnique({ where: { id: Number(req.params.id) } });
  res.render('learning/form', { title: '编辑学习内容', learning, isEdit: true, errors: {} });
});

router.post('/:id', async (req, res) => {
  await adminUpdate({ model: 'learning', req, res, redirect: '/admin/learning' });
});

router.post('/:id/delete', async (req, res) => {
  await adminDelete({ model: 'learning', req, res, redirect: '/admin/learning' });
});

module.exports = router;
