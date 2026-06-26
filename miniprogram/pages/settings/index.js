const app = getApp();

Page({
  data: {
    statusBarHeight: 0,

    cacheSize: '128.6 MB',

    // 开关设置项
    switchItems: [
      { id: 'notification', name: '消息通知', icon: '🔔', value: true },
      { id: 'autoPlay', name: '自动播放', icon: '▶️', value: false },
      { id: 'saveMode', name: '省流模式', icon: '📶', value: true }
    ],

    // 普通菜单项
    menuItems: [
      { id: 'cache', name: '清除缓存', icon: '🗑️', hasExtra: true, url: '' },
      { id: 'about', name: '关于我们', icon: 'ℹ️', hasExtra: false, url: '/pages/about/index' }
    ]
  },

  onLoad: function () {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 44
    });
  },

  goBack: function () {
    wx.navigateBack({
      fail: function () {
        wx.switchTab({ url: '/pages/index/index' });
      }
    });
  },

  onSwitchChange: function (e) {
    var id = e.currentTarget.dataset.id;
    var switchItems = this.data.switchItems.map(function (item) {
      if (item.id === id) {
        return Object.assign({}, item, { value: !item.value });
      }
      return item;
    });
    this.setData({ switchItems });

    var item = switchItems.find(function (s) { return s.id === id; });
    if (item) {
      wx.showToast({ title: item.value ? item.name + '已开启' : item.name + '已关闭', icon: 'none' });
    }
  },

  onMenuTap: function (e) {
    var id = e.currentTarget.dataset.id;
    var url = e.currentTarget.dataset.url;

    if (id === 'cache') {
      var that = this;
      wx.showModal({
        title: '清除缓存',
        content: '确定要清除所有缓存数据吗？',
        success: function (res) {
          if (res.confirm) {
            that.setData({ cacheSize: '0 B' });
            wx.showToast({ title: '缓存已清除', icon: 'success' });
          }
        }
      });
    } else if (url) {
      wx.navigateTo({
        url: url,
        fail: function () {
          wx.showToast({ title: '页面开发中', icon: 'none' });
        }
      });
    }
  },

  onLogout: function () {
    var that = this;
    wx.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      success: function (res) {
        if (res.confirm) {
          var app = getApp();
          app.logout();
          wx.showToast({ title: '已退出登录', icon: 'success' });
          setTimeout(function () {
            wx.navigateBack({
              fail: function () {
                wx.switchTab({ url: '/pages/index/index' });
              }
            });
          }, 1500);
        }
      }
    });
  }
});
