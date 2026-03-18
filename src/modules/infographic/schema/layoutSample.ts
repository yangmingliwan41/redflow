import type { InfographicLayout } from './types'

/**
 * 案例一：起号 90 天复盘 → 起号产品介绍（暖色小红书风）
 */
export const layoutCase1: InfographicLayout = {
  meta: {
    title: '90 天从 0 到 1.2w 粉',
    subtitle: '小红书起号',
    tagline: '存下来，起号照着做 · 4 个数字 3 个动作',
    tagLabel: '保存 · 起号前看'
  },
  sections: [
    {
      id: 'sec-background',
      slot: 'background',
      title: '背景与目标',
      content: {
        kind: 'background',
        data: {
          intro: '从 0 起号，90 天冲万粉。',
          bullets: [
            { label: '起点', items: ['0 粉、无矩阵。'] },
            { label: '目标', items: ['可复制的内容节奏 + 破万。'] }
          ]
        }
      }
    },
    {
      id: 'sec-data',
      slot: 'data',
      title: '4 个关键数字',
      content: {
        kind: 'data',
        data: {
          metrics: [
            { label: '90 天粉丝', value: '1.2w', comment: '' },
            { label: '爆文', value: '7 篇', comment: '阅读>1w' },
            { label: '单篇最高阅读', value: '3.2w', comment: '' },
            { label: '私信有效咨询', value: '近 200 条', comment: '' }
          ]
        }
      }
    },
    {
      id: 'sec-advantages',
      slot: 'advantages',
      title: '起号优势',
      content: {
        kind: 'advantages',
        data: {
          items: [
            {
              title: '内容打法清晰',
              highlight: '痛点+承诺标题模板，前 3 秒抓住注意力。',
              description: '不再纠结写什么，每周一个选题库，照着填空即可产出内容。'
            },
            {
              title: '数字闭环',
              highlight: '看得见的 4 个关键数字：粉丝、爆文、最高阅读、私信量。',
              description: '从内容到数据一条线，知道每一步到底带来多少增长。'
            },
            {
              title: '节奏有方',
              highlight: '「前 30 天测爆款，后 60 天放大复制」。',
              description: '避免一上来瞎忙，一套节奏跑完，起号心里更有底。'
            },
            {
              title: '转化可控',
              highlight: '主页钩子 + 私信话术模板，线索更稳。',
              description: '不仅要来粉，还要来咨询，把增长和生意串起来。'
            }
          ]
        }
      }
    },
    {
      id: 'sec-plans',
      slot: 'plans',
      title: '起号方案',
      content: {
        kind: 'plans',
        data: {
          plans: [
            {
              name: '标准起号方案',
              price: '3000',
              unit: '元 / 90 天',
              tagline: '想跑通首轮起号的品牌 / 个人号',
              highlight: true,
              features: [
                { label: '每周 1 套选题库 + 标题模板', highlight: true },
                { label: '前 30 天日更陪跑，拆解每一条数据', highlight: false },
                { label: '起号节奏规划：测爆款 → 放大 → 复盘', highlight: false },
                { label: '主页钩子 & 私信话术模板配置', highlight: false }
              ],
              note: '适合有起号目标，希望有人帮忙「带一遍手」的账号。'
            },
            {
              name: '自助起号清单',
              price: '0',
              unit: '元 / 自行执行',
              tagline: '时间多、预算有限，只需要一份清晰清单的人',
              highlight: false,
              features: [
                { label: '起号 90 天任务拆解 Checklist', highlight: true },
                { label: '选题 / 标题 / 数据看板模版', highlight: false },
                { label: '每周自查复盘问题清单', highlight: false }
              ],
              note: '适合想自己摸索，但又不想走弯路的人。'
            }
          ]
        }
      }
    },
    {
      id: 'sec-summary',
      slot: 'summary',
      content: {
        kind: 'summary',
        data: {
          paragraphs: [
            '起号不是篇篇爆，是找到一条能复制的爆款公式。',
            '先测出 1 条爆款，再复制放大。'
          ]
        }
      }
    }
  ]
}

