// pages/favorites/index.js
const app = getApp();
const { get } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 0,
    activeTab: 'post',
    tabs: [
      { key: 'post', name: '收藏的帖子' },
      { key: 'video', name: '收藏的课程' },
      { key: 'training', name: '收藏的操法' },
    ],
    items: [],
    loading: false,
  },

  onLoad: function () { this.setData({ statusBarHeight: app.globalData.statusBarHeight || 44 }); this.fetchFavorites(); },

  fetchFavorites: function () {
    const that = this;
    this.setData({ loading: true });
    get('/users/me/favorites', { targetType: this.data.activeTab, pageSize: 50 }, { auth: true })
      .then(function (data) {
        const iconMap = { post: '💬', video: '🔥', training: '⛑️' };
        const bgMap = { post: '#dbeafe', video: '#fee2e2', training: '#d1fae5' };
        const items = (data.list || []).map(function (item) {
          return {
            id: item.targetId,
            title: '收藏内容 #' + item.targetId,
            subtitle: item.createdAt ? item.createdAt.substring(0, 10) : '',
            icon: iconMap[item.targetType] || '⭐',
            bg: bgMap[item.targetType] || '#f5f5f5',
            url: item.targetType === 'post' ? '/pages/forum/detail?id=' + item.targetId : '',
          };
        });
        that.setData({ items, loading: false });
      })
      .catch(function () { that.setData({ loading: false }); });
  },

  onTabSwitch: function (e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    this.setData({ activeTab: tab, items: [] });
    this.fetchFavorites();
  },

  goBack: function () { wx.navigateBack({ fail: function () { wx.switchTab({ url: '/pages/profile/index' }); } }); },
});
