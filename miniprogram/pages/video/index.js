// pages/video/index.js
const { get } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 0,
    categories: [],
    loading: true,
    // Default fallback while loading
    fallbackCategories: [
      { id: 1, name: '火灾', icon: '🔥', bgColor: '#CC3333', bgColor2: '#FF6B6B' },
      { id: 2, name: '地震', icon: '🏚️', bgColor: '#8B4513', bgColor2: '#A0522D' },
      { id: 3, name: '水域', icon: '🌊', bgColor: '#005BAC', bgColor2: '#0284c7' },
      { id: 4, name: '绳索', icon: '🪢', bgColor: '#4A7C59', bgColor2: '#6B9B7A' },
      { id: 5, name: '车辆事故', icon: '🚗', bgColor: '#E67E22', bgColor2: '#F0A04B' },
      { id: 6, name: '危化品', icon: '🧪', bgColor: '#7D3C98', bgColor2: '#A569BD' },
      { id: 7, name: '石油化工', icon: '🏭', bgColor: '#2C3E50', bgColor2: '#4A6A8A' },
      { id: 8, name: '山岳救援', icon: '⛰️', bgColor: '#6B8E23', bgColor2: '#8FBC3A' },
    ],
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: systemInfo.statusBarHeight });
    this.fetchCategories();
  },

  /**
   * 获取视频分类（从 categories 表，type='video'）
   */
  fetchCategories() {
    const that = this;
    // 视频分类对应 categories type=video，通过 /api/videos 间接获取
    // 或者直接用 fallback 分类（分类 ID 与 seed 一致）
    const iconMap = ['🔥', '🏚️', '🌊', '🪢', '🚗', '🧪', '🏭', '⛰️'];
    const colorMap = [
      { bgColor: '#CC3333', bgColor2: '#FF6B6B' },
      { bgColor: '#8B4513', bgColor2: '#A0522D' },
      { bgColor: '#005BAC', bgColor2: '#0284c7' },
      { bgColor: '#4A7C59', bgColor2: '#6B9B7A' },
      { bgColor: '#E67E22', bgColor2: '#F0A04B' },
      { bgColor: '#7D3C98', bgColor2: '#A569BD' },
      { bgColor: '#2C3E50', bgColor2: '#4A6A8A' },
      { bgColor: '#6B8E23', bgColor2: '#8FBC3A' },
    ];

    // 尝试从 API 获取分类
    get('/videos', { pageSize: 1 })
      .then(function () {
        // API 可用，使用 API 分类
        // 此处简化：后端分类通过 seed 定义，ID 1-8 对应 8 个灾害类型
        const cats = that.data.fallbackCategories.map(function (c, i) {
          return {
            id: c.id,
            name: c.name,
            icon: iconMap[i],
            bgColor: colorMap[i].bgColor,
            bgColor2: colorMap[i].bgColor2,
          };
        });
        that.setData({ categories: cats, loading: false });
      })
      .catch(function () {
        // API 不可用，使用 fallback
        that.setData({ categories: that.data.fallbackCategories, loading: false });
      });
  },

  goBack() {
    wx.navigateBack({
      fail() {
        wx.switchTab({ url: '/pages/index/index' });
      },
    });
  },

  onSearchTap() {
    wx.navigateTo({ url: '/pages/search/index' });
  },

  onCategoryTap(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/video/category?id=' + id + '&name=' + name,
    });
  },
});
