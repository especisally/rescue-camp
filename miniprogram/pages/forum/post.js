// pages/forum/post.js
const { post, upload } = require('../../utils/request');
const app = getApp();

Page({
  data: {
    statusBarHeight: 0,
    navTotalHeight: 0,

    nature: 'share',
    title: '',
    content: '',
    points: 0,
    showCustomPoints: false,
    customPointsValue: '',
    selectedTags: [],
    agreed: false,
    submitting: false,
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    const statusBarHeight = sysInfo.statusBarHeight;
    const navTotalHeight = statusBarHeight + 44;
    this.setData({ statusBarHeight, navTotalHeight });
  },

  onNatureTap(e) {
    const nature = e.currentTarget.dataset.nature;
    this.setData({ nature });
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  /**
   * 上传图片/视频
   */
  onUploadTap() {
    const that = this;
    wx.chooseMedia({
      count: 9,
      mediaType: ['image', 'video'],
      sourceType: ['album', 'camera'],
      success(res) {
        const files = res.tempFiles;
        wx.showLoading({ title: '上传中...' });

        // Upload files one by one
        const uploadPromises = files.map(function (file) {
          const isVideo = file.fileType === 'video';
          const apiPath = isVideo ? '/upload/video' : '/upload/image';
          return upload(apiPath, file.tempFilePath, isVideo ? 'video' : 'image');
        });

        Promise.all(uploadPromises)
          .then(function (results) {
            wx.hideLoading();
            // Append URLs to content
            const urls = results.map(function (r) { return r.url; });
            const newContent = that.data.content + '\n' + urls.join('\n');
            that.setData({ content: newContent.trim() });
            wx.showToast({ title: '上传成功', icon: 'success' });
          })
          .catch(function () {
            wx.hideLoading();
            wx.showToast({ title: '上传失败', icon: 'none' });
          });
      },
    });
  },

  onPointsTap(e) {
    const points = Number(e.currentTarget.dataset.points);
    this.setData({
      points: this.data.points === points ? 0 : points,
      showCustomPoints: false,
      customPointsValue: '',
    });
  },

  onCustomPointsTap() {
    this.setData({
      showCustomPoints: !this.data.showCustomPoints,
      points: 0,
    });
  },

  onCustomPointsInput(e) {
    this.setData({ customPointsValue: e.detail.value });
  },

  onTagToggle(e) {
    const tag = e.currentTarget.dataset.tag;
    let tags = this.data.selectedTags;
    const idx = tags.indexOf(tag);
    if (idx > -1) {
      tags = tags.filter(function (t) { return t !== tag; });
    } else {
      if (tags.length >= 5) {
        wx.showToast({ title: '最多选择5个标签', icon: 'none' });
        return;
      }
      tags = tags.concat([tag]);
    }
    this.setData({ selectedTags: tags });
  },

  onCustomTagTap() {
    const that = this;
    wx.showModal({
      title: '自定义标签',
      editable: true,
      placeholderText: '输入标签名称',
      success(res) {
        if (res.confirm && res.content) {
          const tag = res.content.trim();
          if (tag && that.data.selectedTags.indexOf(tag) < 0) {
            const tags = that.data.selectedTags.concat([tag]);
            that.setData({ selectedTags: tags });
          }
        }
      },
    });
  },

  onAgreementToggle() {
    this.setData({ agreed: !this.data.agreed });
  },

  /**
   * 发布帖子
   */
  onPublish() {
    const { nature, title, content, agreed, submitting, showCustomPoints, customPointsValue, points, selectedTags } = this.data;

    if (submitting) return;

    if (!title.trim()) {
      wx.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }
    if (!content.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }
    if (!agreed) {
      wx.showToast({ title: '请先阅读并同意协议', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    wx.showLoading({ title: '发布中...' });

    const that = this;
    const postData = {
      title: title.trim(),
      content: content.trim(),
      type: nature !== 'video' ? 'text' : 'video',
      tags: selectedTags,
      points: showCustomPoints ? parseInt(customPointsValue) || 0 : points,
    };

    post('/posts', postData, { auth: true })
      .then(function () {
        wx.hideLoading();
        wx.showToast({ title: '发布成功', icon: 'success' });
        setTimeout(function () {
          wx.navigateBack();
        }, 1500);
      })
      .catch(function (err) {
        that.setData({ submitting: false });
        wx.hideLoading();
        wx.showToast({ title: err.message || '发布失败', icon: 'none' });
      });
  },
});
