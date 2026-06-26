// pages/equipment/index.js
const { get } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 20,
    keyword: '',
    activeCategory: 'all',
    viewMode: 'list',
    page: 1, pageSize: 20, hasMore: true,
    categories: [
      { id: 'all', name: '全部', icon: '📦' },
      { id: 20, name: '基础装备', icon: '🔧' },
      { id: 21, name: '特种装备', icon: '⚙️' },
      { id: 22, name: '破拆器材', icon: '🔩' },
      { id: 23, name: '灭火药剂', icon: '💧' },
      { id: 24, name: '急救器材', icon: '🏥' },
      { id: 25, name: '侦检仪器', icon: '🔬' },
    ],
    equipments: [],
    loading: false,
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 20 });
    this.fetchEquipment();
  },

  fetchEquipment() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    const that = this;
    const params = { keyword: this.data.keyword, page: this.data.page, pageSize: this.data.pageSize };
    if (this.data.activeCategory !== 'all') params.categoryId = this.data.activeCategory;

    get('/equipment', params)
      .then(function (data) {
        const list = (data.list || []).map(function (item) {
          return {
            id: item.id, name: item.name,
            model: item.model || '',
            description: item.scenario || item.usage || '',
            category: String(item.categoryId || 'all'),
            tags: item.specs ? item.specs.slice(0, 2).map(function (s) { return s.name || ''; }) : [],
            status: item.status === 1 ? 'In Stock' : item.status === 2 ? '维修中' : 'Active',
            statusColor: item.status === 1 ? '#2E7D32' : '#FF9800',
            icon: '🔧', bgColor: '#FFF3E0',
          };
        });
        const equipments = that.data.page === 1 ? list : that.data.equipments.concat(list);
        that.setData({ equipments, loading: false, hasMore: data.page < data.totalPages });
      })
      .catch(function () { that.setData({ loading: false }); });
  },

  goBack() {
    wx.navigateBack({ delta: 1, fail() { wx.switchTab({ url: '/pages/index/index' }); } });
  },

  onEquipmentTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: '/pages/equipment/detail?id=' + id });
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value, page: 1, equipments: [] });
    this.fetchEquipment();
  },

  onCategoryChange(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.activeCategory) return;
    this.setData({ activeCategory: id, page: 1, equipments: [] });
    this.fetchEquipment();
  },

  onToggleView(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ viewMode: mode });
  },

  onFabTap() {
    wx.showToast({ title: '添加器材功能开发中', icon: 'none' });
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.setData({ page: this.data.page + 1 });
    this.fetchEquipment();
  },
});
