/**
 * 共享 Prisma 客户端
 * 所有路由通过此模块获取同一个数据库连接实例
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