/**
 * 案例二：平台核心优势 & 主力产品套餐（对标 P2/P3，偏平台售卖向）
 */
export const layoutCase2: InfographicLayout = {
  meta: {
    title: '平台核心优势 & 主力产品套餐',
    subtitle: '红流云创 · 小红书整合运营服务',
    tagline: '极致性价比，为你的获客结果兜底',
    themeId: 'platform',
    tagLabel: '了解套餐详情'
  },
  sections: [
    {
      id: 'p2-advantages',
      slot: 'advantages',
      title: '平台核心优势',
      content: {
        kind: 'advantages',
        data: {
          items: [
            {
              title: '价效匹配高',
              highlight: '3000 元标准运营套餐≈ 24 篇原创，价格低于同行。',
              description: '支持全国投放，兼顾内容质量与投放效率。'
            },
            {
              title: '效果有保障',
              highlight: '续费率 100%，真实成功案例可查。',
              description: '支持数据对账和过程复盘，不怕对比，只怕不看。'
            },
            {
              title: '内容适配强',
              highlight: '深耕平台规则，内容适配多种垂类。',
              description: '适配品牌自播、达人投放、信息流广告多种场景。'
            },
            {
              title: '技术赋能',
              highlight: '自研大模型 + 人工审核，内容兼顾质量与风格统一。',
              description: '用数据反推选题和创意，而不是凭感觉拍脑袋。'
            }
          ]
        }
      }
    },
    {
      id: 'p2-plans',
      slot: 'plans',
      title: '主力产品套餐',
      content: {
        kind: 'plans',
        data: {
          plans: [
            {
              name: '标准运营套餐',
              price: '3000',
              unit: '元 / 月',
              tagline: '有完整运营需求，追求全流程托管的客户',
              highlight: true,
              features: [
                { label: '账号搭建优化及专业定位', highlight: true },
                { label: '24 篇原创内容（工作日日更）', highlight: true },
                { label: '日常投放优化 + 多数据维度监控', highlight: false },
                { label: '客资筛选提效方案，提升转化效率', highlight: false },
                { label: '月度报告复盘，给出下月行动建议', highlight: false }
              ],
              note: '适合注重线索转化与长期复利的品牌，如家装门店、本地生活等。'
            },
            {
              name: '轻运营套餐',
              price: '1600',
              unit: '元 / 月',
              tagline: '预算有限，只需基础账号维护的客户',
              highlight: false,
              features: [
                { label: '账号搭建优化', highlight: true },
                { label: '10 篇原创图文（排版 / 修图）', highlight: true },
                { label: '日常投放与每周数据监控', highlight: false },
                { label: '月度简易报告，给出优化建议', highlight: false }
              ],
              note: '适合刚起步阶段，希望保持曝光但暂不追求高频转化的账号。'
            }
          ]
        }
      }
    },
    {
      id: 'p2-summary',
      slot: 'summary',
      content: {
        kind: 'summary',
        data: {
          paragraphs: [
            '好内容 + 好节奏 + 好投放，才是能长期复利的运营组合。',
            '如果你不想再靠运气出一条爆款，就应该让一套成熟打法帮你跑一遍。'
          ]
        }
      }
    }
  ]
}

/**
 * 案例三：西安周末旅游攻略（两日玩转古都）
 */
