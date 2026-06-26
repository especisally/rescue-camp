/**
 * 工具函数
 */

/**
 * 格式化时间
 * @param {Date|number|string} date - 日期对象或时间戳
 * @param {string} format - 格式字符串（默认 'YYYY-MM-DD'）
 */
function formatTime(date, format) {
  date = date instanceof Date ? date : new Date(date || Date.now());
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  if (format === 'YYYY-MM-DD') {
    return [year, month, day].map(formatNumber).join('-');
  }
  if (format === 'YYYY-MM-DD HH:mm') {
    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':');
  }
  // 默认全格式
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}

function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
}

/**
 * 格式化播放量/点赞数
 * @param {number} num
 * @returns {string}
 */
function formatCount(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return String(num);
}

/**
 * 格式化时长（秒 → mm:ss 或 hh:mm:ss）
 * @param {number} seconds
 * @returns {string}
 */
function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return formatNumber(h) + ':' + formatNumber(m) + ':' + formatNumber(s);
  }
  return formatNumber(m) + ':' + formatNumber(s);
}

/**
 * 获取指定天数前的日期
 * @param {number} days - 天数
 * @returns {Date}
 */
function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 截断文本
 * @param {string} text
 * @param {number} maxLen - 最大长度
 * @returns {string}
 */
function truncate(text, maxLen) {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '…';
}

module.exports = {
  formatTime,
  formatCount,
  formatDuration,
  daysAgo,
  truncate,
};
