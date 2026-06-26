// pages/training/index.js
const { get } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 20,
    keyword: '',
    activeCategory: 'all',
    completedCount: 0,
    totalCount: 0,
    progressPercent: 0,
    progressDeg: 0,
    page: 1, pageSize: 20, hasMore: true,
    categories: [
      { id: 'all', name: '全部操法' },
      { id: 10, name: '灭火操法' },
      { id: 11, name: '救人操法' },
      { id: 12, name: '体能竞技' },
      { id: 13, name: '装备应用' },
    ],
    trainings: [],
    loading: false,
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 20 });
    this.fetchTrainings();
  },

  fetchTrainings() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    const that = this;
    const params = { keyword: this.data.keyword, page: this.data.page, pageSize: this.data.pageSize };
    if (this.data.activeCategory !== 'all') params.categoryId = this.data.activeCategory;

    get('/trainings', params)
      .then(function (data) {
        const colors = ['#E3F2FD', '#eff6ff', '#FFF3E0', '#E8F5E9'];
        const icons = ['⛑️', '🔥', '🔧', '⛰️'];
        const list = (data.list || []).map(function (item, i) {
          return {
            id: item.id, name: item.title,
            tag: item.category ? item.category.name : '操法',
            tagColor: '#1a56db', category: String(item.categoryId || 'all'),
            icon: icons[i % 4], bgColor: colors[i % 4],
          };
        });
        const trainings = that.data.page === 1 ? list : that.data.trainings.concat(list);
        that.setData({
          trainings, loading: false, hasMore: data.page < data.totalPages,
          totalCount: data.total || 0, completedCount: Math.min(list.length, data.total || 0),
          progressPercent: data.total > 0 ? Math.round((list.length / data.total) * 100) : 0,
        });
        const deg = that.data.progressPercent > 0 ? (that.data.progressPercent / 100) * 360 : 0;
        that.setData({ progressDeg: deg });
      })
      .catch(function () { that.setData({ loading: false }); });
  },

  goBack() {
    wx.navigateBack({ delta: 1, fail() { wx.switchTab({ url: '/pages/index/index' }); } });
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value, page: 1, trainings: [] });
    this.fetchTrainings();
  },

  onCategoryChange(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.activeCategory) return;
    this.setData({ activeCategory: id, page: 1, trainings: [] });
    this.fetchTrainings();
  },

  onTrainingTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/training/detail?id=' + id });
  },

  onSearchTap() { wx.navigateTo({ url: '/pages/search/index' }); },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.setData({ page: this.data.page + 1 });
    this.fetchTrainings();
  },
});
