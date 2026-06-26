require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  sessionSecret: process.env.SESSION_SECRET,
  wechatAppId: process.env.WECHAT_APPID,
  wechatSecret: process.env.WECHAT_SECRET,
  upload: {
    imageMaxSize: Number(process.env.UPLOAD_MAX_SIZE_IMAGE) || 10485760,
    videoMaxSize: Number(process.env.UPLOAD_MAX_SIZE_VIDEO) || 524288000,
    dir: process.env.UPLOAD_DIR || 'uploads',
  },
};
