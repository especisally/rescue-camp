// pages/video/play.js
const { get, post } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 0,
    videoId: '',
    descExpanded: false,
    video: null,
    relatedVideos: [],
    loading: true,
    loadError: false,
  },

  onLoad(options) {
    const systemInfo = wx.getSystemInfoSync();
    const videoId = options.id || '';
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
      videoId,
    });
    this.fetchVideoDetail();
  },

  /**
   * 获取视频详情
   */
  fetchVideoDetail() {
    const that = this;
    this.setData({ loading: true });

    get('/videos/' + this.data.videoId)
      .then(function (video) {
        const formatted = {
          id: video.id,
          title: video.title || '未命名视频',
          views: that.formatViews(video.views),
          duration: that.formatDuration(video.duration),
          date: video.createdAt ? video.createdAt.substring(0, 10) : '',
          author: video.author || '消防教官',
          level: '消防员',
          description: video.description || '暂无简介',
          tags: video.tags || [],
          coverUrl: video.coverUrl || '',
          videoUrl: video.videoUrl || '',
          points: video.points || 0,
          likes: video.likes || 0,
        };

        that.setData({ video: formatted, loading: false });

        // 记录播放量
        post('/videos/' + video.id + '/view').catch(function () {});

        // 获取相关推荐（同分类）
        if (video.categoryId) {
          get('/videos', { categoryId: video.categoryId, pageSize: 4 })
            .then(function (res) {
              const related = (res.list || [])
                .filter(function (v) { return v.id !== video.id; })
                .slice(0, 3)
                .map(function (item) {
                  return {
                    id: item.id,
                    title: item.title,
                    views: that.formatViews(item.views),
                    duration: that.formatDuration(item.duration),
                    date: item.createdAt ? item.createdAt.substring(0, 10) : '',
                    thumbColor: '#607D8B',
                  };
                });
              that.setData({ relatedVideos: related });
            })
            .catch(function () {});
        }
      })
      .catch(function () {
        that.setData({ loading: false, loadError: true });
        // Use default mock data as fallback
        if (!that.data.video) {
          that.setData({
            video: {
              title: '视频加载中...',
              views: '—',
              duration: '—',
              date: '',
              author: '—',
              description: '视频数据加载失败，请检查网络后重试。',
            },
          });
        }
      });
  },

  formatDuration(seconds) {
    if (!seconds) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return h + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    return m + ':' + (s < 10 ? '0' + s : s);
  },

  formatViews(n) {
    if (!n) return '0';
    if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  },

  goBack() {
    wx.navigateBack({
      fail() { wx.redirectTo({ url: '/pages/video/index' }); },
    });
  },

  toggleDesc() {
    this.setData({ descExpanded: !this.data.descExpanded });
  },

  onRelatedTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.redirectTo({ url: '/pages/video/play?id=' + id });
  },
});
