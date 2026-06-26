// pages/equipment/detail.js
const { get, post } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 20,
    equipment: null,
    loading: true,
    showRepairForm: false,
    showRequisitionForm: false,
    formReason: '',
    submitting: false,
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

  // 报修
  onRepair() {
    this.setData({ showRepairForm: true, formReason: '' });
  },

  // 领用申请
  onApply() {
    this.setData({ showRequisitionForm: true, formReason: '' });
  },

  onCancelForm() {
    this.setData({ showRepairForm: false, showRequisitionForm: false, formReason: '' });
  },

  onReasonInput(e) {
    this.setData({ formReason: e.detail.value });
  },

  onSubmitRepair() {
    const reason = this.data.formReason.trim();
    if (!reason) { wx.showToast({ title: '请填写报修原因', icon: 'none' }); return; }
    const that = this;
    this.setData({ submitting: true });
    post('/equipment/' + this.data.equipment.id + '/repair', { reason: reason }, { auth: true })
      .then(function () {
        that.setData({ showRepairForm: false, formReason: '', submitting: false });
        wx.showToast({ title: '报修申请已提交', icon: 'success' });
      })
      .catch(function () { that.setData({ submitting: false }); });
  },

  onSubmitRequisition() {
    const reason = this.data.formReason.trim();
    if (!reason) { wx.showToast({ title: '请填写领用原因', icon: 'none' }); return; }
    const that = this;
    this.setData({ submitting: true });
    post('/equipment/' + this.data.equipment.id + '/requisition', { reason: reason }, { auth: true })
      .then(function () {
        that.setData({ showRequisitionForm: false, formReason: '', submitting: false });
        wx.showToast({ title: '领用申请已提交', icon: 'success' });
      })
      .catch(function () { that.setData({ submitting: false }); });
  },
});
