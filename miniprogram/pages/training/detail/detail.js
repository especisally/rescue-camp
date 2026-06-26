// pages/training/detail.js
const { get, post } = require('../../utils/request');
const app = getApp();

Page({
  data: {
    statusBarHeight: 0,
    drill: null,
    loading: true,
  },

  onLoad: function (options) {
    const id = parseInt(options.id) || 1;
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 });
    this.fetchTraining(id);
  },

  fetchTraining: function (id) {
    const that = this;
    get('/trainings/' + id)
      .then(function (item) {
        const drill = {
          id: item.id,
          name: item.title,
          tag: item.category ? item.category.name : '操法',
          tagColor: '#1a56db',
          icon: '⛑️',
          bgColor: '#E3F2FD',
          description: item.cautions || '',
          steps: (item.steps || []).map(function (s, i) {
            return { order: i + 1, title: s.title || '', desc: s.desc || '' };
          }),
          equipments: (item.equipment || []).map(function (e, i) {
            return { name: e, qty: '', icon: '🔧' };
          }),
          cautions: item.cautions ? item.cautions.split('；').filter(function (s) { return s.trim(); }) : [],
        };
        that.setData({ drill, loading: false });

        // Record progress
        post('/trainings/' + id + '/progress', {}, { auth: true }).catch(function () {});
      })
      .catch(function () {
        that.setData({ loading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      });
  },

  goBack: function () {
    wx.navigateBack({ delta: 1, fail: function () { wx.switchTab({ url: '/pages/index/index' }); } });
  },

  onShareAppMessage: function () {
    const drill = this.data.drill;
    return { title: drill ? drill.name : '训练操法', path: '/pages/training/detail?id=' + (drill ? drill.id : 1) };
  },
});
