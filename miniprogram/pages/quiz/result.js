// pages/quiz/result.js
const { get } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 0,
    bankId: '',
    score: 0,
    total: 0,
    accuracy: 0,
    results: [],
    duration: 0,
    loading: true,
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    const bankId = options.bankId || '';
    const score = parseInt(options.score) || 0;
    const total = parseInt(options.total) || 0;
    const accuracy = parseInt(options.accuracy) || 0;
    const duration = parseInt(options.duration) || 0;

    // Try to get detailed result from global data
    const app = getApp();
    const quizResult = app.globalData.quizResult;

    this.setData({
      statusBarHeight: sysInfo.statusBarHeight || 20,
      bankId, score, total, accuracy, duration,
      results: quizResult ? quizResult.results || [] : [],
      loading: false,
    });

    // Clean up
    app.globalData.quizResult = null;
  },

  goBack() {
    wx.redirectTo({ url: '/pages/quiz/index' });
  },

  onReviewWrong() {
    wx.navigateTo({ url: '/pages/quiz/index' });
    wx.showToast({ title: '错题回顾功能开发中', icon: 'none' });
  },

  onRetry() {
    wx.redirectTo({ url: '/pages/quiz/detail?id=' + this.data.bankId });
  },

  onShareAppMessage() {
    return {
      title: '我完成了答题挑战！得分 ' + this.data.score + '/' + this.data.total,
      path: '/pages/quiz/index',
    };
  },
});
