export interface ActivityItem {
  time: string;
  title: string;
  description: string;
}

export interface ExperienceData {
  title: string;
  activities: ActivityItem[];
}

export const experiences: { [key: string]: ExperienceData } = {
  '北宋书生': {
    title: '一位书生的东京一日',
    activities: [
      {
        time: '卯时（5:00-7:00）',
        title: '晨读经书',
        description: '天未明即起身，点燃油灯诵读儒家经典。朗朗的读书声伴随着晨曦穿透窗户。',
      },
      {
        time: '辰时（7:00-9:00）',
        title: '街巷漫步',
        description: '漫步在开封城的街巷中，观察市井百态，思考人生哲理。',
      },
      {
        time: '午时（11:00-13:00）',
        title: '茶肆小酌',
        description: '在茶肆与同窗好友商榷学问，共论天下大事。',
      },
      {
        time: '申时（15:00-17:00）',
        title: '书坊选书',
        description: '走进城中最大的书坊，选购心仪的著作和诗集。',
      },
      {
        time: '酉时（17:00-19:00）',
        title: '晚宴论道',
        description: '与文人墨客在酒楼论诗论文，谈笑风生。',
      },
      {
        time: '戌时（19:00-21:00）',
        title: '灯下批卷',
        description: '回到书房，在油灯下整理功课，为科举做准备。',
      },
    ],
  },
  '茶坊老板': {
    title: '一位茶坊老板的东京一日',
    activities: [
      {
        time: '卯时（5:00-7:00）',
        title: '生火备茶',
        description: '天未明就起身，生好大火，准备今天的茶水。精心挑选今天要供应的茶叶。',
      },
      {
        time: '辰时（7:00-9:00）',
        title: '早市迎客',
        description: '第一波客人陆续进来，多是工人和小商贩。用热茶驱散他们的晨寒。',
      },
      {
        time: '午时（11:00-13:00）',
        title: '文人齐聚',
        description: '茶坊成了文人墨客的聚集地，他们在此品茶谈心。',
      },
      {
        time: '申时（15:00-17:00）',
        title: '午后闲话',
        description: '下午的茶坊最是热闹，各色人等在此讲述城中大小新闻。',
      },
      {
        time: '酉时（17:00-19:00）',
        title: '晚间生意',
        description: '晚上的茶坊客人最多，你忙碌于端茶递水之间。',
      },
      {
        time: '戌时（19:00-21:00）',
        title: '收摊歇业',
        description: '送走最后一批客人，收摊歇业，在灯下整理账簿。',
      },
    ],
  },
  '酒楼伙计': {
    title: '一位酒楼伙计的东京一日',
    activities: [
      {
        time: '卯时（5:00-7:00）',
        title: '厨房准备',
        description: '天不亮就来到酒楼，开始准备今日的食材和调料。',
      },
      {
        time: '辰时（7:00-9:00）',
        title: '开门营业',
        description: '酒楼大门打开，你整理桌椅，迎接第一波客人。',
      },
      {
        time: '午时（11:00-13:00）',
        title: '午膳忙碌',
        description: '中午是最繁忙的时刻，你在大堂里穿梭，端酒盘，递菜肴。',
      },
      {
        time: '申时（15:00-17:00）',
        title: '午后闲适',
        description: '下午客人较少，你在酒楼里打扫卫生，为晚间做准备。',
      },
      {
        time: '酉时（17:00-19:00）',
        title: '晚膳高峰',
        description: '晚间是酒楼最繁华的时刻，你忙碌于各个包间和大堂。',
      },
      {
        time: '戌时（19:00-21:00）',
        title: '夜深谢客',
        description: '送走最后的客人，收拾残局，结束一天的劳碌。',
      },
    ],
  },
  '夜市商贩': {
    title: '一位夜市商贩的东京一日',
    activities: [
      {
        time: '午时（11:00-13:00）',
        title: '备货采购',
        description: '在城中各处采购明天要卖的商品，精心挑选最好的货物。',
      },
      {
        time: '申时（15:00-17:00）',
        title: '摊位布置',
        description: '来到夜市的地方，布置摊位，摆放商品，装饰灯笼。',
      },
      {
        time: '酉时（17:00-19:00）',
        title: '黄昏开摊',
        description: '夕阳西下，点燃灯笼，摊位被温暖的灯光笼罩。',
      },
      {
        time: '戌时（19:00-21:00）',
        title: '生意兴隆',
        description: '夜市最热闹的时刻，各色人等在你的摊位前驻足，挑选商品。',
      },
      {
        time: '亥时（21:00-23:00）',
        title: '夜深依旧',
        description: '夜幕深深，你仍在摊位前，与熟客闲谈，讲述城中趣事。',
      },
      {
        time: '子时（23:00-1:00）',
        title: '收摊归家',
        description: '终于要打烊了，收拾摊位，清点银两，步行回家。',
      },
    ],
  },
  '外地游客': {
    title: '一位外地游客的东京一日',
    activities: [
      {
        time: '卯时（5:00-7:00）',
        title: '晨曦漫步',
        description: '带着好奇心在晨曦中漫步，欣赏这座古城的雄伟建筑。',
      },
      {
        time: '辰时（7:00-9:00）',
        title: '名胜古迹',
        description: '游览开封最著名的寺庙和古迹，聆听导游讲述历史故事。',
      },
      {
        time: '午时（11:00-13:00）',
        title: '尝遍美食',
        description: '在著名的酒楼品尝开封特色美食，每一道都是新奇体验。',
      },
      {
        time: '申时（15:00-17:00）',
        title: '闹市观光',
        description: '漫步在城中最繁华的街市，沉浸在商业的繁荣和人流的喧嚣中。',
      },
      {
        time: '酉时（17:00-19:00）',
        title: '夜市探险',
        description: '夜幕降临，来到闻名已久的夜市，品尝小食，购买纪念品。',
      },
      {
        time: '戌时（19:00-21:00）',
        title: '回客栈小酌',
        description: '回到客栈，与同来的朋友或新结识的友人，回顾一天的见闻。',
      },
    ],
  },
};
