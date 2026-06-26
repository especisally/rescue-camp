// pages/tools/chemical.js
const { get } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 20,
    keyword: '',
    activeCategory: 'all',
    page: 1,
    pageSize: 20,
    hasMore: true,
    categories: [
      { id: 'all', name: '全部' },
      { id: 'explosive', name: '爆炸品' },
      { id: 'gas', name: '气体' },
      { id: 'flammable_liquid', name: '易燃液体' },
      { id: 'flammable_solid', name: '易燃固体' },
      { id: 'oxidizer', name: '氧化剂' },
      { id: 'toxic', name: '毒害品' },
      { id: 'corrosive', name: '腐蚀品' },
    ],
    chemicals: [],
    loading: false,
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 20 });
    this.fetchChemicals();
  },

  fetchChemicals() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    const that = this;

    get('/chemicals', { keyword: this.data.keyword, page: this.data.page, pageSize: this.data.pageSize })
      .then(function (data) {
        const list = (data.list || []).map(function (item) {
          return {
            id: item.id,
            unNumber: 'UN ' + (item.unNumber || '—'),
            name: item.name,
            formula: item.formula || '—',
            category: 'all', // Backend doesn't use these frontend category labels
            hazardClass: item.hazardClass || '',
            hazardColor: item.hazardColor || '#1a56db',
          };
        });

        const chemicals = that.data.page === 1 ? list : that.data.chemicals.concat(list);
        that.setData({
          chemicals, loading: false,
          hasMore: data.page < data.totalPages,
        });
      })
      .catch(function () { that.setData({ loading: false }); });
  },

  goBack() {
    wx.navigateBack({ delta: 1, fail() { wx.switchTab({ url: '/pages/index/index' }); } });
  },

  onChemicalTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: '/pages/tools/chemical-detail?id=' + id });
  },

  onSearchTap() { wx.navigateTo({ url: '/pages/search/index' }); },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value, page: 1, chemicals: [] });
    this.fetchChemicals();
  },

  onCategoryChange(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ activeCategory: id });
    // Category filtering done client-side since backend hazard classes differ
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.setData({ page: this.data.page + 1 });
    this.fetchChemicals();
  },
});
