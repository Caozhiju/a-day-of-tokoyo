export interface Identity {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const identities: Identity[] = [
  {
    id: 'scholar',
    name: '北宋书生',
    description: '清晨即起温习功课，白日在东京街巷漫步观人，晚间饮茶论道。你手中握着仕途梦想，却也珍视这个城市的每一刻闲适。',
    icon: '📚',
    color: 'from-amber-100 to-amber-50',
  },
  {
    id: 'teahouse',
    name: '茶坊老板',
    description: '天未明就要起身张罗茶水，迎接文人墨客和贩夫走卒。你见证着这个城市的生活百态，用热茶和闲聊承载每个人的故事。',
    icon: '🍵',
    color: 'from-green-100 to-green-50',
  },
  {
    id: 'tavern',
    name: '酒楼伙计',
    description: '从日出到日落，你在酒楼的大堂里穿梭忙碌。端盘子、递酒杯、听闲谈，整个东京的热闹都在你眼前上演。',
    icon: '🍷',
    color: 'from-red-100 to-red-50',
  },
  {
    id: 'vendor',
    name: '夜市商贩',
    description: '当夜幕降临，你的夜市摊位点亮千盏灯火。叫卖声、笑语声、铜钱声，构成了东京最生动的夜晚交响曲。',
    icon: '🏪',
    color: 'from-orange-100 to-orange-50',
  },
  {
    id: 'visitor',
    name: '外地游客',
    description: '怀揣好奇心来到这个闻名已久的城市，每个角落都新奇有趣。你是过客，却想把东京的美都收入眼底和心底。',
    icon: '🧳',
    color: 'from-blue-100 to-blue-50',
  },
];
