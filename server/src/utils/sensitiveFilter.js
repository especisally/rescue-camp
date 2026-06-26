/**
 * 敏感词过滤工具
 * 用于论坛发帖/评论内容审核
 * 生产环境可替换为专业敏感词库或第三方 API
 */

// 内置敏感词库（可根据实际需要扩充）
const SENSITIVE_WORDS = [
  // 政治敏感
  '习近平', '习大大', '习包子',
  // 暴恐
  '恐怖分子', '恐怖袭击',
  // 色情
  '色情', '裸体', '成人',
  // 赌博
  '赌博', '赌场', '博彩',
  // 毒品
  '毒品', '吸毒', '大麻',
  // 诈骗
  '诈骗', '传销',
];

// 替换字符
const REPLACE_CHAR = '*';

/**
 * 检测文本是否包含敏感词
 * @param {string} text - 待检测文本
 * @returns {{ hasSensitive: boolean, words: string[] }}
 */
function detect(text) {
  if (!text || typeof text !== 'string') {
    return { hasSensitive: false, words: [] };
  }

  const found = [];
  const lowerText = text.toLowerCase();

  for (const word of SENSITIVE_WORDS) {
    if (lowerText.includes(word.toLowerCase())) {
      found.push(word);
    }
  }

  return { hasSensitive: found.length > 0, words: found };
}

/**
 * 过滤敏感词（替换为 *）
 * @param {string} text - 待过滤文本
 * @returns {string} 过滤后的文本
 */
function filter(text) {
  if (!text || typeof text !== 'string') return text;

  let result = text;
  for (const word of SENSITIVE_WORDS) {
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, REPLACE_CHAR.repeat(word.length));
  }
  return result;
}

/**
 * 批量检测多个字段
 * @param {object} fields - { fieldName: fieldValue }
 * @returns {{ hasSensitive: boolean, fields: string[] }}
 */
function detectFields(fields) {
  const sensitiveFields = [];
  for (const [name, value] of Object.entries(fields)) {
    if (detect(value).hasSensitive) {
      sensitiveFields.push(name);
    }
  }
  return { hasSensitive: sensitiveFields.length > 0, fields: sensitiveFields };
}

module.exports = { detect, filter, detectFields };
