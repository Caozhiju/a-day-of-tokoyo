/* ═══════════════════════════════════════════════════════════
   宋代基因分析 —— 从活动中提取文化基因
   ═══════════════════════════════════════════════════════════ */

export interface CultureGene {
  /** 基因唯一标识 */
  id: string;
  /** 文化元素名 */
  element: string;
  /** 元素图标 */
  icon: string;
  /** 宋代形态 */
  songForm: string;
  /** 现代形态 */
  modernForm: string;
  /** 传承说明 —— 一句话打通古今 */
  heritage: string;
  /** 关联的活动关键词（用于自动匹配） */
  keywords: string[];
  /** 所属领域 */
  domain: '饮食' | '商业' | '文教' | '娱乐' | '起居' | '社交';
}

/**
 * 文化基因库 —— 涵盖宋代东京城典型文化生活元素
 * 每项代表一个至今仍在传承的文化基因
 */
export const CULTURE_GENES: CultureGene[] = [
  {
    id: 'morning-reading',
    element: '晨起诵读',
    icon: '📖',
    songForm: '卯时即起，于青灯下诵读儒家经典。油灯微光中，书页翻动声与晨鸟啁啾相伴。士人以此涵养心性，为一日之始。',
    modernForm: '清晨阅读或听书。地铁上的电子书、晨间的播客、书房里的纸质书——媒介变了，晨间汲取知识的习惯未变。',
    heritage: '从竹简到Kindle，晨起阅读始终是中国人开启一日的精神仪式。',
    keywords: ['晨', '读', '书', '卯时', '书卷'],
    domain: '文教',
  },
  {
    id: 'market-shopping',
    element: '市井采买',
    icon: '🏪',
    songForm: '辰时州桥早市，青石长街两旁摊位鳞次栉比。笔墨纸砚、时鲜果蔬、衣帽杂什，叫卖声此起彼伏。卖笔墨的老者与熟客寒暄，人情味浓郁。',
    modernForm: '早市、超市与电商平台。快递员代替了货郎，二维码代替了铜钱，但"挑挑拣拣"的采买乐趣与市井烟火气一如既往。',
    heritage: '交易的形式从铜钱变为扫码，但市井的温度与采买的愉悦从未冷却。',
    keywords: ['市', '采', '买', '购', '市场', '早市', '州桥'],
    domain: '商业',
  },
  {
    id: 'tea-gathering',
    element: '茶肆社交',
    icon: '🍵',
    songForm: '潘楼街茶馆中，竹帘半掩，茶香氤氲。文人携一壶建州北苑龙凤团茶，青瓷盏中汤色碧透。谈诗文、论时政、品新茶——茶馆是北宋的知识广场。',
    modernForm: '咖啡馆、茶空间与社交App。从星巴克的商务会面到微信群的议题讨论，"边喝边聊"的社交场景跨越千年。',
    heritage: '从茶馆到咖啡馆，空间的载体变了，但以"一杯饮品"为媒的思想碰撞从未中断。',
    keywords: ['茶', '馆', '聊', '聚', '茶肆', '茶馆'],
    domain: '社交',
  },
  {
    id: 'song-cuisine',
    element: '宋代饮食',
    icon: '🍜',
    songForm: '午膳一碗羊肉泡馍、一碟荠菜拌豆腐、两个炊饼。北宋东京饮食讲究时令与本味，市井小食与宫廷盛宴并存，是中国美食史上第一个"餐馆时代"。',
    modernForm: '外卖、食堂与私房菜。从《东京梦华录》记载的"逐时施行"到今天的即时配送，"随时随地为人民服务"的餐饮精神一脉相承。',
    heritage: '中国最早的"外卖文化"始于宋代——千年前东京的食店早已"逐时施行，索唤即送"。',
    keywords: ['餐', '饭', '食', '午膳', '饮', '吃', '菜'],
    domain: '饮食',
  },
  {
    id: 'night-market',
    element: '夜市游逛',
    icon: '🏮',
    songForm: '申时已过，州桥夜市千灯齐明。从蜜饯果子到抄本书籍，从傀儡戏到说书场，整座东京城在灯火中变成不夜之都。孟元老叹"夜市直至三更尽，才五更又复开张"。',
    modernForm: '商业街、夜市与购物中心。城市霓虹代替了灯笼，LED屏代替了幌子，但"晚上出来逛逛"的都市夜生活基因从未改变。',
    heritage: '东京城是最早的"不夜城"——千年前打破宵禁的勇气，造就了今天中国城市夜经济的底色。',
    keywords: ['夜', '市', '逛', '灯', '夜市', '州桥夜市'],
    domain: '商业',
  },
  {
    id: 'wa-she-entertainment',
    element: '瓦舍伎艺',
    icon: '🎭',
    songForm: '瓦舍勾栏中傀儡戏腾挪跳跃，说书人拍案惊堂。市民花几文钱买入场券，围坐观戏叫好。傀儡戏、杂剧、说唱——宋代瓦舍是中国最早的市民娱乐综合体。',
    modernForm: '电影院、剧院与流媒体。从勾栏到IMAX银幕，从说书人到脱口秀，围坐观演的集体娱乐体验穿越千年。',
    heritage: '瓦舍是中国最早的"市民娱乐中心"——今天看电影、听相声的快乐，千年前的东京市民已在勾栏中体验过。',
    keywords: ['瓦舍', '勾栏', '听', '戏', '曲', '说书', '傀儡', '娱乐'],
    domain: '娱乐',
  },
  {
    id: 'night-reading',
    element: '灯下治学',
    icon: '🕯️',
    songForm: '戌时归斋，于烛火下对照典籍批注。砚台余墨未干，笔尖在纸上游走。窗外更夫梆子声由远及近，书房中唯有翻书与研墨之声——这是宋代士人的深夜书房。',
    modernForm: '深夜书房、台灯下的阅读笔记、电子书批注功能。从油灯到LED灯，从毛笔到触控笔，"夜读"的静谧时光是跨越千年的精神奢侈。',
    heritage: '古人凿壁借光，宋人油灯夜读，今人台灯下翻书——对知识的渴求让每一盏深夜的灯都有了名字。',
    keywords: ['夜读', '批', '注', '灯', '书', '读', '笔记', '书房'],
    domain: '文教',
  },
  {
    id: 'calligraphy-culture',
    element: '笔墨纸砚',
    icon: '✍️',
    songForm: '兔毫笔、歙砚、澄心堂纸、李廷珪墨——文房四宝是宋代书生的立身之本。一方砚台可传三代，一支好笔能用十年。笔墨不仅是工具，更是精神的寄托。',
    modernForm: '钢笔、中性笔与电子笔。键盘敲击替代了提笔挥毫，但"文房"的精神以新的形式延续——手帐文化、书法兴趣班、数字绘画。',
    heritage: '从毛笔到机械键盘，工具的革命从未停止，但中国人对"书写"的敬意延续至今。',
    keywords: ['笔', '墨', '纸', '砚', '写', '书', '文房'],
    domain: '文教',
  },
  {
    id: 'song-furniture',
    element: '宋代居室',
    icon: '🪵',
    songForm: '书斋中一案一椅、一灯一砚。宋代家具以简洁著称，线条明快，漆色沉静。窗下置榻，可坐可卧；墙面悬画，四季更换。宋人将"雅"融入日常起居。',
    modernForm: '极简主义家居、日式/新中式风格。宋代美学的"留白"与"克制"在设计界回潮——无印良品的理念与宋人"素简"的审美隔空共鸣。',
    heritage: '宋代美学的"简约"领先世界八百年——今天席卷全球的极简风，真正的根在宋代。',
    keywords: ['书斋', '案', '窗', '居', '宅', '庭院'],
    domain: '起居',
  },
  {
    id: 'song-transport',
    element: '东京街衢',
    icon: '🏛️',
    songForm: '东京城以御街为中轴，街巷如棋盘纵横。青石铺路，沟渠排水，街旁植榆柳。官员乘轿、商人骑马、百姓步行——街道上是北宋社会的微缩画卷。',
    modernForm: '城市道路、地铁与共享单车。从御街到长安街，从马匹到地铁——城市交通的形态巨变，但"街巷"始终是城市生活的动脉。',
    heritage: '宋代东京的城市规划已具现代都市雏形——御街、坊巷、水系构成的"棋盘式"格局至今仍是城市规划的基础。',
    keywords: ['街', '巷', '路', '行', '走', '城', '东京'],
    domain: '起居',
  },
  {
    id: 'festival-culture',
    element: '节庆风俗',
    icon: '🎊',
    songForm: '元宵灯会、端午竞渡、中秋赏月——宋代节庆气氛浓厚。东京城中每逢佳节，全城出动，万民同乐。酒楼张灯，夜市通宵，处处可见"节庆经济"的雏形。',
    modernForm: '黄金周旅游、商场促销、节日限定产品。千年前宋人"每逢佳节倍思亲"的情感与今天"节庆消费"的热潮一脉相连。',
    heritage: '宋代把传统节日推向极盛——今天我们过的每个重要节日，其仪式感大多在宋代定型。',
    keywords: ['节日', '灯', '元宵', '中秋', '节', '庆典'],
    domain: '娱乐',
  },
  {
    id: 'scholar-culture',
    element: '科举文脉',
    icon: '🎓',
    songForm: '十年寒窗，一朝科举。北宋实行弥封誊录制，极大促进了社会流动。书生们"朝为田舍郎，暮登天子堂"——科举是宋代社会最强劲的上升通道。',
    modernForm: '高考、公务员考试与考研。从科举到高考，"公平选拔、以考试定进退"的基因深植于中国文化。',
    heritage: '科举是人类最早的文官考试制度——今天的高考、公考、考研，都是这条千年文脉的延续。',
    keywords: ['科举', '考试', '读', '书', '寒窗', '科举'],
    domain: '文教',
  },
  {
    id: 'merchant-culture',
    element: '商业萌芽',
    icon: '💰',
    songForm: '打破坊市制后，东京城商业空前繁荣。商铺沿街开设，夜市合法经营，出现了最早的"广告"（幌子、彩楼欢门）、"连锁"（分号）和"品牌"（老字号）。',
    modernForm: '品牌连锁、电商直播与广告营销。从东京城的"彩楼欢门"到今天的霓虹灯招牌，从"分号"到连锁加盟——商业的本能千年来从未改变。',
    heritage: '宋代是中国商业革命的起点——"开店铺做品牌"这件事，宋人比欧洲早了两百年。',
    keywords: ['商', '铺', '卖', '买', '市', '经营', '生意'],
    domain: '商业',
  },
];

/* ─────────── 从活动中自动匹配文化基因 ─────────── */

export interface GeneMatchResult {
  gene: CultureGene;
  /** 匹配的活动标题 */
  matchedActivities: string[];
  /** 匹配强度（命中关键词数） */
  score: number;
}

/**
 * 根据活动列表自动匹配文化基因
 * 返回按匹配度排序的基因列表（去重）
 */
export function matchGenesFromActivities(
  activities: { title: string; description: string }[],
): GeneMatchResult[] {
  const matchMap = new Map<string, GeneMatchResult>();

  activities.forEach((act) => {
    const text = `${act.title} ${act.description}`;

    CULTURE_GENES.forEach((gene) => {
      let score = 0;
      gene.keywords.forEach((kw) => {
        if (text.includes(kw)) score += 1;
      });

      if (score > 0) {
        const existing = matchMap.get(gene.id);
        if (existing) {
          existing.score += score;
          if (!existing.matchedActivities.includes(act.title)) {
            existing.matchedActivities.push(act.title);
          }
        } else {
          matchMap.set(gene.id, {
            gene,
            matchedActivities: [act.title],
            score,
          });
        }
      }
    });
  });

  return Array.from(matchMap.values())
    .sort((a, b) => b.score - a.score);
}
