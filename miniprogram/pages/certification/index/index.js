const app = getApp();

Page({
  data: {
    statusBarHeight: 0,

    // 当前用户已获得的等级
    currentLevel: '初级消防员',

    levels: [
      {
        id: 1,
        name: '初级消防员',
        emoji: '⭐',
        grade: '五级',
        requirements: '从事本职业工作1年以上，完成规定培训学时',
        subjects: '消防基础理论、消防设施操作、灭火救援基本技能',
        validity: '5年',
        color: '#1a56db',
        achieved: true
      },
      {
        id: 2,
        name: '中级消防员',
        emoji: '⭐⭐',
        grade: '四级',
        requirements: '取得初级证书后工作3年以上，或从事本职业工作5年以上',
        subjects: '消防指挥基础、特种救援技术、装备维护管理',
        validity: '5年',
        color: '#0284c7',
        achieved: false
      },
      {
        id: 3,
        name: '高级消防员',
        emoji: '⭐⭐⭐',
        grade: '三级',
        requirements: '取得中级证书后工作4年以上，或从事本职业工作8年以上',
        subjects: '救援指挥决策、复杂环境救援、培训教学能力',
        validity: '5年',
        color: '#e67e22',
        achieved: false
      },
      {
        id: 4,
        name: '技师',
        emoji: '🏅',
        grade: '二级',
        requirements: '取得高级证书后工作4年以上，或从事本职业工作12年以上',
        subjects: '应急救援策划、技术研发与革新、专项技能鉴定',
        validity: '5年',
        color: '#ba1a1a',
        achieved: false
      }
    ]
  },

  onLoad: function () {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 44
    });
  },

  goBack: function () {
    wx.navigateBack({
      fail: function () {
        wx.switchTab({ url: '/pages/index/index' });
      }
    });
  }
});
