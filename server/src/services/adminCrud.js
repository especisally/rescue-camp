/**
 * 后台通用 CRUD 辅助
 * 每个内容模块的后台管理都遵循相同的模式：
 *   列表页(分页+搜索) → 新增表单 → 编辑表单 → 保存 → 软删除
 *
 * 使用方式（以视频为例）：
 *   const { adminList, adminCreate, adminUpdate, adminDelete } = require('../../services/adminCrud');
 *   router.get('/', (req, res) => adminList({ model:'video', req, res, view:'videos/list', include:{category:true} }));
 */

const prisma = require('./prisma');

/**
 * GET — 列表页
 * @param {string}  options.model      — Prisma 模型名
 * @param {object}  options.req        — Express req
 * @param {object}  options.res        — Express res
 * @param {string}  options.view       — EJS 模板路径
 * @param {object}  options.include    — Prisma include
 * @param {object}  options.orderBy    — 排序（默认 createdAt desc）
 * @param {string}  options.searchField — 搜索字段（默认 title）
 * @param {object}  options.extraData  — 额外传给模板的数据（如分类列表）
 */
async function adminList({ model, req, res, view, include, orderBy, searchField = 'title', extraData = {} }) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const pageSize = 20;
  const { keyword, categoryId } = req.query;

  const where = { status: { not: -1 } };
  if (keyword) where[searchField] = { contains: keyword };
  if (categoryId) where.categoryId = Number(categoryId);

  const [list, total] = await Promise.all([
    prisma[model].findMany({
      where,
      include,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: orderBy || { createdAt: 'desc' },
    }),
    prisma[model].count({ where }),
  ]);

  res.render(view, {
    title: extraData.title || '列表',
    list,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
    keyword: keyword || '',
    categoryId: categoryId || '',
    ...extraData,
  });
}

/**
 * POST — 保存新增（从 req.body 直接创建）
 * @param {string}  options.model     — Prisma 模型名
 * @param {object}  options.req       — Express req
 * @param {object}  options.res       — Express res
 * @param {string}  options.redirect  — 保存后跳转的路径
 * @param {function} options.transform — 对 req.body 做预处理
 */
async function adminCreate({ model, req, res, redirect, transform }) {
  let data = { ...req.body };

  // 类型转换
  if (data.categoryId) data.categoryId = Number(data.categoryId);
  if (data.points) data.points = Number(data.points);
  if (data.duration) data.duration = Number(data.duration);
  if (data.sort) data.sort = Number(data.sort);
  if (data.status !== undefined) data.status = Number(data.status);
  if (data.targetId) data.targetId = Number(data.targetId);

  // JSON 字段自动解析（支持 Json 类型字段，如表单中的 properties/steps/specs/items 等）
  data = parseJsonFields(data);

  // 自定义转换
  if (transform) data = transform(data);

  // 删除空字符串字段（避免 Prisma 将空字符串写入非字符串字段）
  data = removeEmptyStrings(data);

  await prisma[model].create({ data });
  res.redirect(redirect);
}

/**
 * POST — 更新
 */
async function adminUpdate({ model, req, res, redirect, transform }) {
  const id = Number(req.params.id);
  let data = { ...req.body };

  if (data.categoryId) data.categoryId = Number(data.categoryId);
  if (data.points) data.points = Number(data.points);
  if (data.duration) data.duration = Number(data.duration);
  if (data.sort) data.sort = Number(data.sort);
  if (data.status !== undefined) data.status = Number(data.status);
  if (data.targetId) data.targetId = Number(data.targetId);

  // JSON 字段自动解析
  data = parseJsonFields(data);

  if (transform) data = transform(data);

  // 删除空字符串字段
  data = removeEmptyStrings(data);

  await prisma[model].update({ where: { id }, data });
  res.redirect(redirect);
}

/**
 * POST — 软删除
 */
async function adminDelete({ model, req, res, redirect }) {
  await prisma[model].update({
    where: { id: Number(req.params.id) },
    data: { status: -1 },
  });
  res.redirect(redirect);
}

/**
 * 自动解析 JSON 字符串字段
 * 对于以 { 或 [ 开头的字符串值，尝试解析为 JSON 对象
 */
function parseJsonFields(data) {
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && value.trim()) {
      const trimmed = value.trim();
      if ((trimmed.startsWith('{') || trimmed.startsWith('['))) {
        try {
          data[key] = JSON.parse(trimmed);
        } catch (e) {
          // 解析失败保留原始字符串，让 Prisma 报错
        }
      }
    }
  }
  return data;
}

/**
 * 删除空字符串值（避免 Prisma 类型校验错误）
 */
function removeEmptyStrings(data) {
  for (const [key, value] of Object.entries(data)) {
    if (value === '') {
      delete data[key];
    }
  }
  return data;
}

module.exports = { adminList, adminCreate, adminUpdate, adminDelete };
