// pages/quiz/index.js
const { get } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 0,
    currentTab: 0,
    tabs: ['全部', '作战训练安全', '灭火救援', '晋级考核', '职业技能鉴定', '水域救援', '绳索救援'],
    bankList: [],
    loading: true,
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: systemInfo.statusBarHeight });
    this.fetchBanks();
  },

  /**
   * 获取题库列表
   */
  fetchBanks() {
    const that = this;
    const categoryId = this.data.currentTab > 0 ? this.data.currentTab + 29 : 0; // category mapping

    get('/quiz/banks', { categoryId: categoryId || undefined })
      .then(function (data) {
        const iconMap = ['🚒', '💧', '🔩', '🛡️', '✅'];
        const colorList = ['#1a56db', '#005BAC', '#607D8B', '#1a56db', '#4CAF50'];

        const list = (data || []).map(function (item, index) {
          return {
            id: item.id,
            title: item.title,
            count: String(item._count ? item._count.questions : item.questionCount || 0),
            date: item.createdAt ? item.createdAt.substring(0, 10) : '',
            icon: iconMap[index % 5],
            iconBg: 'rgba(26, 86, 219, 0.15)',
            btnText: '→',
            btnBg: colorList[index % 5],
            badge: item.questionCount > 20 ? 'HOT' : '',
            badgeColor: '#1a56db',
          };
        });

        that.setData({ bankList: list, loading: false });
      })
      .catch(function () {
        that.setData({ loading: false });
      });
  },

  goBack() {
    wx.navigateBack({
      fail() { wx.switchTab({ url: '/pages/index/index' }); },
    });
  },

  onSearchTap() {
    wx.navigateTo({ url: '/pages/search/index' });
  },

  onTabSwitch(e) {
    const { index } = e.currentTarget.dataset;
    if (index === this.data.currentTab) return;
    this.setData({ currentTab: index, loading: true });
    this.fetchBanks();
  },

  onBankTap(e) {
    const { id, title } = e.currentTarget.dataset;
    wx.navigateTo({ url: '/pages/quiz/detail?id=' + id + '&title=' + encodeURIComponent(title || '') });
  },
});
