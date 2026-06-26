// pages/equipment/detail.js
const { get } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 20,
    equipment: null,
    loading: true,
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    const id = parseInt(options.id) || 1;
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 20 });
    this.fetchEquipment(id);
  },

  fetchEquipment(id) {
    const that = this;
    get('/equipment/' + id)
      .then(function (item) {
        const equip = {
          id: item.id, name: item.name, model: item.model || '', code: 'EQ-' + item.id,
          status: item.status === 1 ? 'In Stock' : item.status === 2 ? '维修中' : '报废',
          statusColor: item.status === 1 ? '#2E7D32' : '#FF9800',
          icon: '🔧', bgColor: '#FFF3E0',
          specs: (item.specs || []).map(function (s) { return { label: s.name || '', value: s.value || '' }; }),
          description: item.usage || item.scenario || '',
          scenes: item.scenario ? item.scenario.split('、') : [],
          procedures: item.usage ? item.usage.split('；') : [],
          maintenance: item.maintenance ? item.maintenance.split('。').filter(function (s) { return s.trim(); }) : [],
        };
        that.setData({ equipment: equip, loading: false });
      })
      .catch(function () {
        that.setData({ loading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      });
  },

  goBack() {
    wx.navigateBack({ delta: 1, fail() { wx.switchTab({ url: '/pages/index/index' }); } });
  },

});
