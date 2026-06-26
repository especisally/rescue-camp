// custom-tab-bar/index.js
Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/index/index',
        text: '首页',
        iconPath: '/images/icons/home.png',
        selectedIconPath: '/images/icons/home-active.png'
      },
      {
        pagePath: '/pages/forum/index',
        text: '论坛',
        iconPath: '/images/icons/examples.png',
        selectedIconPath: '/images/icons/examples-active.png'
      },
      {
        pagePath: '/pages/shop/index',
        text: '商城',
        iconPath: '/images/icons/goods.png',
        selectedIconPath: '/images/icons/goods-active.png'
      },
      {
        pagePath: '/pages/profile/index',
        text: '我的',
        iconPath: '/images/icons/usercenter.png',
        selectedIconPath: '/images/icons/usercenter-active.png'
      }
    ]
  },

  methods: {
    switchTab: function (e) {
      const index = e.currentTarget.dataset.index;
      const item = this.data.list[index];

      if (this.data.selected === index) return;

      wx.switchTab({
        url: item.pagePath
      });
    }
  }
});
