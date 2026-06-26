/**
 * 种子数据脚本
 * 运行：npx prisma db seed（需要 package.json 中配置 "prisma": { "seed": "node prisma/seed.js" }）
 *     或直接用 node prisma/seed.js
 *
 * 设计为可重复执行（使用 upsert + 先删后插策略）
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始填充种子数据...\n');

  // ==================== 1. 管理员账号 ====================
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: adminPassword, role: 'admin' },
  });
  console.log('✅ 管理员账号: admin / admin123');

  // ==================== 2. 分类数据 ====================

  const videoCategories = [
    { name: '火灾救援', type: 'video', sort: 1 },
    { name: '地震救援', type: 'video', sort: 2 },
    { name: '水域救援', type: 'video', sort: 3 },
    { name: '绳索救援', type: 'video', sort: 4 },
    { name: '车辆事故', type: 'video', sort: 5 },
    { name: '危化品事故', type: 'video', sort: 6 },
    { name: '石油化工', type: 'video', sort: 7 },
    { name: '山岳救援', type: 'video', sort: 8 },
  ];

  for (const cat of videoCategories) {
    await prisma.category.upsert({
      where: { id: cat.sort },
      update: { name: cat.name },
      create: { id: cat.sort, ...cat },
    });
  }
  console.log('✅ 视频分类: 8 类');

  const trainingCategories = [
    { name: '灭火操法', type: 'training', sort: 1 },
    { name: '救人操法', type: 'training', sort: 2 },
    { name: '体能竞技', type: 'training', sort: 3 },
    { name: '装备应用', type: 'training', sort: 4 },
  ];

  for (let i = 0; i < trainingCategories.length; i++) {
    await prisma.category.upsert({
      where: { id: 10 + i },
      update: { name: trainingCategories[i].name },
      create: { id: 10 + i, ...trainingCategories[i] },
    });
  }
  console.log('✅ 训练分类: 4 类');

  const equipCategories = [
    { name: '基础装备', type: 'equipment', sort: 1 },
    { name: '特种装备', type: 'equipment', sort: 2 },
    { name: '破拆器材', type: 'equipment', sort: 3 },
    { name: '灭火药剂', type: 'equipment', sort: 4 },
    { name: '急救器材', type: 'equipment', sort: 5 },
    { name: '侦检仪器', type: 'equipment', sort: 6 },
  ];

  for (let i = 0; i < equipCategories.length; i++) {
    await prisma.category.upsert({
      where: { id: 20 + i },
      update: { name: equipCategories[i].name },
      create: { id: 20 + i, ...equipCategories[i] },
    });
  }
  console.log('✅ 装备分类: 6 类');

  const quizCategories = [
    { name: '作战训练安全', type: 'quiz', sort: 1 },
    { name: '灭火救援', type: 'quiz', sort: 2 },
    { name: '晋级考核', type: 'quiz', sort: 3 },
    { name: '职业技能鉴定', type: 'quiz', sort: 4 },
    { name: '水域救援', type: 'quiz', sort: 5 },
    { name: '绳索救援', type: 'quiz', sort: 6 },
  ];

  for (let i = 0; i < quizCategories.length; i++) {
    await prisma.category.upsert({
      where: { id: 30 + i },
      update: { name: quizCategories[i].name },
      create: { id: 30 + i, ...quizCategories[i] },
    });
  }
  console.log('✅ 题库分类: 6 类');

  // ==================== 3. Banner 数据（先清再插，避免重复） ====================
  await prisma.banner.deleteMany();
  const banners = [
    { title: '消防技能培训', imageUrl: '/uploads/images/banner-1.jpg', linkUrl: '', sort: 1 },
    { title: '应急救援演练', imageUrl: '/uploads/images/banner-2.jpg', linkUrl: '', sort: 2 },
    { title: '装备操作教程', imageUrl: '/uploads/images/banner-3.jpg', linkUrl: '', sort: 3 },
  ];
  for (const banner of banners) {
    await prisma.banner.create({ data: banner });
  }
  console.log('✅ Banner: 3 张');

  // ==================== 4. 示例视频数据（先清再插） ====================
  await prisma.video.deleteMany();
  const videos = [
    { title: '高层建筑火灾扑救要点', categoryId: 1, duration: 1860, author: '消防教官', views: 1520, description: '本课程讲解高层建筑火灾的特点和扑救技术要点。' },
    { title: '地震救援基础知识', categoryId: 2, duration: 2400, author: '应急救援中心', views: 980, description: '学习地震救援的基本流程和注意事项。' },
    { title: '水域救援安全规范', categoryId: 3, duration: 1200, author: '水上救援队', views: 2100, description: '水域救援安全操作规程和实战案例分析。' },
    { title: '山地搜救技术', categoryId: 8, duration: 1500, author: '山地救援队', views: 670, description: '山岳地形中的搜救技术和团队配合。' },
  ];
  for (const video of videos) {
    await prisma.video.create({ data: { ...video, status: 1 } });
  }
  console.log('✅ 示例视频: 4 条');

  // ==================== 5. 示例危化品数据（先清再插） ====================
  await prisma.chemical.deleteMany();
  const chemicals = [
    {
      name: '苯', formula: 'C₆H₆', unNumber: '1114', hazardClass: '第3类 易燃液体', hazardColor: '#FF0000',
      properties: { molecularWeight: '78.11', boilingPoint: '80.1℃', density: '0.88 g/cm³', appearance: '无色透明液体' },
      dangers: [{ title: '易燃', desc: '遇明火、高热极易燃烧爆炸' }, { title: '有毒', desc: '长期接触可致白血病' }],
      steps: [{ title: '泄漏处置', desc: '切断火源，用沙土围堵，收集回收' }, { title: '灭火方法', desc: '使用泡沫、二氧化碳、干粉灭火' }],
      protections: [{ title: '呼吸防护', desc: '佩戴自给式呼吸器' }, { title: '身体防护', desc: '穿防静电工作服' }],
    },
    {
      name: '硫酸', formula: 'H₂SO₄', unNumber: '1830', hazardClass: '第8类 腐蚀品', hazardColor: '#FFFFFF',
      properties: { molecularWeight: '98.08', boilingPoint: '337℃', density: '1.84 g/cm³', appearance: '无色油状液体' },
      dangers: [{ title: '强腐蚀性', desc: '对皮肤、黏膜有强烈刺激和腐蚀作用' }],
      steps: [{ title: '泄漏处置', desc: '用沙土、石灰混合，收集回收' }],
      protections: [{ title: '身体防护', desc: '穿耐酸碱防护服、戴化学安全防护眼镜' }],
    },
    {
      name: '甲烷', formula: 'CH₄', unNumber: '1971', hazardClass: '第2类 易燃气体', hazardColor: '#FF0000',
      properties: { molecularWeight: '16.04', boilingPoint: '-161.5℃', density: '0.717 g/L', appearance: '无色无味气体' },
      dangers: [{ title: '易燃易爆', desc: '与空气混合形成爆炸性气体，爆炸极限5%-15%' }, { title: '窒息', desc: '高浓度时可致人窒息' }],
      steps: [{ title: '泄漏处置', desc: '切断气源，通风扩散，划定警戒区' }, { title: '灭火方法', desc: '切断气源后使用干粉、CO₂灭火' }],
      protections: [{ title: '呼吸防护', desc: '高浓度环境佩戴自给式呼吸器' }, { title: '身体防护', desc: '穿防静电工作服' }],
    },
    {
      name: '氯气', formula: 'Cl₂', unNumber: '1017', hazardClass: '第2类 有毒气体', hazardColor: '#FFFF00',
      properties: { molecularWeight: '70.9', boilingPoint: '-34.5℃', density: '3.214 g/L', appearance: '黄绿色气体' },
      dangers: [{ title: '剧毒', desc: '吸入可致呼吸道严重损伤，高浓度可致死' }, { title: '强氧化性', desc: '与可燃物接触可引发燃烧' }],
      steps: [{ title: '泄漏处置', desc: '喷洒稀碱液吸收，从上风向接近' }, { title: '灭火方法', desc: '切断气源，用雾状水冷却容器' }],
      protections: [{ title: '呼吸防护', desc: '必须佩戴自给式呼吸器' }, { title: '身体防护', desc: '穿全密闭化学防护服' }],
    },
  ];
  for (const chem of chemicals) {
    await prisma.chemical.create({ data: chem });
  }
  console.log('✅ 示例危化品: 4 条');

  // ==================== 6. 示例考核标准（先清再插） ====================
  await prisma.standard.deleteMany();
  const standards = [
    {
      title: '3000米跑考核标准', category: '体能考核', targetUser: '全体消防员',
      items: [{ name: '优秀', standard: '≤11分30秒' }, { name: '良好', standard: '≤12分30秒' }, { name: '合格', standard: '≤13分30秒' }],
      detail: '在标准400米跑道上进行，记录完成3000米的时间。',
    },
    {
      title: '空气呼吸器操作考核', category: '技能考核', targetUser: '全体消防员',
      items: [{ name: '优秀', standard: '≤45秒' }, { name: '良好', standard: '≤55秒' }, { name: '合格', standard: '≤65秒' }],
      detail: '从准备区开始，完成空气呼吸器穿戴并供气。',
    },
    {
      title: '消防理论知识考核', category: '理论考核', targetUser: '全体消防员',
      items: [{ name: '优秀', standard: '≥90分' }, { name: '良好', standard: '≥80分' }, { name: '合格', standard: '≥60分' }],
      detail: '闭卷笔试，含单选题、多选题、判断题，满分100分。',
    },
    {
      title: '单杠卷身上考核标准', category: '体能考核', targetUser: '全体消防员',
      items: [{ name: '优秀', standard: '≥15个' }, { name: '良好', standard: '≥10个' }, { name: '合格', standard: '≥6个' }],
      detail: '正手握杠，完成卷身上动作，下颌过杠计数1次。',
    },
  ];
  for (const std of standards) {
    await prisma.standard.create({ data: std });
  }
  console.log('✅ 示例考核标准: 4 条');

  // ==================== 7. 示例训练操法（先清再插） ====================
  await prisma.training.deleteMany();
  const trainings = [
    {
      title: '高层建筑水带铺设操', categoryId: 10,
      steps: [
        { title: '第一步：装备准备', desc: '检查水带、分水器、水枪是否完好，携带至起点。' },
        { title: '第二步：水带连接', desc: '沿楼梯铺设水带，每层预留适当长度，接口连接牢固。' },
        { title: '第三步：分水器设置', desc: '在进攻楼层下一层设置分水器，连接主干线和进攻线。' },
        { title: '第四步：水枪阵地', desc: '在进攻层建立水枪阵地，确认水压正常后开始作业。' },
      ],
      equipment: ['φ80mm水带', 'φ65mm水带', '分水器', '直流开关水枪', '水带挂钩'],
      cautions: '水带沿楼梯铺设时注意转角处固定，防止打折影响供水；进攻前确认安全通道畅通。',
    },
    {
      title: '交通事故破拆救人操', categoryId: 11,
      steps: [
        { title: '第一步：现场评估', desc: '评估事故车辆状况，识别危险源（燃油泄漏、电路短路），布置警戒。' },
        { title: '第二步：车辆稳固', desc: '使用支撑杆稳固车辆，防止救援过程中车辆位移。' },
        { title: '第三步：破拆作业', desc: '根据被困人员位置选择破拆点，使用液压扩张器/剪切器进行破拆。' },
        { title: '第四步：伤员转移', desc: '配合医疗人员，使用脊柱板将伤员安全转移至救护车。' },
      ],
      equipment: ['液压扩张器', '液压剪切器', '支撑杆', '玻璃破碎器', '脊柱板'],
      cautions: '注意安全气囊未触发风险，破拆前需断电处理；操作液压工具时保持稳定站位。',
    },
    {
      title: '400米疏散物资操', categoryId: 12,
      steps: [
        { title: '起跑阶段', desc: '听到哨音后起跑，跑至50米处拿起2盘φ80mm水带。' },
        { title: '负重跑阶段', desc: '携带水带跑至100米处放下，跑至120米处扛起假人（60kg）。' },
        { title: '疏散转移', desc: '将假人搬运至140米处放下，跑至160米处提起泡沫桶（2×16kg）。' },
        { title: '冲刺阶段', desc: '将泡沫桶搬运至200米终点线。记录全程时间。' },
      ],
      equipment: ['φ80mm水带×2', '假人（60kg）', '泡沫桶（16kg×2）'],
      cautions: '搬运假人时注意保护腰部，采用正确搬运姿势；全程需在跑道范围内完成。',
    },
    {
      title: '空气呼吸器快速着装操', categoryId: 13,
      steps: [
        { title: '第一步：检查确认', desc: '检查气瓶压力（≥25MPa）、面罩密封性、报警器功能。' },
        { title: '第二步：穿戴背托', desc: '双手握住背托两侧，举过头顶后放下，调整肩带和腰带。' },
        { title: '第三步：佩戴面罩', desc: '自上而下佩戴面罩，收紧头带，确认密封。' },
        { title: '第四步：打开气瓶', desc: '逆时针旋转气瓶阀至全开，检查压力表读数，连接供气阀。' },
      ],
      equipment: ['正压式空气呼吸器', '备用气瓶'],
      cautions: '穿戴过程需在60秒内完成；面罩密封检查必须通过（手掌封住接口吸气不进气）。',
    },
  ];
  for (const t of trainings) {
    await prisma.training.create({ data: { ...t, status: 1 } });
  }
  console.log('✅ 示例训练操法: 4 条');

  // ==================== 8. 示例装备数据（先清再插） ====================
  await prisma.equipment.deleteMany();
  const equipmentList = [
    {
      name: '正压式空气呼吸器 RHZK6.8/30', model: 'RHZK6.8/30', categoryId: 20,
      specs: [{ name: '气瓶容量', value: '6.8L' }, { name: '工作压力', value: '30MPa' }, { name: '使用时间', value: '约60min' }, { name: '整机重量', value: '≤10kg' }, { name: '报警压力', value: '5.5±0.5MPa' }],
      usage: '用于消防员在浓烟、毒气或缺氧环境中进行灭火救援时的呼吸防护。使用前需检查气瓶压力和面罩密封性。',
      scenario: '建筑火灾内攻、危化品泄漏处置、隧道救援、有限空间作业。',
      maintenance: '每月检查1次：气瓶压力、面罩密封圈、供气阀灵活性。每年送检1次气瓶水压试验。充气需使用洁净压缩空气。',
    },
    {
      name: '液压破拆工具组', model: 'SP3260+SC357', categoryId: 22,
      specs: [{ name: '扩张器最大扩张力', value: '≥20kN' }, { name: '扩张距离', value: '≥800mm' }, { name: '剪切器最大剪切力', value: '≥300kN' }, { name: '液压泵工作压力', value: '63MPa' }],
      usage: '用于交通事故、建筑物坍塌等救援现场的破拆作业、撑顶作业。',
      scenario: '车辆事故救援、建筑物坍塌救援、地震救援。',
      maintenance: '每次使用后清洁检查，液压油每6个月更换1次，定期检查高压软管有无破损。',
    },
    {
      name: '消防员灭火防护服', model: 'ZFMH-YT', categoryId: 20,
      specs: [{ name: '外层材料', value: '芳纶阻燃面料' }, { name: '防水透气层', value: 'PTFE膜' }, { name: '隔热层', value: '芳纶毡' }, { name: 'TPP值', value: '≥28' }],
      usage: '消防员在灭火救援作业时穿着，提供热防护、防水防风和一定程度的机械防护。',
      scenario: '所有类型火灾扑救现场。',
      maintenance: '每次使用后清洗，阴干不可暴晒。每季度检查反射条和面料完整性。使用寿命约3-5年。',
    },
    {
      name: '热成像仪', model: 'T660', categoryId: 25,
      specs: [{ name: '探测器类型', value: '非制冷焦平面' }, { name: '分辨率', value: '384×288' }, { name: '测温范围', value: '-20℃～+600℃' }, { name: '防护等级', value: 'IP67' }],
      usage: '用于火灾现场搜索被困人员、识别火源位置、检测隐蔽火点。',
      scenario: '建筑火灾搜救、夜间搜救、大面积火灾火点定位。',
      maintenance: '镜头保持清洁，使用后及时充电，存放于干燥环境。每年校准1次。',
    },
    {
      name: '移动式消防水炮', model: 'PSY40', categoryId: 20,
      specs: [{ name: '额定流量', value: '40L/s' }, { name: '射程', value: '≥60m' }, { name: '工作压力', value: '0.8MPa' }, { name: '重量', value: '≤35kg' }],
      usage: '用于大面积火灾扑救、大型储罐冷却保护。可固定使用或移动布置。',
      scenario: '石油化工火灾、仓库火灾、大型建筑火灾。',
      maintenance: '每次使用后冲洗炮体内外，检查旋转机构灵活性，定期润滑传动部件。',
    },
    {
      name: '消防员呼救器', model: 'RHJ240', categoryId: 25,
      specs: [{ name: '报警响度', value: '≥100dB' }, { name: '静止报警时间', value: '30s' }, { name: '电池续航', value: '≥24h' }, { name: '防护等级', value: 'IP68' }],
      usage: '消防员个人安全防护装备，静止超时自动发出声光报警，可手动触发求救信号。',
      scenario: '所有灭火救援现场的个人安全保障。',
      maintenance: '每班次测试报警功能，每月检查电池，保持设备表面清洁。',
    },
  ];
  for (const equip of equipmentList) {
    await prisma.equipment.create({ data: { ...equip, status: 1 } });
  }
  console.log('✅ 示例装备: 6 条');

  // ==================== 9. 题库和题目（先清再插） ====================
  await prisma.quizQuestion.deleteMany();
  await prisma.quizRecord.deleteMany();
  await prisma.quizBank.deleteMany();

  const quizBanks = [
    {
      id: 1, title: '作战训练安全知识', categoryId: 30, icon: '📖',
      questions: [
        { type: 'single', question: '消防员在进入火场前必须检查的个人防护装备不包括以下哪项？', options: [{ label: 'A', text: '消防头盔' }, { label: 'B', text: '空气呼吸器' }, { label: 'C', text: '防毒面具' }, { label: 'D', text: '智能手表' }], correctAnswer: 'D', explanation: '进入火场必须佩戴消防头盔、空气呼吸器、防毒面具等防护装备，智能手表不属于必备防护装备。' },
        { type: 'single', question: '灭火救援中，安全员应设置在什么位置？', options: [{ label: 'A', text: '火场内部' }, { label: 'B', text: '指挥部旁边' }, { label: 'C', text: '进攻入口处外侧' }, { label: 'D', text: '任意位置' }], correctAnswer: 'C', explanation: '安全员应设置在进攻入口处外侧，负责记录进入人员、时间和空呼压力，监控建筑安全状况。' },
        { type: 'single', question: '空气呼吸器残气报警器报警后，消防员大约还有多少分钟的撤离时间？', options: [{ label: 'A', text: '1-2分钟' }, { label: 'B', text: '5-8分钟' }, { label: 'C', text: '15-20分钟' }, { label: 'D', text: '30分钟' }], correctAnswer: 'B', explanation: '残气报警器在5.5±0.5MPa时触发，此时通常还有约5-8分钟的使用时间，务必立即撤离。' },
        { type: 'judge', question: '灭火救援现场，消防员可以单独进入火场内部进行侦察。', options: [{ label: 'A', text: '对' }, { label: 'B', text: '错' }], correctAnswer: '错', explanation: '严禁消防员单独进入火场，必须2人以上组成战斗小组，互相照应。' },
        { type: 'judge', question: '灭火救援时，水枪阵地应设置在承重墙、柱等结构稳固的位置。', options: [{ label: 'A', text: '对' }, { label: 'B', text: '错' }], correctAnswer: '对', explanation: '水枪阵地应选择承重墙、柱等结构稳固处，避开可能坍塌的楼板和不稳定结构。' },
        { type: 'multi', question: '进入浓烟区域前必须做到以下哪些？', options: [{ label: 'A', text: '佩戴空气呼吸器' }, { label: 'B', text: '系好导向绳' }, { label: 'C', text: '两人以上同行' }, { label: 'D', text: '携带照明设备' }], correctAnswer: 'A,B,C,D', explanation: '进入浓烟区域需全面防护：空呼供气、导向绳路线、至少2人编组、照明设备。以上全部正确。' },
        { type: 'single', question: '消防水带的最大工作压力通常为多少？', options: [{ label: 'A', text: '0.5MPa' }, { label: 'B', text: '1.0MPa-1.6MPa' }, { label: 'C', text: '5MPa' }, { label: 'D', text: '10MPa' }], correctAnswer: 'B', explanation: '常用消防水带的设计工作压力为1.0-1.6MPa，爆破压力不低于工作压力的3倍。' },
        { type: 'judge', question: '灭火救援结束后，可以不进行人员清点直接收队。', options: [{ label: 'A', text: '对' }, { label: 'B', text: '错' }], correctAnswer: '错', explanation: '每次灭火救援结束后必须进行人员清点和装备清点，确保所有人员安全归队。' },
      ],
    },
    {
      id: 2, title: '灭火救援基础知识', categoryId: 31, icon: '🔥',
      questions: [
        { type: 'single', question: '以下哪种灭火器适用于扑灭油类火灾？', options: [{ label: 'A', text: '清水灭火器' }, { label: 'B', text: '干粉灭火器' }, { label: 'C', text: '酸碱灭火器' }, { label: 'D', text: '以上都不适用' }], correctAnswer: 'B', explanation: '干粉灭火器可用于扑灭A、B、C类火灾，对油类（B类）火灾效果良好。清水灭火器不适用于油类火灾。' },
        { type: 'single', question: '建筑物火灾中，最常见的人员致死原因是什么？', options: [{ label: 'A', text: '烧伤' }, { label: 'B', text: '吸入有毒烟气窒息' }, { label: 'C', text: '坠落' }, { label: 'D', text: '砸伤' }], correctAnswer: 'B', explanation: '火灾中约80%的死亡是由吸入有毒烟气导致的窒息，而非直接烧伤。因此疏散逃生时需用湿毛巾捂住口鼻。' },
        { type: 'multi', question: '以下属于B类火灾（液体或可熔化固体物质火灾）的有哪些？', options: [{ label: 'A', text: '汽油火灾' }, { label: 'B', text: '木材火灾' }, { label: 'C', text: '沥青火灾' }, { label: 'D', text: '食用油火灾' }], correctAnswer: 'A,C,D', explanation: 'B类火灾指液体或可熔化固体物质火灾。汽油和食用油为液体，沥青可熔化，均为B类。木材属于A类固体物质火灾。' },
        { type: 'judge', question: '使用灭火器时应对准火焰顶部喷射。', options: [{ label: 'A', text: '对' }, { label: 'B', text: '错' }], correctAnswer: '错', explanation: '使用灭火器应对准火焰根部喷射，从近到远、左右扫射，快速推进，直至火焰完全熄灭。' },
        { type: 'single', question: '灭火救援中，消防救援队伍到达火灾现场后，首先应做什么？', options: [{ label: 'A', text: '立即进入火场救人' }, { label: 'B', text: '进行火情侦察' }, { label: 'C', text: '直接出水灭火' }, { label: 'D', text: '疏散围观群众' }], correctAnswer: 'B', explanation: '到达现场后首先进行火情侦察，了解火势大小、蔓延方向、有无被困人员、危险物品等，再制定作战方案。' },
        { type: 'single', question: '天然气的爆炸极限（体积浓度）大约是多少？', options: [{ label: 'A', text: '1%-5%' }, { label: 'B', text: '5%-15%' }, { label: 'C', text: '15%-25%' }, { label: 'D', text: '25%-45%' }], correctAnswer: 'B', explanation: '天然气的爆炸极限约为5%-15%（体积浓度），在此浓度范围内遇到火源会发生爆炸。' },
        { type: 'judge', question: '室外消火栓的水流可以直接用于高层建筑灭火。', options: [{ label: 'A', text: '对' }, { label: 'B', text: '错' }], correctAnswer: '错', explanation: '室外消火栓水压不足以直接供给高层建筑，需通过消防车加压或使用建筑内的消防泵进行供水。' },
        { type: 'single', question: '扑灭电器火灾时，在断电前不可使用的灭火剂是？', options: [{ label: 'A', text: '干粉' }, { label: 'B', text: '二氧化碳' }, { label: 'C', text: '水' }, { label: 'D', text: '卤代烷' }], correctAnswer: 'C', explanation: '水具有导电性，在未断电情况下使用水灭火可能导致触电事故。断电前应使用干粉、CO₂等不导电灭火剂。' },
      ],
    },
    {
      id: 3, title: '水域救援知识', categoryId: 34, icon: '🌊',
      questions: [
        { type: 'single', question: '水域救援中，救援人员下水的最低个人防护要求是什么？', options: [{ label: 'A', text: '只需穿救生衣' }, { label: 'B', text: '救生衣+水域救援头盔' }, { label: 'C', text: '救生衣+头盔+防寒服+抛绳包' }, { label: 'D', text: '无需特殊装备' }], correctAnswer: 'C', explanation: '水域救援最低个人防护要求包括：救生衣、水域救援头盔、防寒服（湿式/干式救援服）、抛绳包。' },
        { type: 'judge', question: '在水流湍急的河道中救援时，救援人员可以直接下水游向被困者。', options: [{ label: 'A', text: '对' }, { label: 'B', text: '错' }], correctAnswer: '错', explanation: '湍急水流中严禁盲目下水。应优先采用抛绳、伸杆、抛投救生圈等间接救援方式，必须下水时应设置上游观察员和下游拦截。' },
        { type: 'multi', question: '水域救援的优先顺序原则包括哪些？', options: [{ label: 'A', text: '伸（reach）' }, { label: 'B', text: '抛（throw）' }, { label: 'C', text: '划（row）' }, { label: 'D', text: '游（go）' }], correctAnswer: 'A,B,C,D', explanation: '水域救援优先级为：伸→抛→划→游，从低风险到高风险逐步升级，尽量不下水救援。' },
        { type: 'single', question: '洪水救援中，以下哪种做法是错误的？', options: [{ label: 'A', text: '穿救生衣' }, { label: 'B', text: '设置上游观察哨' }, { label: 'C', text: '单独一人下水救援' }, { label: 'D', text: '使用绳索保护' }], correctAnswer: 'C', explanation: '水域救援严禁单独作业，必须至少2人1组，互相保护和配合。' },
        { type: 'judge', question: '冰面救援时，救援人员可以直接站在冰面上进行救援。', options: [{ label: 'A', text: '对' }, { label: 'B', text: '错' }], correctAnswer: '错', explanation: '冰面救援时应使用冰面救援筏、梯子等分散体重，采用匍匐前进方式接近被困者，避免站立在薄弱冰面上。' },
      ],
    },
  ];

  for (const bankData of quizBanks) {
    const { questions, ...bankFields } = bankData;
    await prisma.quizBank.create({ data: { ...bankFields, questionCount: questions.length, status: 1 } });
    for (const q of questions) {
      await prisma.quizQuestion.create({ data: { bankId: bankData.id, ...q } });
    }
    console.log(`✅ 题库「${bankData.title}」: ${questions.length} 题`);
  }

  // ==================== 10. 示例帖子（先清再插） ====================
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  const posts = [
    {
      title: '高层建筑灭火救援实战经验分享',
      content: '上周参与了辖区一栋32层住宅楼的火灾扑救，起火层在18楼。分享几点心得：\n\n1. 提前熟悉建筑平面图非常重要，我们提前掌握了户型布局，进攻路线清晰\n2. 水带沿楼梯铺设时注意每层固定，防止水锤效应导致接口崩脱\n3. 电梯前室是重要的进攻和撤离通道，必须保持正压送风\n\n欢迎大家交流讨论！',
      type: 'text', userId: 1, tags: ['灭火', '高层建筑', '实战经验'], views: 356, likes: 28, commentsCount: 3, isEssence: true, status: 1,
    },
    {
      title: '新入队消防员体能训练计划（附详细安排）',
      content: '为新入队的战友整理了一份体能训练计划，经过三个月的实践，效果显著。\n\n【周一】力量训练：深蹲 5×10、卧推 5×8、引体向上 5×MAX\n【周三】耐力训练：3000米跑 + 负重登楼 10层×3\n【周五】技能体能结合：400米疏散物资操 + 水带铺设',
      type: 'text', userId: 1, tags: ['体能训练', '新人培训', '训练计划'], views: 520, likes: 42, commentsCount: 2, isEssence: true, status: 1,
    },
    {
      title: '关于危化品运输车辆事故处置的几点思考',
      content: '近期危化品运输车辆事故增多，总结几个关键点：\n\n1. 到达现场后先从上风向接近，利用检测仪器确定泄漏物质\n2. 根据UN编号和危险品标志牌快速判断物质属性\n3. 警戒区半径不宜小于150米（易燃气体）\n4. 处置前必须确定堵漏方案，准备充足的水枪掩护',
      type: 'text', userId: 1, tags: ['危化品', '交通事故', '安全处置'], views: 289, likes: 35, commentsCount: 2, isEssence: false, status: 1,
    },
    {
      title: '空气呼吸器常见故障及排除方法（视频）',
      content: '空呼是我们火场内攻的生命保障，常见故障及处理方法：\n1. 供气阀堵塞：拆下清洁或更换\n2. 面罩漏气：检查密封圈和头带紧固\n3. 压力表失灵：立即更换备用空呼\n\n建议每班次上岗前对空呼进行全面检查。',
      type: 'video', userId: 1, tags: ['装备维护', '空呼', '教程'], views: 420, likes: 56, commentsCount: 4, isEssence: true, status: 1,
    },
    {
      title: '求助：如何提高消防栓供水效率？',
      content: '在最近的一次演练中，发现消防栓供水效率偏低，水压不足影响了前方灭火。想请教各位战友：\n\n1. 如何判断消防栓的实际供水能力？\n2. 多辆消防车串联供水时有哪些注意事项？\n3. 有没有推荐的供水编成方案？',
      type: 'text', userId: 1, tags: ['供水', '技术讨论', '求助'], views: 180, likes: 12, commentsCount: 1, isEssence: false, status: 1,
    },
  ];
  for (const post of posts) {
    await prisma.post.create({ data: post });
  }
  console.log('✅ 示例帖子: 5 条');

  // ==================== 11. 示例评论 ====================
  const comments = [
    { userId: 1, postId: 1, content: '写得太好了！电梯前室的正压送风确实关键，我们之前吃过亏。', likes: 8, status: 1 },
    { userId: 1, postId: 1, parentId: 1, replyToUid: 1, content: '是的，另外补充一点：要确认消防电梯是否可用，能大大提高运兵效率。', likes: 3, status: 1 },
    { userId: 1, postId: 1, content: '学习了，下次出警前一定要提前熟悉建筑结构。', likes: 5, status: 1 },
    { userId: 1, postId: 2, content: '这个计划太实用了！引体向上一直是我弱项，有没有进阶训练方法？', likes: 6, status: 1 },
    { userId: 1, postId: 3, content: '危化品处置确实需要谨慎，建议加上侦检仪器的使用培训。', likes: 4, status: 1 },
    { userId: 1, postId: 4, content: '空呼面罩漏气的问题我也遇到过，换了硅胶密封圈后好多了。', likes: 7, status: 1 },
  ];
  for (const comment of comments) {
    await prisma.comment.create({ data: comment });
  }
  console.log('✅ 示例评论: 6 条');

  // ==================== 12. 示例推荐内容（先清再插） ====================
  await prisma.recommend.deleteMany();
  const recommends = [
    { title: '高层建筑火灾扑救要点', type: 'video', targetId: 1, coverUrl: '/uploads/images/rec-1.jpg', tag: '热门课程', sort: 1 },
    { title: '地震救援基础知识', type: 'video', targetId: 2, coverUrl: '/uploads/images/rec-2.jpg', tag: '新上课程', sort: 2 },
    { title: '高层建筑水带铺设操', type: 'training', targetId: 1, coverUrl: '/uploads/images/rec-3.jpg', tag: '推荐操法', sort: 3 },
    { title: '高层建筑灭火救援实战经验分享', type: 'post', targetId: 1, coverUrl: '/uploads/images/rec-4.jpg', tag: '精华帖', sort: 4 },
    { title: '新入队消防员体能训练计划', type: 'post', targetId: 2, coverUrl: '/uploads/images/rec-5.jpg', tag: '热门', sort: 5 },
  ];
  for (const rec of recommends) {
    await prisma.recommend.create({ data: { ...rec, status: 1 } });
  }
  console.log('✅ 推荐内容: 5 条');

  // ==================== 汇总 ====================
  console.log('\n📊 种子数据汇总：');
  console.log('   - 管理员: 1');
  console.log('   - 分类: 24 条 (视频8+训练4+装备6+题库6)');
  console.log('   - Banner: 3 张');
  console.log('   - 视频: 4 条');
  console.log('   - 危化品: 4 条');
  console.log('   - 考核标准: 4 条');
  console.log('   - 训练操法: 4 条');
  console.log('   - 装备: 6 件');
  console.log('   - 题库: 3 个 (共 21 题)');
  console.log('   - 帖子: 5 篇');
  console.log('   - 评论: 6 条');
  console.log('   - 推荐: 5 条');
  console.log('\n🎉 种子数据填充完成！');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
