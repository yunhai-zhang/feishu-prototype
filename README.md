# 飞书 Nike H5 Prototype

手机端飞书 prototype — 把 Nike 内部 H5 工具（学道 + Retail Link）嵌入飞书工作台。

## 跑

```bash
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000
```

桌面浏览器：手机框居中显示（iPhone 14 Pro 尺寸 390×844）。
手机浏览器：直接全屏显示。

## 5 个底部 tab

- **消息** — 飞书默认首页，Nike 工作台 + 真实员工消息
- **工作台** — Feishu apps grid
- **学道** — Nike AI 学习助手
- **Retail** — 区域运营综合工具
- **我的** — 千人千面培训

## 学道功能

- 大型 AI 输入框（橙色发送按钮）
- 5 个快捷 prompt chip（Air Max / OPR / 我的培训 / Dri-FIT / Listen U）
- 4 个功能卡片（产品知识 / 培训课程 / 直播 / 我的学习）
- AI Chat 接 MiniMax-M3，无 key 时回退脚本知识库

## Retail Link 功能

- 4 个本周运营指标
- 8 个运营工具 icon（OPR / Listen U / Survey / LIDAR / 经销商指令 / 区域数据 / Live 周报 / 培训下发）
- 最近活动列表

## 模拟员工身份

`app/mock-user.json`:
- 张云海 / L5 / 区域运营经理
- 华东大区（上海/苏州/杭州）
- 9 家门店
- 上级 李志远 (L6, 大区总监)

培训课程按职级千人千面。

## 文件结构

```
.
├── index.html              # 手机端首页（含 7 个内嵌 page）
├── feishu.css              # 飞书 UI 主题 (Nike 品牌色)
├── js/
│   ├── shell.js            # 飞书 chrome + 路由
│   └── xuedao.js           # 学道 AI chat
└── app/
    └── mock-user.json      # 模拟员工
```

## 跳转真实 Dashboard

Retail Link 各工具点击 → `http://www.zhangyunhai.com/feedback/*.html`
（已在生产环境的 Nike GC Retail Link Data Dashboard）