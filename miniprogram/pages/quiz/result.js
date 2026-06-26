// pages/quiz/result.js
Page({
  data: {
    statusBarHeight: 0,
    bankId: '',
    score: 0,
    total: 0,
    accuracy: 0,
    duration: 0,
    durationText: '0秒',
    wrongList: [],
    showWrongDetail: false,
    loading: true,
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    const bankId = options.bankId || '';
    const score = parseInt(options.score) || 0;
    const total = parseInt(options.total) || 0;
    const accuracy = parseInt(options.accuracy) || 0;
    const duration = parseInt(options.duration) || 0;

    // 格式化用时
    let durationText = '';
    if (duration >= 3600) {
      const h = Math.floor(duration / 3600);
      const m = Math.floor((duration % 3600) / 60);
      durationText = h + '时' + m + '分';
    } else if (duration >= 60) {
      const m = Math.floor(duration / 60);
      const s = duration % 60;
      durationText = m + '分' + s + '秒';
    } else {
      durationText = duration + '秒';
    }

    // 从 globalData 获取详细结果（含题目信息）
    const app = getApp();
    const quizResult = app.globalData.quizResult;
    const results = quizResult ? quizResult.results || [] : [];
    const questionMap = quizResult ? quizResult.questionMap || {} : {};

    // 构建错题列表
    const wrongList = results
      .filter(function (r) { return !r.correct; })
      .map(function (r) {
        const qInfo = questionMap[r.questionId] || {};
        return {
          id: r.questionId,
          userAnswer: r.selected || '未作答',
          correctAnswer: r.correctAnswer || '',
          questionText: qInfo.question || '(题目已加载)',
          explanation: qInfo.explanation || '',
        };
      });

    this.setData({
      statusBarHeight: sysInfo.statusBarHeight || 20,
      bankId, score, total, accuracy, duration, durationText,
      wrongList: wrongList,
      showWrongDetail: wrongList.length > 0,
      loading: false,
    });

    // Clean up
    app.globalData.quizResult = null;
  },

  goBack() {
    wx.redirectTo({ url: '/pages/quiz/index' });
  },

  onReviewWrong() {
    this.setData({ showWrongDetail: true });
  },

  onToggleWrong() {
    this.setData({ showWrongDetail: !this.data.showWrongDetail });
  },

  onRetry() {
    wx.redirectTo({ url: '/pages/quiz/detail?id=' + this.data.bankId });
  },

  onShareAppMessage() {
    return {
      title: '我完成了答题挑战！得分 ' + this.data.score + '/' + this.data.total + '（' + this.data.accuracy + '%）',
      path: '/pages/quiz/index',
    };
  },
});
