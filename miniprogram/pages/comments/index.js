// pages/comments/index.js
const app = getApp();
const { get } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 0,
    comments: [],
    loading: false,
  },

  onLoad: function () { this.setData({ statusBarHeight: app.globalData.statusBarHeight || 44 }); this.fetchComments(); },

  fetchComments: function () {
    const that = this;
    this.setData({ loading: true });
    get('/users/me/comments', { pageSize: 50 }, { auth: true })
      .then(function (data) {
        const comments = (data.list || []).map(function (item) {
          return {
            id: item.id,
            postTitle: item.post ? item.post.title : '帖子',
            myComment: item.content || '',
            time: item.createdAt ? item.createdAt.substring(0, 10) : '',
            icon: '💬',
          };
        });
        that.setData({ comments, loading: false });
      })
      .catch(function () { that.setData({ loading: false }); });
  },

  goBack: function () { wx.navigateBack({ fail: function () { wx.switchTab({ url: '/pages/profile/index' }); } }); },
});
