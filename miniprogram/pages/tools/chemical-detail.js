// pages/tools/chemical-detail.js
const { get } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 20,
    chemical: null,
    loading: true,
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    const id = parseInt(options.id) || 1;
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 20 });
    this.fetchChemical(id);
  },

  fetchChemical(id) {
    const that = this;
    get('/chemicals/' + id)
      .then(function (item) {
        const chem = {
          name: item.name || '',
          formula: item.formula || '',
          unNumber: 'UN ' + (item.unNumber || '—'),
          hazardClass: item.hazardClass || '',
          hazardColor: item.hazardColor || '#1a56db',
          properties: that.parseProperties(item.properties),
          dangers: (item.dangers || []).map(function (d) { return d.desc || d.title; }),
          steps: (item.steps || []).map(function (s) { return s.desc || s.title; }),
          protections: (item.protections || []).map(function (p) {
            return { label: p.title || '', value: p.desc || '' };
          }),
        };
        that.setData({ chemical: chem, loading: false });
      })
      .catch(function () {
        that.setData({ loading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      });
  },

  parseProperties(props) {
    if (!props) return [];
    if (Array.isArray(props)) return props;
    // Object format: { molecularWeight, boilingPoint, ... }
    const labelMap = {
      molecularWeight: '分子量', boilingPoint: '沸点', meltingPoint: '熔点',
      density: '相对密度', flashPoint: '闪点', explosionLimit: '爆炸极限',
      appearance: '外观',
    };
    return Object.entries(props).map(function (entry) {
      return { label: labelMap[entry[0]] || entry[0], value: entry[1] };
    });
  },

  goBack() {
    wx.navigateBack({ delta: 1, fail() { wx.switchTab({ url: '/pages/index/index' }); } });
  },
});
