const app = getApp();
const { get, post } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: app.globalData.statusBarHeight || 44,
    signedIn: false,
    currentTab: 'latest',
    page: 1,
    pageSize: 20,
    hasMore: true,
    posts: [],
    loading: false,
  },

  onLoad: function () {
    const app = getApp();
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 44 });
    this.fetchPosts();
  },

  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },

  /**
   * 获取帖子列表
   */
  fetchPosts: function () {
    if (this.data.loading) return;
    this.setData({ loading: true });

    const that = this;
    const params = {
      tab: this.data.currentTab,
      page: this.data.page,
      pageSize: this.data.pageSize,
    };

    get('/posts', params, { auth: app.globalData.isLoggedIn })
      .then(function (data) {
        const list = (data.list || []).map(function (item) {
          return {
            id: item.id,
            username: item.user ? item.user.nickname : '消防员',
            level: 1,
            avatar: item.user && item.user.avatar ? item.user.avatar : '👨‍🚒',
            avatarBg: '#dbeafe',
            time: that.formatTime(item.createdAt),
            title: item.title,
            excerpt: that.truncate(item.content || '', 120),
            type: item.type || 'text',
            videoThumb: item.type === 'video',
            thumbBg: '#1a3a5c',
            images: item.images || null,
            like: that.formatCount(item.likes),
            comment: that.formatCount(item.commentsCount),
            share: '0',
            points: item.points || 0,
            isLiked: item.isLiked || false,
            isFavorited: item.isFavorited || false,
            isEssence: item.isEssence || false,
          };
        });

        const posts = that.data.page === 1 ? list : that.data.posts.concat(list);
        that.setData({
          posts: posts,
          total: data.total || 0,
          hasMore: data.page < data.totalPages,
          loading: false,
        });
      })
      .catch(function () {
        that.setData({ loading: false });
      });
  },

  onSwitchTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.currentTab) return;
    this.setData({ currentTab: tab, page: 1, posts: [] });
    this.fetchPosts();
  },

  /**
   * 签到
   */
  onSignIn: function () {
    if (this.data.signedIn) return;
    const that = this;
    post('/users/signin', {}, { auth: true })
      .then(function () {
        that.setData({ signedIn: true });
        wx.showToast({ title: '签到成功 +5 积分', icon: 'success' });
      })
      .catch(function (err) {
        if (err.code === 422 || err.message === '今日已签到') {
          that.setData({ signedIn: true });
        }
        wx.showToast({ title: err.message || '签到失败', icon: 'none' });
      });
  },

  onSearchTap: function () {
    wx.navigateTo({ url: '/pages/search/index' });
  },

  onNotificationTap: function () {
    wx.navigateTo({
      url: '/pages/notification/index',
      fail: function () {
        wx.showToast({ title: '通知页开发中', icon: 'none' });
      },
    });
  },

  onPostTap: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/forum/detail?id=' + id,
      fail: function () {
        wx.showToast({ title: '帖子详情页开发中', icon: 'none' });
      },
    });
  },

  onFABTap: function () {
    wx.navigateTo({
      url: '/pages/forum/post',
    });
  },

  formatTime: function (dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';
    return dateStr.substring(0, 10);
  },

  formatCount: function (n) {
    if (!n) return '0';
    if (n >= 10000) return (n / 10000).toFixed(1) + 'k';
    return String(n);
  },

  truncate: function (text, maxLen) {
    if (!text) return '';
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + '…';
  },

  /**
   * 上拉加载更多
   */
  onReachBottom: function () {
    if (!this.data.hasMore || this.data.loading) return;
    this.setData({ page: this.data.page + 1 });
    this.fetchPosts();
  },

  onShareAppMessage: function () {
    return {
      title: '战训论坛 - 救援经验交流社区',
      path: '/pages/forum/index',
    };
  },
});
