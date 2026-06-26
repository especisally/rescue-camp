// pages/quiz/result.js
const app = getApp();

Page({
  data: {
    statusBarHeight: 0,
    correctCount: 32,
    totalCount: 46,
    wrongCount: 14,
    accuracy: 70,
    questions: []
  },

  onLoad: function (options) {
    const correct = parseInt(options.correct) || 32;
    const total = parseInt(options.total) || 46;
    const wrong = total - correct;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    // 生成答题回顾列表
    const questions = [];
    for (let i = 1; i <= total; i++) {
      const isCorrect = i <= correct;
      questions.push({
        index: i,
        title: '题目 ' + i + ' - ' + (isCorrect ? '消防员体能考核标准相关规定' : '高层建筑火灾扑救安全要求'),
        yourAnswer: isCorrect ? 'A' : ['B', 'C', 'D'][Math.floor(Math.random() * 3)],
        correctAnswer: 'A',
        isCorrect: isCorrect
      });
    }

    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 44,
      correctCount: correct,
      totalCount: total,
      wrongCount: wrong,
      accuracy: accuracy,
      questions: questions
    });
  },

  goBack: function () {
    wx.navigateBack({
      delta: 1,
      fail: function () {
        wx.switchTab({ url: '/pages/index/index' });
      }
    });
  },

  onBackToQuiz: function () {
    wx.navigateBack({
      delta: 2,
      fail: function () {
        wx.redirectTo({ url: '/pages/quiz/index' });
      }
    });
  },

  onReviewWrong: function () {
    wx.showToast({ title: '错题本功能开发中', icon: 'none' });
  },

  onShareAppMessage: function () {
    return {
      title: '我在刷题中心答对了 ' + this.data.correctCount + '/' + this.data.totalCount + ' 题！准确率 ' + this.data.accuracy + '%',
      path: '/pages/quiz/index'
    };
  }
});
