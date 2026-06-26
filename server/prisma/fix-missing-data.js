/**
 * 修复缺失的种子数据（不删除已有数据）
 * 运行：node prisma/fix-missing-data.js
 *
 * 用途：补充因外键约束导致创建失败的数据（Post/Comment/Recommend/Learning）
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 开始补充缺失数据...\n');

  // ==================== 1. 测试用户（如果不存在） ====================
  let testUser = await prisma.user.findFirst({ where: { openid: 'seed_test_user_001' } });
  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        openid: 'seed_test_user_001',
        nickname: '消防员小王',
        avatar: null,
        level: '认证用户',
        role: 'certified',
        points: 100,
      },
    });
    console.log('✅ 测试用户已创建: 消防员小王 (id=' + testUser.id + ')');
  } else {
    console.log('⏭️ 测试用户已存在 (id=' + testUser.id + ')');
  }

  // ==================== 2. 帖子（只添加不存在的） ====================
  const existingPosts = await prisma.post.count();
  if (existingPosts === 0) {
    const posts = [
      {
        title: '高层建筑灭火救援实战经验分享',
        content: '上周参与了辖区一栋32层住宅楼的火灾扑救，起火层在18楼。分享几点心得：\n\n1. 提前熟悉建筑平面图非常重要，我们提前掌握了户型布局，进攻路线清晰\n2. 水带沿楼梯铺设时注意每层固定，防止水锤效应导致接口崩脱\n3. 电梯前室是重要的进攻和撤离通道，必须保持正压送风\n\n欢迎大家交流讨论！',
        type: 'text', userId: testUser.id, tags: ['灭火', '高层建筑', '实战经验'], views: 356, likes: 28, commentsCount: 3, isEssence: true, status: 1,
      },
      {
        title: '新入队消防员体能训练计划（附详细安排）',
        content: '为新入队的战友整理了一份体能训练计划，经过三个月的实践，效果显著。\n\n【周一】力量训练：深蹲 5×10、卧推 5×8、引体向上 5×MAX\n【周三】耐力训练：3000米跑 + 负重登楼 10层×3\n【周五】技能体能结合：400米疏散物资操 + 水带铺设',
        type: 'text', userId: testUser.id, tags: ['体能训练', '新人培训', '训练计划'], views: 520, likes: 42, commentsCount: 2, isEssence: true, status: 1,
      },
      {
        title: '关于危化品运输车辆事故处置的几点思考',
        content: '近期危化品运输车辆事故增多，总结几个关键点：\n\n1. 到达现场后先从上风向接近，利用检测仪器确定泄漏物质\n2. 根据UN编号和危险品标志牌快速判断物质属性\n3. 警戒区半径不宜小于150米（易燃气体）\n4. 处置前必须确定堵漏方案，准备充足的水枪掩护',
        type: 'text', userId: testUser.id, tags: ['危化品', '交通事故', '安全处置'], views: 289, likes: 35, commentsCount: 2, isEssence: false, status: 1,
      },
      {
        title: '空气呼吸器常见故障及排除方法（视频）',
        content: '空呼是我们火场内攻的生命保障，常见故障及处理方法：\n1. 供气阀堵塞：拆下清洁或更换\n2. 面罩漏气：检查密封圈和头带紧固\n3. 压力表失灵：立即更换备用空呼\n\n建议每班次上岗前对空呼进行全面检查。',
        type: 'video', userId: testUser.id, tags: ['装备维护', '空呼', '教程'], views: 420, likes: 56, commentsCount: 4, isEssence: true, status: 1,
      },
      {
        title: '求助：如何提高消防栓供水效率？',
        content: '在最近的一次演练中，发现消防栓供水效率偏低，水压不足影响了前方灭火。想请教各位战友：\n\n1. 如何判断消防栓的实际供水能力？\n2. 多辆消防车串联供水时有哪些注意事项？\n3. 有没有推荐的供水编成方案？',
        type: 'text', userId: testUser.id, tags: ['供水', '技术讨论', '求助'], views: 180, likes: 12, commentsCount: 1, isEssence: false, status: 1,
      },
    ];
    for (const post of posts) {
      await prisma.post.create({ data: post });
    }
    console.log('✅ 帖子: 5 篇');
  } else {
    console.log('⏭️ 帖子已存在 (' + existingPosts + ' 篇)');
  }

  // ==================== 3. 评论（只添加不存在的） ====================
  const existingComments = await prisma.comment.count();
  if (existingComments === 0) {
    const comments = [
      { userId: testUser.id, postId: 1, content: '写得太好了！电梯前室的正压送风确实关键，我们之前吃过亏。', likes: 8, status: 1 },
      { userId: testUser.id, postId: 1, parentId: 1, replyToUid: testUser.id, content: '是的，另外补充一点：要确认消防电梯是否可用，能大大提高运兵效率。', likes: 3, status: 1 },
      { userId: testUser.id, postId: 1, content: '学习了，下次出警前一定要提前熟悉建筑结构。', likes: 5, status: 1 },
      { userId: testUser.id, postId: 2, content: '这个计划太实用了！引体向上一直是我弱项，有没有进阶训练方法？', likes: 6, status: 1 },
      { userId: testUser.id, postId: 3, content: '危化品处置确实需要谨慎，建议加上侦检仪器的使用培训。', likes: 4, status: 1 },
      { userId: testUser.id, postId: 4, content: '空呼面罩漏气的问题我也遇到过，换了硅胶密封圈后好多了。', likes: 7, status: 1 },
    ];
    for (const comment of comments) {
      await prisma.comment.create({ data: comment });
    }
    console.log('✅ 评论: 6 条');
  } else {
    console.log('⏭️ 评论已存在 (' + existingComments + ' 条)');
  }

  // ==================== 4. 推荐内容（只添加不存在的） ====================
  const existingRecommends = await prisma.recommend.count();
  if (existingRecommends === 0) {
    const recommends = [
      { title: '高层建筑火灾扑救要点', type: 'video', targetId: 1, coverUrl: '/uploads/images/rec-1.jpg', tag: '热门课程', sort: 1, status: 1 },
      { title: '地震救援基础知识', type: 'video', targetId: 2, coverUrl: '/uploads/images/rec-2.jpg', tag: '新上课程', sort: 2, status: 1 },
      { title: '高层建筑水带铺设操', type: 'training', targetId: 1, coverUrl: '/uploads/images/rec-3.jpg', tag: '推荐操法', sort: 3, status: 1 },
      { title: '高层建筑灭火救援实战经验分享', type: 'post', targetId: 1, coverUrl: '/uploads/images/rec-4.jpg', tag: '精华帖', sort: 4, status: 1 },
      { title: '新入队消防员体能训练计划', type: 'post', targetId: 2, coverUrl: '/uploads/images/rec-5.jpg', tag: '热门', sort: 5, status: 1 },
    ];
    for (const rec of recommends) {
      await prisma.recommend.create({ data: rec });
    }
    console.log('✅ 推荐: 5 条');
  } else {
    console.log('⏭️ 推荐已存在 (' + existingRecommends + ' 条)');
  }

  // ==================== 5. 拓展学习（只添加不存在的） ====================
  const existingLearning = await prisma.learning.count();
  if (existingLearning === 0) {
    const learningItems = [
      { title: '消防战术指挥决策案例分析', type: 'video', category: '战术指挥', author: '消防指挥学院', duration: 2700, views: 1250, status: 1 },
      { title: '国际应急救援体系建设概览', type: 'video', category: '国际视野', author: '应急救援研究中心', duration: 1800, views: 680, status: 1 },
      { title: '消防装备技术创新报告', type: 'doc', category: '装备技术', author: '装备研究所', fileSize: '2.4MB', views: 430, status: 1 },
      { title: '基层消防站体能训练科学化方案', type: 'doc', category: '基础训练', author: '体能训练组', fileSize: '1.8MB', views: 890, status: 1 },
      { title: '大型商业综合体消防安全管理规范', type: 'doc', category: '规范标准', author: '安全管理部', fileSize: '3.1MB', views: 560, status: 1 },
      { title: '无人机在消防救援中的应用实践', type: 'video', category: '新技术', author: '科技信息化处', duration: 1500, views: 310, status: 1 },
    ];
    for (const item of learningItems) {
      await prisma.learning.create({ data: item });
    }
    console.log('✅ 拓展学习: 6 条');
  } else {
    console.log('⏭️ 拓展学习已存在 (' + existingLearning + ' 条)');
  }

  console.log('\n🎉 缺失数据补充完成！');
}

main()
  .catch((e) => {
    console.error('❌ 数据补充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
