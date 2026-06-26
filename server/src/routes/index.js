const express = require('express');
const appRouter = express.Router();

// API 路由
const apiRouter = require('./api');

// 管理后台路由
const adminRouter = require('./admin');

appRouter.use('/api', apiRouter);
appRouter.use('/admin', adminRouter);

module.exports = appRouter;
