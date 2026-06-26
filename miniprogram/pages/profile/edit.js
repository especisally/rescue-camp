// pages/profile/edit.js
const app = getApp();
const { put } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 0,
    avatar: '👨‍🚒',
    nickname: '',
    phone: '',
    saving: false,
  },

  onLoad: function () {
    const userInfo = app.globalData.userInfo || {};
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 44,
      avatar: userInfo.avatar || '👨‍🚒',
      nickname: userInfo.nickname || '',
      phone: userInfo.phone || '',
    });
  },

  onChangeAvatar: function () {
    const that = this;
    wx.chooseMedia({
      count: 1, mediaType: ['image'], sourceType: ['album', 'camera'],
      success: function (res) {
        const tempPath = res.tempFiles[0].tempFilePath;
        wx.showLoading({ title: '上传中...' });
        // Upload to server
        wx.uploadFile({
          url: require('../../config/index').baseUrl + '/upload/image',
          filePath: tempPath, name: 'file',
          header: { 'Authorization': 'Bearer ' + app.globalData.token },
          success: function (uploadRes) {
            wx.hideLoading();
            try {
              const data = JSON.parse(uploadRes.data);
              if (data.code === 0) {
                that.setData({ avatar: data.data.url });
                wx.showToast({ title: '头像上传成功', icon: 'success' });
              } else {
                wx.showToast({ title: data.message || '上传失败', icon: 'none' });
              }
            } catch (e) {
              wx.showToast({ title: '解析响应失败', icon: 'none' });
            }
          },
          fail: function (err) {
            wx.hideLoading();
            console.error('uploadFile fail:', err);
            wx.showToast({ title: '上传失败，请检查网络', icon: 'none' });
          },
        });
      },
      fail: function (err) {
        console.error('chooseMedia fail:', err);
        if (err && err.errMsg && err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({ title: '选择图片失败，请检查权限', icon: 'none' });
        }
      },
    });
  },

  onNameInput: function (e) { this.setData({ nickname: e.detail.value }); },
  onPhoneInput: function (e) { this.setData({ phone: e.detail.value }); },

  onSave: function () {
    const that = this;
    if (this.data.saving) return;
    this.setData({ saving: true });

    put('/users/me', { nickname: this.data.nickname, phone: this.data.phone }, { auth: true })
      .then(function (user) {
        // Update global user info
        app.globalData.userInfo = user;
        app.saveUserInfo(user);
        wx.showToast({ title: '保存成功', icon: 'success' });
        setTimeout(function () { wx.navigateBack(); }, 1500);
      })
      .catch(function () { that.setData({ saving: false }); });
  },

  goBack: function () { wx.navigateBack({ fail: function () { wx.switchTab({ url: '/pages/profile/index' }); } }); },
});
