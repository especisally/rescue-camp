// pages/forum/detail.js
Page({
  data: {
    statusBarHeight: 0,
    postId: 0,
    commentSort: 'hot',
    showCommentInput: false,
    commentText: '',
    replyTarget: '',
    replyToId: null,

    post: {},
    comments: [],
    relatedPosts: []
  },

  onLoad(options) {
    const systemInfo = wx.getSystemInfoSync();
    const postId = parseInt(options.id) || 1;

    const post = this.getPostData(postId);
    const comments = this.getComments(postId);
    const relatedPosts = this.getRelatedPosts(postId);

    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
      postId,
      post,
      comments,
      relatedPosts
    });
  },

  // 模拟帖子数据
  getPostData(id) {
    const posts = {
      1: {
        id: 1,
        username: '水域救援大队',
        level: 10,
        avatar: '🌊',
        avatarBg: '#dbeafe',
        time: '2026-06-24 14:30',
        title: '【水域救援】激流环境中的团队协作要点与安全注意事项',
        content: '近期在洪涝灾害演练中发现，流速超过3m/s时，传统的横渡绳系统容易出现偏移，我们团队尝试了双锚点加固方案，效果显著。\n\n具体做法是：在原有的单锚点基础上，在上下游各增设一个辅助锚点，形成三角形受力结构。这样不仅可以分散水流冲击力，还能在其中一个锚点意外失效时提供冗余保护。\n\n经过三次实战演练验证，双锚点方案在4.5m/s的激流中仍能保持稳定，安全性提升明显。现将详细操作流程分享如下：\n\n1. 选址评估\n首先需要对两岸地形进行勘察，选择有稳固岩石或大树的位置作为主锚点。如果自然锚点不足，可使用钢钎或救援三脚架作为人工锚点。\n\n2. 主锚点搭建\n使用不低于12mm直径的静力绳，双股绕锚点三圈后打双8字结。注意绳索与岩石接触部位需加垫布或橡胶保护套，防止割绳。\n\n3. 辅助锚点设置\n在主流向上下游各2-3米处设置辅助锚点，用直径10mm辅绳连接到主锚点，形成30°左右的夹角。\n\n4. 横渡绳架设\n主绳与辅助绳汇合后，使用双滑轮和普鲁士结调整张力。张力以绳子弧垂不超过水面50cm为宜。\n\n5. 安全测试\n架设完成后，先用两倍于实际救援重量的沙袋进行测试，确认系统稳定后再投入实战使用。\n\n希望这些经验对战友们有所帮助，也欢迎大家在评论区分享你们的水域救援心得！',
        tags: ['水域救援', '激流技术', '锚点系统', '实战经验'],
        videoThumb: true,
        thumbBg: 'linear-gradient(135deg, #1a3a5c, #2c5f8a)',
        duration: '12:45',
        images: null,
        views: '2.3万',
        like: '950',
        comment: '180',
        share: '320',
        points: 8,
        isLiked: false,
        isFavorited: true,
        isFollowed: false
      },
      2: {
        id: 2,
        username: '火线教官_张',
        level: 14,
        avatar: '🔥',
        avatarBg: '#dbeafe',
        time: '2026-06-23 09:15',
        title: '【实战演示】高层建筑火灾内攻战术及装备携带标准',
        content: '针对10层以上高层建筑，内攻小组至少需要携带X条水带、X具空呼备用瓶，进入前应建立外部供水保障。\n\n很多基层指挥员在内攻时只关注进攻路线，忽略了供水线的建立。一旦内部消火栓失效或者水压不够，整个内攻行动就会陷入被动。\n\n本视频详细演示了我们支队的标准化内攻流程，包括：\n\n- 外部水源勘察与供水线路铺设\n- 进攻入口的选择标准\n- 水带干线的敷设方式\n- 空呼压力管控与撤退预案\n- 紧急呼救信号的传递方法\n\n希望对大家有所启发！',
        tags: ['高层建筑', '内攻战术', '装备标准'],
        videoThumb: true,
        thumbBg: 'linear-gradient(135deg, #3d1c00, #8B4513)',
        duration: '28:10',
        images: null,
        views: '5.1万',
        like: '1.2k',
        comment: '256',
        share: '168',
        points: 3,
        isLiked: true,
        isFavorited: false,
        isFollowed: true
      },
      3: {
        id: 3,
        username: '救援老兵_老五',
        level: 8,
        avatar: '👨‍🚒',
        avatarBg: '#fef3c7',
        time: '2026-06-22 16:45',
        title: '关于液压剪切钳维护的几点不成熟的建议',
        content: '从事消防救援二十年，经手过不下十种品牌的液压破拆工具。最近发现很多基层中队在剪切钳保养方面存在误区，特别是液压油的更换周期和密封件的检查方法。\n\n今天想和战友们分享一些经验：\n\n第一，液压油不是越贵越好，关键看粘度指数和抗磨性能。很多进口品牌推荐的原厂液压油确实好，但国产替代品只要参数匹配，完全可以用，成本能降低60%以上。\n\n第二，密封圈不能等漏油了再换。建议每半年做一次密封性测试，哪怕没有明显泄漏，三年的密封圈也应该预防性更换。我们在去年的一次救援中，就因为一个三年未换的O型圈突然失效，导致剪切钳在关键时刻无法保压，差点酿成大祸。\n\n第三，液压管路接头处是最容易被忽视的地方。每次用完归队后，用干净的抹布擦拭接头，检查有无划痕或变形。这个习惯养成后，能避免80%以上的液压系统故障。\n\n以上都是一些实操经验，欢迎战友们补充纠正！',
        tags: ['液压破拆', '装备维护', '实战经验', '基层建议'],
        videoThumb: false,
        images: null,
        views: '1.5万',
        like: '842',
        comment: '113',
        share: '56',
        points: 0,
        isLiked: false,
        isFavorited: false,
        isFollowed: false
      },
      4: {
        id: 4,
        username: '山岳搜救组',
        level: 10,
        avatar: '⛰️',
        avatarBg: '#d1fae5',
        time: '2026-06-21 11:20',
        title: '绳索救援基本系统搭建——锚点选择与受力分析',
        content: '在野外复杂地形环境下，天然锚点的评估直接影响整个绳索系统的安全性。本文结合IRATA规范和国内实战经验，系统讲解锚点选择的要点。\n\n一、天然锚点的评估标准\n天然锚点（树木、岩石）的选择需要满足以下条件：直径不小于15cm的活树，或者体积不小于1立方米的稳固岩石。\n\n二、受力分析\n单锚点能够承受的力取决于绳索与锚点的接触方式以及力的方向。\n\n三、多点锚点系统\n当单一锚点可靠性不足时，需要构建多点锚点系统来分散负载。\n\n附件中有详细的受力计算表格和常见锚点配置图，供大家参考。',
        tags: ['绳索救援', '锚点系统', '受力分析', 'IRATA'],
        videoThumb: false,
        images: [
          { icon: '🏔️', bg: '#e5e7eb' },
          { icon: '🪢', bg: '#fed7aa' },
          { icon: '📐', bg: '#dbeafe' }
        ],
        views: '1.1万',
        like: '456',
        comment: '67',
        share: '89',
        points: 0,
        isLiked: false,
        isFavorited: true,
        isFollowed: false
      }
    };

    return posts[id] || posts[1];
  },

  // 模拟评论数据
  getComments(postId) {
    return [
      {
        id: 1,
        username: '战训小兵',
        level: 3,
        avatar: '🪖',
        avatarBg: '#e8f5e9',
        time: '2小时前',
        content: '感谢分享！正好我们中队下周要组织水域救援训练，这个双锚点方案非常实用。请问辅助锚点的受力大概占主锚点的多少比例？',
        isAuthor: false,
        isLiked: false,
        likeCount: 12,
        replies: [
          {
            id: 101,
            fromUser: '水域救援大队',
            toUser: '战训小兵',
            content: '根据我们的实测数据，辅助锚点各分担约20-25%的力，主锚点承担剩余50-60%。具体比例会随水流角度变化。'
          }
        ]
      },
      {
        id: 2,
        username: '水域救援大队',
        level: 10,
        avatar: '🌊',
        avatarBg: '#dbeafe',
        time: '1小时前',
        content: '补充一点：在泥沙质河床环境下，钢钎锚固深度建议不少于80cm，且需要向受力反方向倾斜15-20度，这样才能充分发挥锚固力。',
        isAuthor: true,
        isLiked: true,
        likeCount: 28,
        replies: []
      },
      {
        id: 3,
        username: '救援学员_小李',
        level: 1,
        avatar: '👤',
        avatarBg: '#f5f5f5',
        time: '45分钟前',
        content: '作为新人，想请教一下：静力绳和动力绳在横渡系统中有什么区别？为什么要用静力绳而不是动力绳？',
        isAuthor: false,
        isLiked: false,
        likeCount: 5,
        replies: [
          {
            id: 102,
            fromUser: '山岳搜救组',
            toUser: '救援学员_小李',
            content: '横渡系统需要绳索保持稳定的张力，静力绳伸长率低（2-5%），能维持位置稳定。动力绳伸长率高（30%+），会导致横渡者在中间位置大幅下沉，非常危险。'
          },
          {
            id: 103,
            fromUser: '火线教官_张',
            toUser: '救援学员_小李',
            content: '简单理解：动力绳=攀岩保护用（吸收冲击力），静力绳=救援系统用（位置控制）。千万别搞混！'
          }
        ]
      },
      {
        id: 4,
        username: '老兵_王队',
        level: 11,
        avatar: '💪',
        avatarBg: '#fef3c7',
        time: '30分钟前',
        content: '好帖！我们队一直在用类似的方法，不过辅助锚点用的是滑轮组连接到主绳，张力调节更方便。建议大家根据实际场地条件灵活调整。',
        isAuthor: false,
        isLiked: false,
        likeCount: 8,
        replies: []
      },
      {
        id: 5,
        username: '应急救援爱好者',
        level: 2,
        avatar: '📚',
        avatarBg: '#fce4ec',
        time: '15分钟前',
        content: '收藏了！这种来自一线的实战经验比教科书上的理论知识有价值多了。希望楼主以后多多分享。',
        isAuthor: false,
        isLiked: false,
        likeCount: 3,
        replies: []
      }
    ];
  },

  // 模拟相关帖子
  getRelatedPosts(postId) {
    return [
      {
        id: 2,
        title: '【实战演示】高层建筑火灾内攻战术及装备携带标准',
        username: '火线教官_张',
        like: '1.2k',
        comment: '256'
      },
      {
        id: 4,
        title: '绳索救援基本系统搭建——锚点选择与受力分析',
        username: '山岳搜救组',
        like: '456',
        comment: '67'
      },
      {
        id: 3,
        title: '关于液压剪切钳维护的几点不成熟的建议',
        username: '救援老兵_老五',
        like: '842',
        comment: '113'
      }
    ];
  },

  goBack() {
    wx.navigateBack({
      fail() {
        wx.switchTab({ url: '/pages/forum/index' });
      }
    });
  },

  onShare() {
    wx.showShareMenu({
      withShareTicket: true
    });
  },

  onFollow() {
    const post = this.data.post;
    post.isFollowed = !post.isFollowed;
    this.setData({ post });
    wx.showToast({
      title: post.isFollowed ? '已关注' : '已取消关注',
      icon: 'none'
    });
  },

  onLike() {
    const post = this.data.post;
    post.isLiked = !post.isLiked;
    post.like = post.isLiked
      ? String(parseInt(post.like) + 1)
      : String(parseInt(post.like) - 1);
    this.setData({ post });
  },

  onFavorite() {
    const post = this.data.post;
    post.isFavorited = !post.isFavorited;
    this.setData({ post });
    wx.showToast({
      title: post.isFavorited ? '已收藏' : '已取消收藏',
      icon: 'none'
    });
  },

  onSortComments(e) {
    const sort = e.currentTarget.dataset.sort;
    this.setData({ commentSort: sort });
  },

  onLikeComment(e) {
    const commentId = e.currentTarget.dataset.id;
    const comments = this.data.comments.map(c => {
      if (c.id === commentId) {
        c.isLiked = !c.isLiked;
        c.likeCount = c.isLiked ? c.likeCount + 1 : c.likeCount - 1;
      }
      return c;
    });
    this.setData({ comments });
  },

  onReplyComment(e) {
    const { id, name } = e.currentTarget.dataset;
    this.setData({
      showCommentInput: true,
      replyTarget: name,
      replyToId: id,
      commentText: ''
    });
  },

  onFocusComment() {
    this.setData({
      showCommentInput: true,
      replyTarget: '',
      replyToId: null,
      commentText: ''
    });
  },

  onCancelComment() {
    this.setData({
      showCommentInput: false,
      replyTarget: '',
      replyToId: null,
      commentText: ''
    });
  },

  onCommentInput(e) {
    this.setData({ commentText: e.detail.value });
  },

  onSubmitComment() {
    const { commentText, replyTarget, replyToId, comments } = this.data;

    if (!commentText.trim()) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' });
      return;
    }

    // 模拟提交评论
    const newComment = {
      id: Date.now(),
      username: '我',
      level: 5,
      avatar: '👤',
      avatarBg: '#e3f2fd',
      time: '刚刚',
      content: commentText.trim(),
      isAuthor: false,
      isLiked: false,
      likeCount: 0,
      replies: []
    };

    const updatedComments = [newComment, ...comments];

    // 更新帖子评论数
    const post = this.data.post;
    post.comment = String(parseInt(post.comment) + 1);

    this.setData({
      comments: updatedComments,
      post,
      showCommentInput: false,
      replyTarget: '',
      replyToId: null,
      commentText: ''
    });

    wx.showToast({ title: '评论成功', icon: 'success' });
  },

  onRelatedTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/forum/detail?id=' + id
    });
  },

  onMoreRelated() {
    wx.switchTab({ url: '/pages/forum/index' });
  },

  // 空函数，用于阻止事件冒泡
  noop() {},

  onShareAppMessage() {
    return {
      title: this.data.post.title || '帖子详情',
      path: '/pages/forum/detail?id=' + this.data.postId
    };
  }
});
