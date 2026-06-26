// pages/video/category.js
const { get } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 0,
    categoryId: 0,
    categoryName: '',
    keyword: '',
    activeFilter: 'all',
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: true,

    filterTags: [
      { id: 'all', name: '全部' },
      { id: 'newest', name: '最新发布' },
      { id: 'hot', name: '最多播放' },
      { id: 'free', name: '免费课程' },
      { id: 'points', name: '积分课程' },
    ],

    allVideos: [],
    filteredList: [],
    loading: false,
    loadError: false,
  },

  onLoad(options) {
    const systemInfo = wx.getSystemInfoSync();
    const categoryId = parseInt(options.id) || 0;
    const categoryName = options.name || '视频分类';

    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
      categoryId,
      categoryName,
    });

    this.fetchVideos();
  },

  /**
   * 从 API 获取视频列表
   */
  fetchVideos() {
    const that = this;
    if (this.data.loading) return;
    this.setData({ loading: true });

    const params = { page: this.data.page, pageSize: this.data.pageSize };
    if (this.data.categoryId) params.categoryId = this.data.categoryId;
    if (this.data.keyword) params.keyword = this.data.keyword;

    // 排序映射
    if (this.data.activeFilter === 'newest') params.sort = 'oldest'; // Actually should be 'latest', which is default
    if (this.data.activeFilter === 'hot') params.sort = 'popular';

    get('/videos', params)
      .then(function (data) {
        const list = (data.list || []).map(function (item) {
          return {
            id: item.id,
            title: item.title,
            author: item.author || '消防教官',
            duration: that.formatDuration(item.duration),
            views: that.formatViews(item.views),
            points: item.points || 0,
            tags: item.tags || [],
            coverUrl: item.coverUrl || '',
            thumbBg: 'linear-gradient(135deg, #1a56db, #1648c0)',
          };
        });

        // 本地过滤：免费/积分
        let filtered = list;
        if (that.data.activeFilter === 'free') {
          filtered = list.filter(function (v) { return v.points === 0; });
        } else if (that.data.activeFilter === 'points') {
          filtered = list.filter(function (v) { return v.points > 0; });
        }

        const allVideos = that.data.page === 1 ? list : that.data.allVideos.concat(list);
        that.setData({
          allVideos,
          filteredList: that.data.page === 1 ? filtered : that.data.filteredList.concat(filtered),
          total: data.total || 0,
          hasMore: data.page < data.totalPages,
          loading: false,
          loadError: false,
        });
      })
      .catch(function () {
        that.setData({ loading: false, loadError: true });
        // API 失败时使用 filedList 的本地过滤
        if (that.data.filteredList.length === 0 && that.data.allVideos.length === 0) {
          // No data at all, keep empty
        }
      });
  },

  formatDuration(seconds) {
    if (!seconds) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
  },

  formatViews(n) {
    if (!n) return '0';
    if (n >= 10000) return (n / 10000).toFixed(1) + '万';
    return String(n);
  },

  goBack() {
    wx.navigateBack({
      fail() { wx.switchTab({ url: '/pages/index/index' }); },
    });
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearchConfirm() {
    this.setData({ page: 1, allVideos: [], filteredList: [] });
    this.fetchVideos();
  },

  onClearSearch() {
    this.setData({ keyword: '', page: 1, allVideos: [], filteredList: [] });
    this.fetchVideos();
  },

  onFilterChange(e) {
    const { id } = e.currentTarget.dataset;
    if (id === this.data.activeFilter) return;
    this.setData({ activeFilter: id, page: 1, allVideos: [], filteredList: [] });
    this.fetchVideos();
  },

  onVideoTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/video/play?id=' + id });
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.setData({ page: this.data.page + 1 });
    this.fetchVideos();
  },
});
