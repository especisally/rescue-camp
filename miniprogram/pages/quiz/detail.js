// pages/quiz/detail.js
const { get, post } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 0,
    bankId: '',
    bankTitle: '题库加载中...',
    currentIndex: 0,
    totalCount: 0,
    progressPercent: 0,
    showResult: false,
    showSheet: false,
    question: null,
    sheetList: [],
    // 答题记录
    answers: [],        // { questionId, selected }
    questionList: [],   // 当前加载的所有题目
    startTime: 0,
  },

  onLoad(options) {
    const systemInfo = wx.getSystemInfoSync();
    const bankId = options.id || '';
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
      bankId,
      startTime: Date.now(),
    });
    this.fetchQuestions();
  },

  /**
   * 获取题目列表
   */
  fetchQuestions() {
    const that = this;
    wx.showLoading({ title: '加载题目...' });

    get('/quiz/banks/' + this.data.bankId + '/questions', { pageSize: 100 })
      .then(function (data) {
        wx.hideLoading();
        const questions = (data.list || []).map(function (q) {
          return {
            id: q.id,
            type: q.type === 'single' ? '单选题' : q.type === 'multi' ? '多选题' : '判断题',
            text: q.question,
            options: (q.options || []).map(function (opt) {
              return { label: opt.label, text: opt.text, selected: false, correct: false, wrong: false };
            }),
            correctAnswer: '',  // Hidden from client
            explanation: q.explanation || '',
            favorited: false,
          };
        });

        // Build sheet list
        const sheetList = [];
        for (let i = 0; i < questions.length; i++) {
          sheetList.push({ id: i + 1, done: false });
        }

        that.setData({
          questionList: questions,
          totalCount: questions.length,
          sheetList: sheetList,
        });

        // Load first question
        if (questions.length > 0) {
          that.loadQuestion(0);
        } else {
          wx.showToast({ title: '该题库暂无题目', icon: 'none' });
        }
      })
      .catch(function () {
        wx.hideLoading();
        wx.showToast({ title: '加载题库失败', icon: 'none' });
      });
  },

  /**
   * 加载指定题目
   */
  loadQuestion(index) {
    if (index < 0 || index >= this.data.questionList.length) return;

    const question = this.data.questionList[index];
    // Reset options
    question.options = question.options.map(function (opt) {
      return { label: opt.label, text: opt.text, selected: false, correct: false, wrong: false };
    });

    const progressPercent = this.data.totalCount > 0 ? ((index + 1) / this.data.totalCount) * 100 : 0;

    this.setData({
      currentIndex: index,
      progressPercent: progressPercent,
      showResult: false,
      question: question,
    });
  },

  /**
   * 选择选项
   */
  onSelectOption(e) {
    if (this.data.showResult) return;
    const { label } = e.currentTarget.dataset;
    const question = this.data.question;
    if (!question) return;

    const isMulti = question.type === '多选题';

    if (isMulti) {
      // 多选：toggle selection
      const options = question.options.map(function (opt) {
        if (opt.label === label) {
          opt.selected = !opt.selected;
        }
        return opt;
      });
      this.setData({ 'question.options': options });
    } else {
      // 单选/判断：选择后立即判断
      const options = question.options.map(function (opt) {
        opt.selected = opt.label === label;
        return opt;
      });
      this.setData({ 'question.options': options, showResult: true });

      // Record answer
      this.recordAnswer(question.id, label);
    }
  },

  /**
   * 多选确认
   */
  onMultiConfirm() {
    if (!this.data.showResult) {
      const question = this.data.question;
      const selected = question.options
        .filter(function (o) { return o.selected; })
        .map(function (o) { return o.label; })
        .join(',');
      if (!selected) {
        wx.showToast({ title: '请选择至少一个选项', icon: 'none' });
        return;
      }
      this.recordAnswer(question.id, selected);
      this.setData({ showResult: true });
    }
  },

  /**
   * 记录答案
   */
  recordAnswer(questionId, selected) {
    const answers = this.data.answers;
    const idx = answers.findIndex(function (a) { return a.questionId === questionId; });
    if (idx >= 0) {
      answers[idx].selected = selected;
    } else {
      answers.push({ questionId: questionId, selected: selected });
    }

    // Update sheet
    const sheetList = this.data.sheetList;
    const sheetIdx = sheetList.findIndex(function (s) { return s.id === this.data.currentIndex + 1; }.bind(this));
    if (sheetIdx >= 0) sheetList[this.data.currentIndex].done = true;

    this.setData({ answers: answers, sheetList: sheetList });
  },

  goBack() {
    wx.navigateBack({
      fail() { wx.redirectTo({ url: '/pages/quiz/index' }); },
    });
  },

  onPrev() {
    if (this.data.currentIndex <= 0) {
      wx.showToast({ title: '已经是第一题', icon: 'none' });
      return;
    }
    this.loadQuestion(this.data.currentIndex - 1);
  },

  onNext() {
    if (this.data.currentIndex >= this.data.totalCount - 1) {
      wx.showToast({ title: '已经是最后一题', icon: 'none' });
      return;
    }
    this.loadQuestion(this.data.currentIndex + 1);
  },

  /**
   * 交卷
   */
  onFinish() {
    const unanswered = this.data.totalCount - this.data.answers.length;
    let content = '确定要提交试卷吗？交卷后将无法修改答案。';
    if (unanswered > 0) {
      content = '还有 ' + unanswered + ' 题未做，确定提交吗？';
    }

    const that = this;
    wx.showModal({
      title: '交卷确认',
      content: content,
      success(res) {
        if (res.confirm) {
          that.submitAnswers();
        }
      },
    });
  },

  /**
   * 提交答题
   */
  submitAnswers() {
    const that = this;
    wx.showLoading({ title: '交卷中...' });

    const duration = Math.floor((Date.now() - this.data.startTime) / 1000);

    post('/quiz/submit', {
      bankId: parseInt(this.data.bankId),
      answers: this.data.answers,
      duration: duration,
    }, { auth: true })
      .then(function (result) {
        wx.hideLoading();
        // Navigate to result page with data
        const app = getApp();
        app.globalData.quizResult = result;
        wx.redirectTo({
          url: '/pages/quiz/result?bankId=' + that.data.bankId + '&score=' + result.score + '&total=' + result.total + '&accuracy=' + result.accuracy,
        });
      })
      .catch(function (err) {
        wx.hideLoading();
        wx.showToast({ title: err.message || '交卷失败', icon: 'none' });
      });
  },

  onToggleFav() {
    const question = this.data.question;
    if (!question) return;
    question.favorited = !question.favorited;
    this.setData({ question: question });
    wx.showToast({
      title: question.favorited ? '已收藏' : '已取消收藏',
      icon: 'none',
    });
  },

  onShowSheet() {
    const sheetList = this.data.sheetList.map(function (item, i) {
      return { id: item.id, done: i < this.data.currentIndex || item.done };
    }.bind(this));
    this.setData({ showSheet: true, sheetList: sheetList });
  },

  onHideSheet() {
    this.setData({ showSheet: false });
  },

  onSheetSelect(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ showSheet: false });
    this.loadQuestion(index - 1);
  },
});
