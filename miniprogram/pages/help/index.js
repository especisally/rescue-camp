// pages/help/index.js
const app = getApp();
const { post } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 0,
    faqList: [
      { id: 1, question: '如何使用刷题功能？', answer: '在首页点击「刷题」模块，选择对应的题库即可开始练习。支持单选、多选、判断三种题型。答错的题目会自动收录到错题本。', expanded: false },
      { id: 2, question: '如何发布帖子？', answer: '进入「论坛」板块，点击右下角的「发布」按钮，选择帖子类型，填写标题和正文内容后即可发布。帖子支持上传图片和视频。', expanded: false },
      { id: 3, question: '积分如何获取？', answer: '积分可以通过以下方式获取：每日签到（+5分）、答题练习、发表优质帖子、评论互动等。', expanded: false },
      { id: 4, question: '如何联系客服？', answer: '您可以通过以下方式联系我们：\n1. 反馈邮箱：support@yjjyzxy.top\n2. 意见反馈：在本页面下方提交反馈表单\n我们会在24小时内回复您的问题。', expanded: false },
    ],
    feedbackText: '',
    submitting: false,
  },

  onLoad: function () { this.setData({ statusBarHeight: app.globalData.statusBarHeight || 44 }); },

  goBack: function () { wx.navigateBack({ fail: function () { wx.switchTab({ url: '/pages/index/index' }); } }); },

  onFaqToggle: function (e) {
    const index = e.currentTarget.dataset.index;
    const faqList = this.data.faqList.map(function (item, i) {
      if (i === index) { item.expanded = !item.expanded; } return item;
    });
    this.setData({ faqList: faqList });
  },

  onFeedbackInput: function (e) { this.setData({ feedbackText: e.detail.value }); },

  onSubmitFeedback: function () {
    const text = this.data.feedbackText.trim();
    if (!text) { wx.showToast({ title: '请输入反馈内容', icon: 'none' }); return; }
    if (this.data.submitting) return;
    this.setData({ submitting: true });
    const that = this;
    post('/feedback', { content: text }, { auth: true })
      .then(function () {
        that.setData({ feedbackText: '', submitting: false });
        wx.showToast({ title: '感谢您的反馈！', icon: 'success' });
      })
      .catch(function () { that.setData({ submitting: false }); });
  },
});
