const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../../config');
const { success, fail } = require('../../utils/response');
const { requireAuth } = require('../../middleware/apiAuth');

const router = express.Router();

// 确保上传目录存在
const uploadBase = path.join(__dirname, '..', '..', '..', config.upload.dir);
['images', 'videos', 'files'].forEach(dir => {
  const p = path.join(uploadBase, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// Multer 存储配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 根据文件类型放入不同子目录
    let subDir = 'files';
    if (file.mimetype.startsWith('image/')) subDir = 'images';
    else if (file.mimetype.startsWith('video/')) subDir = 'videos';
    cb(null, path.join(uploadBase, subDir));
  },
  filename: function (req, file, cb) {
    // 文件名格式：时间戳_随机数.扩展名
    const ext = path.extname(file.originalname) || '.jpg';
    const name = Date.now() + '_' + Math.random().toString(36).substring(2, 8) + ext;
    cb(null, name);
  },
});

// 文件类型白名单
const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const videoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
const fileTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Multer 实例
const uploadImage = multer({
  storage,
  limits: { fileSize: config.upload.imageMaxSize }, // 10MB
  fileFilter: (req, file, cb) => {
    if (imageTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('不支持的图片格式，仅允许 jpg/png/gif/webp'));
  },
});

const uploadVideo = multer({
  storage,
  limits: { fileSize: config.upload.videoMaxSize }, // 500MB
  fileFilter: (req, file, cb) => {
    if (videoTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('不支持的视频格式，仅允许 mp4/mov/avi'));
  },
});

const uploadFile = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (fileTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('不支持的文档格式，仅允许 pdf/doc/docx'));
  },
});

/**
 * POST /api/upload/image — 上传图片
 * 返回：{ url: "/uploads/images/xxx.jpg" }
 */
router.post('/image', requireAuth, (req, res) => {
  uploadImage.single('file')(req, res, function (err) {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(422).json(fail(422, '图片大小不能超过 10MB'));
      }
      return res.status(422).json(fail(422, err.message || '上传失败'));
    }
    if (!req.file) {
      return res.status(422).json(fail(422, '请选择图片文件'));
    }
    const url = '/uploads/images/' + req.file.filename;
    return res.json(success({ url, filename: req.file.filename }));
  });
});

/**
 * POST /api/upload/video — 上传视频
 * 返回：{ url: "/uploads/videos/xxx.mp4" }
 */
router.post('/video', requireAuth, (req, res) => {
  uploadVideo.single('file')(req, res, function (err) {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(422).json(fail(422, '视频大小不能超过 500MB'));
      }
      return res.status(422).json(fail(422, err.message || '上传失败'));
    }
    if (!req.file) {
      return res.status(422).json(fail(422, '请选择视频文件'));
    }
    const url = '/uploads/videos/' + req.file.filename;
    return res.json(success({ url, filename: req.file.filename }));
  });
});

/**
 * POST /api/upload/file — 上传文档
 * 返回：{ url: "/uploads/files/xxx.pdf" }
 */
router.post('/file', requireAuth, (req, res) => {
  uploadFile.single('file')(req, res, function (err) {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(422).json(fail(422, '文件大小不能超过 50MB'));
      }
      return res.status(422).json(fail(422, err.message || '上传失败'));
    }
    if (!req.file) {
      return res.status(422).json(fail(422, '请选择文件'));
    }
    const url = '/uploads/files/' + req.file.filename;
    return res.json(success({ url, filename: req.file.filename }));
  });
});

module.exports = router;
