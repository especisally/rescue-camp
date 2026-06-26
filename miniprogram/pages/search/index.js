// pages/search/index.js
const app = getApp();
const { get } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 0,
    keyword: '',
    activeTab: 'video',
    tabs: [
      { key: 'video', name: '课程' },
      { key: 'post', name: '帖子' },
      { key: 'equipment', name: '装备' },
    ],
    results: [],
    history: [],
    showHistory: true,
    hasSearched: false,
    loading: false,
  },

  onLoad: function () {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 44 });
    this.loadHistory();
  },

  loadHistory: function () {
    try {
      const history = wx.getStorageSync('search_history') || [];
      this.setData({ history: history.slice(0, 10) });
    } catch (e) { this.setData({ history: [] }); }
  },

  saveHistory: function (keyword) {
    try {
      let history = wx.getStorageSync('search_history') || [];
      history = history.filter(function (h) { return h !== keyword; });
      history.unshift(keyword);
      if (history.length > 10) history = history.slice(0, 10);
      wx.setStorageSync('search_history', history);
      this.setData({ history: history });
    } catch (e) {}
  },

  onSearchInput: function (e) { this.setData({ keyword: e.detail.value }); },

  onSearchConfirm: function () {
    const keyword = this.data.keyword.trim();
    if (!keyword) return;
    this.doSearch(keyword);
    this.saveHistory(keyword);
  },

  onHistoryTap: function (e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ keyword: keyword });
    this.doSearch(keyword);
  },

  onClearHistory: function () {
    const that = this;
    wx.showModal({
      title: '确认清除', content: '确定要清除所有搜索历史吗？',
      success: function (res) {
        if (res.confirm) {
          wx.removeStorageSync('search_history');
          that.setData({ history: [] });
          wx.showToast({ title: '已清除', icon: 'success' });
        }
      },
    });
  },

  doSearch: function (keyword) {
    const that = this;
    this.setData({ loading: true });

    get('/search', { type: this.data.activeTab, keyword: keyword })
      .then(function (data) {
        const iconMap = { video: '🔥', post: '💬', equipment: '🔧' };
        const bgMap = { video: '#fee2e2', post: '#dbeafe', equipment: '#e8f5e9' };
        const urlMap = { video: '/pages/video/play?id=', post: '/pages/forum/detail?id=', equipment: '/pages/equipment/detail?id=' };

        const results = (data.list || []).map(function (item) {
          return {
            id: item.id,
            type: that.data.activeTab,
            title: item.title || item.name || '',
            subtitle: item.author || (item.category ? item.category.name : '') || '',
            icon: iconMap[that.data.activeTab] || '📄',
            bg: bgMap[that.data.activeTab] || '#f5f5f5',
            url: (urlMap[that.data.activeTab] || '') + item.id,
          };
        });

        that.setData({ results, showHistory: false, hasSearched: true, loading: false });
      })
      .catch(function () {
        that.setData({ loading: false });
        wx.showToast({ title: '搜索失败', icon: 'none' });
      });
  },

  onTabSwitch: function (e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    this.setData({ activeTab: tab });
    if (this.data.hasSearched && this.data.keyword.trim()) {
      this.doSearch(this.data.keyword.trim());
    }
  },

  onClearKeyword: function () {
    this.setData({ keyword: '', results: [], showHistory: true, hasSearched: false });
  },

  onResultTap: function (e) {
    const { index } = e.currentTarget.dataset;
    const item = this.data.results[index];
    if (item && item.url) {
      wx.navigateTo({ url: item.url, fail: function () { wx.switchTab({ url: '/pages/index/index' }); } });
    }
  },

  goBack: function () {
    wx.navigateBack({ fail: function () { wx.switchTab({ url: '/pages/index/index' }); } });
  },
});
