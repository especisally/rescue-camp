// pages/notification/index.js
const app = getApp();
const { get, post } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 0,
    notifications: [],
    loading: false,
  },

  onLoad: function () {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 44 });
    this.fetchNotifications();
  },

  fetchNotifications: function () {
    const that = this;
    this.setData({ loading: true });
    get('/notifications', { pageSize: 50 }, { auth: true })
      .then(function (data) {
        const iconMap = { like: '❤️', comment: '💬', system: '📢' };
        const list = (data.list || []).map(function (item) {
          return {
            id: item.id,
            type: item.type || 'system',
            icon: iconMap[item.type] || '🔔',
            title: that.getTitleByType(item.type, item.content),
            content: item.content || '',
            time: that.formatTime(item.createdAt),
            unread: !item.isRead,
            targetType: item.targetType,
            targetId: item.targetId,
          };
        });
        that.setData({ notifications: list, loading: false });
      })
      .catch(function () { that.setData({ loading: false }); });
  },

  getTitleByType: function (type, content) {
    if (type === 'like') return '收到点赞';
    if (type === 'comment') return '评论通知';
    return '系统通知';
  },

  goBack: function () {
    wx.navigateBack({ fail: function () { wx.switchTab({ url: '/pages/index/index' }); } });
  },

  markAllRead: function () {
    const that = this;
    const promises = this.data.notifications
      .filter(function (n) { return n.unread; })
      .map(function (n) { return post('/notifications/' + n.id + '/read', {}, { auth: true }); });

    Promise.all(promises).then(function () {
      const notifications = that.data.notifications.map(function (item) {
        item.unread = false; return item;
      });
      that.setData({ notifications: notifications });
      wx.showToast({ title: '已全部标为已读', icon: 'success' });
    }).catch(function () {});
  },

  onNotificationTap: function (e) {
    const { index, id } = e.currentTarget.dataset;
    // Mark as read
    post('/notifications/' + id + '/read', {}, { auth: true }).catch(function () {});
    // Update local
    const notifications = this.data.notifications.map(function (item, i) {
      if (i === index) { item.unread = false; } return item;
    });
    this.setData({ notifications: notifications });
  },

  formatTime: function (dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr); const now = new Date(); const diff = now - d;
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';
    return dateStr.substring(0, 10);
  },
});
