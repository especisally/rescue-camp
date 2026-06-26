// pages/shop/index.js
Page({
  data: {
    statusBarHeight: 0,
    categories: [
      { id: 1, name: '个人防护装备', icon: '👕' },
      { id: 2, name: '破拆工具', icon: '🔩' },
      { id: 3, name: '通讯设备', icon: '📡' },
      { id: 4, name: '急救装备', icon: '🏥' }
    ]
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: systemInfo.statusBarHeight });
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
  },

  onOpenShop() {
    // 后续接入微信小店时替换为实际跳转逻辑
    // wx.openBusinessView({ businessType: 'wxPayScoreMiniShop', ... })
    wx.showModal({
      title: '微信小店',
      content: '商城即将接入微信小店，敬请期待！',
      showCancel: false,
      confirmText: '知道了'
    });
  }
});
