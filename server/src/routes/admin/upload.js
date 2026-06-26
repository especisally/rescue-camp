const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../../config');
const { adminAuth } = require('../../middleware/adminAuth');

const router = express.Router();
router.use(adminAuth);

// 确保上传目录存在
const uploadBase = path.join(__dirname, '..', '..', '..', config.upload.dir);
['images', 'videos', 'files'].forEach(function (dir) {
  var p = path.join(uploadBase, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// Multer 存储配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var subDir = 'files';
    if (file.mimetype.startsWith('image/')) subDir = 'images';
    else if (file.mimetype.startsWith('video/')) subDir = 'videos';
    cb(null, path.join(uploadBase, subDir));
  },
  filename: function (req, file, cb) {
    var ext = path.extname(file.originalname) || '.jpg';
    var name = Date.now() + '_' + Math.random().toString(36).substring(2, 8) + ext;
    cb(null, name);
  },
});

// 文件类型白名单
var imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
var videoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
var fileTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Multer 实例
var uploadImage = multer({
  storage: storage,
  limits: { fileSize: config.upload.imageMaxSize },
  fileFilter: function (req, file, cb) {
    if (imageTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('不支持的图片格式，仅允许 jpg/png/gif/webp'));
  },
});

var uploadVideo = multer({
  storage: storage,
  limits: { fileSize: config.upload.videoMaxSize },
  fileFilter: function (req, file, cb) {
    if (videoTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('不支持的视频格式，仅允许 mp4/mov/avi'));
  },
});

var uploadFile = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (fileTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('不支持的文档格式，仅允许 pdf/doc/docx'));
  },
});

/**
 * POST /admin/upload/image — 上传图片
 */
router.post('/image', function (req, res) {
  uploadImage.single('file')(req, res, function (err) {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(422).json({ success: false, message: '图片大小不能超过 10MB' });
      }
      return res.status(422).json({ success: false, message: err.message || '上传失败' });
    }
    if (!req.file) {
      return res.status(422).json({ success: false, message: '请选择图片文件' });
    }
    var url = '/uploads/images/' + req.file.filename;
    return res.json({ success: true, url: url, filename: req.file.filename });
  });
});

/**
 * POST /admin/upload/video — 上传视频
 */
router.post('/video', function (req, res) {
  uploadVideo.single('file')(req, res, function (err) {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(422).json({ success: false, message: '视频大小不能超过 500MB' });
      }
      return res.status(422).json({ success: false, message: err.message || '上传失败' });
    }
    if (!req.file) {
      return res.status(422).json({ success: false, message: '请选择视频文件' });
    }
    var url = '/uploads/videos/' + req.file.filename;
    return res.json({ success: true, url: url, filename: req.file.filename });
  });
});

/**
 * POST /admin/upload/file — 上传文档
 */
router.post('/file', function (req, res) {
  uploadFile.single('file')(req, res, function (err) {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(422).json({ success: false, message: '文件大小不能超过 50MB' });
      }
      return res.status(422).json({ success: false, message: err.message || '上传失败' });
    }
    if (!req.file) {
      return res.status(422).json({ success: false, message: '请选择文件' });
    }
    var url = '/uploads/files/' + req.file.filename;
    return res.json({ success: true, url: url, filename: req.file.filename });
  });
});

module.exports = router;
