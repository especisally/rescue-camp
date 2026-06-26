// pages/tools/standard.js
const { get } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 20,
    keyword: '',
    activeCategory: 'all',
    page: 1, pageSize: 20, hasMore: true,
    categories: [
      { id: 'all', name: '全部' },
      { id: 'physical', name: '体能考核' },
      { id: 'skill', name: '技能考核' },
      { id: 'theory', name: '理论考核' },
      { id: 'comprehensive', name: '综合考核' },
    ],
    standards: [],
    loading: false,
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 20 });
    this.fetchStandards();
  },

  fetchStandards() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    const that = this;

    // Category mapping: frontend → backend Chinese strings
    const catMap = { physical: '体能考核', skill: '技能考核', theory: '理论考核', comprehensive: '综合考核' };
    const params = { keyword: this.data.keyword, page: this.data.page, pageSize: this.data.pageSize };
    if (this.data.activeCategory !== 'all') params.category = catMap[this.data.activeCategory];

    get('/standards', params)
      .then(function (data) {
        const tagColors = { '体能考核': '#1a56db', '技能考核': '#005BAC', '理论考核': '#FF9800', '综合考核': '#2E7D32' };
        const list = (data.list || []).map(function (item) {
          return {
            id: item.id, title: item.title, tag: item.category, tagColor: tagColors[item.category] || '#1a56db',
            category: that.mapCategoryToFrontend(item.category),
            description: item.targetUser || '',
          };
        });
        const standards = that.data.page === 1 ? list : that.data.standards.concat(list);
        that.setData({ standards, loading: false, hasMore: data.page < data.totalPages });
      })
      .catch(function () { that.setData({ loading: false }); });
  },

  mapCategoryToFrontend(cat) {
    const map = { '体能考核': 'physical', '技能考核': 'skill', '理论考核': 'theory', '综合考核': 'comprehensive' };
    return map[cat] || 'all';
  },

  goBack() {
    wx.navigateBack({ delta: 1, fail() { wx.switchTab({ url: '/pages/index/index' }); } });
  },

  onStandardTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: '/pages/tools/standard-detail?id=' + id });
  },

  onSearchTap() { wx.navigateTo({ url: '/pages/search/index' }); },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value, page: 1, standards: [] });
    this.fetchStandards();
  },

  onCategoryChange(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.activeCategory) return;
    this.setData({ activeCategory: id, page: 1, standards: [] });
    this.fetchStandards();
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.setData({ page: this.data.page + 1 });
    this.fetchStandards();
  },
});
