const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const path = require('path');
const config = require('./config');
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');
const routes = require('./routes');

const app = express();

// CORS
app.use(cors());

// 请求日志
app.use(morgan('short'));

// Body 解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API 频率限制（60秒内最多 60 次请求）
app.use('/api', rateLimiter(60000, 60));

// Session（管理后台用）
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 小时
}));

// 静态文件
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/admin/assets', express.static(path.join(__dirname, '..', 'public', 'admin')));

// EJS 模板
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// 路由
app.use(routes);

// 错误处理
app.use(errorHandler);

module.exports = app;
