const express = require('express');
const prisma = require('../../services/prisma');
const { adminList, adminCreate, adminUpdate, adminDelete } = require('../../services/adminCrud');
const { adminAuth } = require('../../middleware/adminAuth');

const router = express.Router();
router.use(adminAuth);

router.get('/', async (req, res) => {
  const categories = await prisma.category.findMany({ where: { type: 'training', status: 1 } });
  await adminList({
    model: 'training', req, res, view: 'trainings/list',
    include: { category: true },
    extraData: { title: '训练操法管理', categories },
  });
});

router.get('/create', async (req, res) => {
  const categories = await prisma.category.findMany({ where: { type: 'training', status: 1 } });
  res.render('trainings/form', { title: '新增操法', training: {}, categories, isEdit: false, errors: {} });
});

router.post('/', async (req, res) => {
  await adminCreate({ model: 'training', req, res, redirect: '/admin/trainings' });
});

router.get('/:id/edit', async (req, res) => {
  const [training, categories] = await Promise.all([
    prisma.training.findUnique({ where: { id: Number(req.params.id) } }),
    prisma.category.findMany({ where: { type: 'training', status: 1 } }),
  ]);
  res.render('trainings/form', { title: '编辑操法', training, categories, isEdit: true, errors: {} });
});

router.post('/:id', async (req, res) => {
  await adminUpdate({ model: 'training', req, res, redirect: '/admin/trainings' });
});

router.post('/:id/delete', async (req, res) => {
  await adminDelete({ model: 'training', req, res, redirect: '/admin/trainings' });
});

module.exports = router;
