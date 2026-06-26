const app = getApp();
const { get } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: app.globalData.statusBarHeight || 44,

    // 轮播图（默认 fallback）
    banners: [
      { id: 1, title: '年度实战化救援演练专题', subtitle: '掌握最新战术，提升响应速度', icon: '🚒', bg: 'linear-gradient(135deg, #1a56db, #1648c0)' },
      { id: 2, title: '水域救援技术专题培训', subtitle: '专业教练团队，系统化教学', icon: '🌊', bg: 'linear-gradient(135deg, #005BAC, #004a8f)' },
      { id: 3, title: '地震搜救实战技能提升', subtitle: '模拟真实场景，强化应急能力', icon: '🌗', bg: 'linear-gradient(135deg, #5a5a5a, #444444)' },
    ],

    // 功能网格
    menus: [
      { id: 1, name: '视频学习', desc: '精品课程', icon: '▶️', colorBg: 'rgba(26,86,219,0.12)', url: '/pages/video/index' },
      { id: 2, name: '战训工具', desc: '辅助计算', icon: '🔧', colorBg: 'rgba(0,91,172,0.12)', url: '/pages/tools/index' },
      { id: 3, name: '训练操法', desc: '作业程序', icon: '💪', colorBg: 'rgba(100,100,100,0.10)', url: '/pages/training/index' },
      { id: 4, name: '器材装备', desc: '管理维护', icon: '📦', colorBg: 'rgba(255,140,0,0.12)', url: '/pages/equipment/index' },
      { id: 5, name: '拓展学习', desc: '视野提升', icon: '🌐', colorBg: 'rgba(26,86,219,0.10)', url: '/pages/learning/index' },
      { id: 6, name: '刷题中心', desc: '考点练习', icon: '📝', colorBg: 'rgba(0,91,172,0.10)', url: '/pages/quiz/index' },
    ],

    // 推荐内容（默认 fallback）
    recommends: [
      { id: 1, title: '新型液压破拆工具组的操作规范与维护保养', tag: '器材篇', icon: '🔧', bg: '#e8f0fe', views: '3.6k' },
      { id: 2, title: '基层中队战训一体化建设经验分享', tag: '经验帖', icon: '📝', bg: '#fef7e0', interactions: '528' },
    ],

    loading: true,
    loadError: false,
  },

  onLoad: function () {
    const app = getApp();
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 44,
    });

    // 从服务器获取 Banner 和推荐数据
    this.fetchHomeData();
  },

  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
  },

  /**
   * 获取首页数据（Banner + 推荐）
   */
  fetchHomeData: function () {
    const that = this;

    // 并行请求 Banner 和推荐
    Promise.all([
      get('/banners').catch(function () { return null; }),
      get('/recommends').catch(function () { return null; }),
    ])
      .then(function (results) {
        const bannerData = results[0];
        const recommendData = results[1];

        const updates = { loading: false };

        // Banner 数据转换
        if (bannerData && Array.isArray(bannerData) && bannerData.length > 0) {
          const bannerColors = [
            'linear-gradient(135deg, #1a56db, #1648c0)',
            'linear-gradient(135deg, #005BAC, #004a8f)',
            'linear-gradient(135deg, #5a5a5a, #444444)',
          ];
          updates.banners = bannerData.map(function (item, index) {
            return {
              id: item.id,
              title: item.title,
              subtitle: item.linkUrl ? '点击查看详情' : '',
              icon: index === 0 ? '🚒' : index === 1 ? '🌊' : '🌗',
              bg: bannerColors[index % 3],
            };
          });
        }

        // 推荐数据转换
        if (recommendData && Array.isArray(recommendData) && recommendData.length > 0) {
          const tagColors = { video: '#e8f0fe', training: '#fef7e0', post: '#e8f0fe' };
          updates.recommends = recommendData.map(function (item) {
            return {
              id: item.id,
              title: item.title,
              tag: item.tag || item.type || '推荐',
              icon: item.type === 'video' ? '▶️' : item.type === 'training' ? '💪' : '📝',
              bg: tagColors[item.type] || '#f5f5f5',
              views: '',
            };
          });
        }

        that.setData(updates);
      })
      .catch(function () {
        // 保持默认 fallback 数据
        that.setData({ loading: false, loadError: true });
      });
  },

  onSearchTap: function () {
    wx.navigateTo({ url: '/pages/search/index' });
  },

  onShareAppMessage: function () {
    return {
      title: '应急救援战训营 - 专业救援培训平台',
      path: '/pages/index/index',
    };
  },
});
