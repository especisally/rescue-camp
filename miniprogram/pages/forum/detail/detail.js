// pages/forum/detail.js
const app = getApp();
const { get, post } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 0,
    postId: '',
    post: null,
    comments: [],
    commentPage: 1,
    commentHasMore: true,
    commentSort: 'new',
    relatedPosts: [],
    commentText: '',
    isLiked: false,
    isFaved: false,
    replyTarget: null, // { id, nickname } - 当前正在回复的用户
  },

  onLoad: function (options) {
    const id = options.id || '1';
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 44,
      postId: id,
    });
    this.fetchPostDetail();
    this.fetchComments();
  },

  /**
   * 获取帖子详情
   */
  fetchPostDetail: function () {
    const that = this;
    post('/posts/' + this.data.postId + '/view', {}).catch(function () {}); // 增加浏览

    get('/posts/' + this.data.postId, {}, { auth: app.globalData.isLoggedIn })
      .then(function (item) {
        const post = {
          id: item.id,
          username: item.user ? item.user.nickname : '消防员',
          level: item.user ? item.user.level || '消防员' : '消防员',
          avatar: item.user && item.user.avatar ? item.user.avatar : '👨‍🚒',
          avatarBg: '#dbeafe',
          time: that.formatTime(item.createdAt),
          title: item.title,
          content: item.content || '',
          type: item.type || 'text',
          videoThumb: item.type === 'video',
          thumbBg: '#1a3a5c',
          images: item.images || null,
          videoUrl: item.videoUrl || null,
          like: item.likes || 0,
          comment: item.commentsCount || 0,
          share: 0,
          points: item.points || 0,
          tags: item.tags || [],
          isLiked: item.isLiked || false,
          isFavorited: item.isFavorited || false,
        };
        that.setData({
          post: post,
          isLiked: post.isLiked,
          isFaved: post.isFavorited,
        });
      })
      .catch(function () {
        wx.showToast({ title: '帖子加载失败', icon: 'none' });
      });
  },

  /**
   * 获取评论列表
   */
  fetchComments: function () {
    const that = this;
    const params = {
      page: this.data.commentPage,
      pageSize: 20,
      sort: this.data.commentSort,
    };

    get('/posts/' + this.data.postId + '/comments', params, { auth: app.globalData.isLoggedIn })
      .then(function (data) {
        const list = (data.list || []).map(function (item) {
          const comment = {
            id: item.id,
            author: item.user ? item.user.nickname : '用户',
            avatar: item.user && item.user.avatar ? item.user.avatar : '👤',
            avatarBg: '#e0e7ff',
            time: that.formatTime(item.createdAt),
            content: item.content,
            likes: item.likes || 0,
            isLiked: item.isLiked || false,
            isReply: !!item.parentId,
            replyToUid: item.replyToUid,
            replies: (item.replies || []).map(function (r) {
              return {
                id: r.id,
                author: r.user ? r.user.nickname : '用户',
                avatar: r.user && r.user.avatar ? r.user.avatar : '👤',
                avatarBg: '#e0e7ff',
                time: that.formatTime(r.createdAt),
                content: r.content,
                likes: r.likes || 0,
                isLiked: r.isLiked || false,
                isReply: true,
              };
            }),
          };
          return comment;
        });

        const comments = that.data.commentPage === 1 ? list : that.data.comments.concat(list);
        that.setData({
          comments: comments,
          commentHasMore: data.page < data.totalPages,
        });
      })
      .catch(function () {});
  },

  goBack: function () {
    wx.navigateBack({
      delta: 1,
      fail: function () {
        wx.switchTab({ url: '/pages/forum/index' });
      },
    });
  },

  /**
   * 点赞帖子
   */
  onLikeTap: function () {
    const that = this;
    post('/posts/' + this.data.postId + '/like', {}, { auth: true })
      .then(function (result) {
        const post = that.data.post;
        post.like = result.liked ? post.like + 1 : post.like - 1;
        that.setData({ isLiked: result.liked, post: post });
        wx.showToast({ title: result.liked ? '已点赞' : '已取消', icon: 'none' });
      })
      .catch(function () {});
  },

  /**
   * 收藏帖子
   */
  onFavTap: function () {
    const that = this;
    post('/posts/' + this.data.postId + '/favorite', {}, { auth: true })
      .then(function (result) {
        that.setData({ isFaved: result.favorited });
        wx.showToast({ title: result.favorited ? '已收藏' : '已取消', icon: 'none' });
      })
      .catch(function () {});
  },

  onShareTap: function () {
    wx.showToast({ title: '分享功能开发中', icon: 'none' });
  },

  /**
   * 评论排序切换
   */
  onSortChange: function () {
    const sort = this.data.commentSort === 'new' ? 'hot' : 'new';
    this.setData({ commentSort: sort, commentPage: 1, comments: [] });
    this.fetchComments();
  },

  onCommentInput: function (e) {
    this.setData({ commentText: e.detail.value });
  },

  /**
   * 回复评论
   */
  onReplyTap: function (e) {
    const { id, author } = e.currentTarget.dataset;
    this.setData({
      replyTarget: { id: id, nickname: author },
      commentText: '',
    });
    // Focus the input
  },

  cancelReply: function () {
    this.setData({ replyTarget: null });
  },

  /**
   * 提交评论/回复
   */
  onSubmitComment: function () {
    const text = this.data.commentText.trim();
    if (!text) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' });
      return;
    }

    const that = this;
    const data = {
      postId: parseInt(this.data.postId),
      content: text,
    };

    if (this.data.replyTarget) {
      data.parentId = this.data.replyTarget.id;
      data.replyToUid = 0; // Will be determined by backend
    }

    post('/comments', data, { auth: true })
      .then(function (comment) {
        // Refresh comments
        that.setData({
          commentText: '',
          replyTarget: null,
          commentPage: 1,
          comments: [],
        });
        that.fetchComments();

        // Update comment count
        const post = that.data.post;
        if (post) post.comment = (parseInt(post.comment) || 0) + 1;
        that.setData({ post: post });

        wx.showToast({ title: '评论成功', icon: 'success' });
      })
      .catch(function (err) {
        wx.showToast({ title: err.message || '评论失败', icon: 'none' });
      });
  },

  /**
   * 点赞评论
   */
  onCommentLikeTap: function (e) {
    const that = this;
    const { id } = e.currentTarget.dataset;
    post('/comments/' + id + '/like', {}, { auth: true })
      .then(function () {
        const comments = that.data.comments.map(function (c) {
          if (c.id === id) { c.likes = c.isLiked ? c.likes - 1 : c.likes + 1; c.isLiked = !c.isLiked; }
          c.replies = (c.replies || []).map(function (r) {
            if (r.id === id) { r.likes = r.isLiked ? r.likes - 1 : r.likes + 1; r.isLiked = !r.isLiked; }
            return r;
          });
          return c;
        });
        that.setData({ comments: comments });
      })
      .catch(function () {});
  },

  onRelatedTap: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.redirectTo({ url: '/pages/forum/detail?id=' + id });
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

  onShareAppMessage: function () {
    const post = this.data.post;
    return {
      title: post ? post.title : '应急救援战训营',
      path: '/pages/forum/detail?id=' + this.data.postId,
    };
  },
});
