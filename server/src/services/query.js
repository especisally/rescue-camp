/**
 * 通用列表查询辅助
 * 避免每个模块重复写相同的分页/搜索/排序逻辑
 */
const prisma = require('./prisma');
const { paginate, fail } = require('../utils/response');

/**
 * @param {object} options
 * @param {string} options.model     — Prisma 模型名（如 'video'）
 * @param {object} options.req       — Express req（从中读取 query 参数）
 * @param {object} options.where     — 基础 where 条件
 * @param {object} options.include   — Prisma include（关联查询）
 * @param {object} options.select    — Prisma select（字段筛选）
 * @param {object} options.orderBy   — 默认排序
 * @param {string} options.searchField — keyword 搜索的字段名（默认 'title'）
 */
async function listQuery({ model, req, where = {}, include, select, orderBy, searchField = 'title' }) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 20));
  const { keyword, sort } = req.query;

  const finalWhere = { ...where };

  // 关键词搜索
  if (keyword) {
    finalWhere[searchField] = { contains: keyword };
  }

  // 分类筛选
  if (req.query.categoryId) {
    finalWhere.categoryId = Number(req.query.categoryId);
  }

  // 排序
  let finalOrderBy = orderBy || { createdAt: 'desc' };
  if (sort === 'popular') finalOrderBy = { views: 'desc' };
  if (sort === 'oldest') finalOrderBy = { createdAt: 'asc' };

  const findArgs = {
    where: finalWhere,
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: finalOrderBy,
  };
  if (include) findArgs.include = include;
  if (select) findArgs.select = select;

  const [list, total] = await Promise.all([
    prisma[model].findMany(findArgs),
    prisma[model].count({ where: finalWhere }),
  ]);

  return paginate(list, page, pageSize, total);
}

/**
 * 通用详情查询
 */
async function detailQuery({ model, id, include, select }) {
  const args = { where: { id: Number(id) } };
  if (include) args.include = include;
  if (select) args.select = select;

  const item = await prisma[model].findFirst(args);
  return item;
}

module.exports = { listQuery, detailQuery };