export const layoutCase3: InfographicLayout = {
  meta: {
    title: '西安周末旅游攻略',
    subtitle: '两日玩转古都',
    tagline: '吃住行一篇搞定 · 经典路线 + 美食清单',
    themeId: 'travel',
    tagLabel: '收藏 · 出发前看'
  },
  sections: [
    {
      id: 'c3-background',
      slot: 'background',
      title: '行程概览',
      content: {
        kind: 'background',
        data: {
          intro: '周五晚到、周日傍晚返，两天一夜把古都精华走一遍。',
          bullets: [
            { label: '适合人群', items: ['周末短途、首次来西安、想省心抄作业的。'] },
            { label: '节奏', items: ['Day1 城墙+回民街+大雁塔，Day2 兵马俑或博物馆二选一。'] }
          ]
        }
      }
    },
    {
      id: 'c3-data',
      slot: 'data',
      title: '关键数字',
      content: {
        kind: 'data',
        data: {
          metrics: [
            { label: '建议时长', value: '2 天', comment: '周末刚好' },
            { label: '必去景点', value: '6 个', comment: '城墙/回民街/大雁塔等' },
            { label: '美食街区', value: '3 条', comment: '回民街/永兴坊/洒金桥' },
            { label: '人均预算', value: '800 起', comment: '含住行' }
          ]
        }
      }
    },
    {
      id: 'c3-advantages',
      slot: 'advantages',
      title: '攻略亮点',
      content: {
        kind: 'advantages',
        data: {
          items: [
            {
              title: '路线顺不绕路',
              highlight: '按地铁与片区排好顺序，一天一条线。',
              description: '上午城墙/钟楼，下午回民街+高家大院，傍晚大雁塔看喷泉，晚上大唐不夜城。'
            },
            {
              title: '美食集中打卡',
              highlight: '肉夹馍、凉皮、泡馍、胡辣汤一次吃全。',
              description: '回民街主街尝鲜，洒金桥本地人多；永兴坊主打关中小吃，摔碗酒可体验。'
            },
            {
              title: '交通省心',
              highlight: '地铁覆盖主要景点，机场/高铁都有地铁直达。',
              description: '住钟楼或小寨附近，去哪都方便；去兵马俑可地铁到华清池再打车或专线。'
            },
            {
              title: '可松可紧',
              highlight: '核心行程固定，博物馆/演出可自由替换。',
              description: 'Day2 可改陕西历史博物馆（需预约）或《长恨歌》，按体力灵活调整。'
            }
          ]
        }
      }
    },
    {
      id: 'c3-plans',
      slot: 'plans',
      title: '两种玩法',
      content: {
        kind: 'plans',
        data: {
          plans: [
            {
              name: '文化深度线',
              price: '约 900',
              unit: '元 / 人',
              tagline: '博物馆 + 兵马俑 + 《长恨歌》',
              highlight: true,
              features: [
                { label: 'Day1 城墙 + 回民街 + 大雁塔北广场', highlight: true },
                { label: 'Day2 兵马俑 + 华清宫 + 《长恨歌》演出', highlight: true },
                { label: '住宿建议钟楼/南门附近', highlight: false },
                { label: '提前预约陕历博或演出票', highlight: false }
              ],
              note: '适合第一次来、想一次把经典看完的。'
            },
            {
              name: '美食休闲线',
              price: '约 600',
              unit: '元 / 人',
              tagline: '少赶路、多吃饭、逛街区',
              highlight: false,
              features: [
                { label: 'Day1 洒金桥早市 + 回民街 + 钟鼓楼', highlight: true },
                { label: 'Day2 永兴坊 + 城墙或大明宫遗址', highlight: true },
                { label: '住回民街/北大街附近', highlight: false },
                { label: '留足时间排队网红店', highlight: false }
              ],
              note: '适合以吃为主、不想太累的周末党。'
            }
          ]
        }
      }
    },
    {
      id: 'c3-summary',
      slot: 'summary',
      content: {
        kind: 'summary',
        data: {
          paragraphs: [
            '西安不是一次能逛完的，周末先把「必去 + 必吃」打勾。',
            '提前订票、错峰吃饭，体验会好很多。'
          ]
        }
      }
    }
  ]
}

// 兼容旧引用：默认示例使用案例一
export const layoutSample = layoutCase1
