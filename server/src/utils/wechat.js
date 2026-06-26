const https = require('https');
const config = require('../config');

/**
 * 微信 code2Session
 * 用小程序 login 获取的 code 换取 openid 和 session_key
 */
function code2Session(code) {
  return new Promise((resolve, reject) => {
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${config.wechatAppId}&secret=${config.wechatSecret}&js_code=${code}&grant_type=authorization_code`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.errcode) {
            console.error('WeChat API error:', json);
          }
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

module.exports = { code2Session };
