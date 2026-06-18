/* ============================================================
   Xuedao (学道) AI chat - connected to Hermes gateway
   Falls back to a scripted demo persona if the gateway is unreachable.
   ============================================================ */

const XD = {
  history: [],
  busy: false,
  apiUrl: "https://hermes-agent.nousresearch.com/v1/chat/completions",
  apiKey: null,
  persona: "你是 Nike 学道 AI 助手, 名字叫 Swoosh AI。你的职责: 帮助 Nike 一线店员和区域运营经理快速查询产品知识、门店运营 SOP、顾客服务话术、培训内容、巡店 checklist。回答风格: 中文为主, 简洁专业, 直接给可执行答案, 不啰嗦。"
};

function xdOpenChat(initial) {
  document.getElementById("page-xuedao").classList.remove("active");
  document.getElementById("xd-chat").classList.add("active");
  if (initial) {
    setTimeout(() => xdSend(initial), 200);
  } else {
    xdWelcomeMessage();
  }
}

function xdCloseChat() {
  document.getElementById("xd-chat").classList.remove("active");
  document.getElementById("page-xuedao").classList.add("active");
}

function xdWelcomeMessage() {
  const stream = document.getElementById("xd-chat-stream");
  stream.innerHTML = "";
  xdAppendAI(
    `你好, 我是 Swoosh AI — Nike 学道知识助手。\n\n我可以帮你:\n• 查询产品科技 / 卖点 / 价格\n• 门店运营 SOP / 顾客服务话术\n• 培训内容 / 巡店 checklist\n• Listen U 顾客反馈分析\n\n输入问题开始, 或点击下方快捷话题。`
  );
}

function xdAppendUser(text) {
  const stream = document.getElementById("xd-chat-stream");
  const wrap = document.createElement("div");
  wrap.className = "xd-chat-msg user";
  wrap.innerHTML = `
    <div class="xd-chat-avatar">${(FS.user && FS.user.name || "我").slice(0, 1)}</div>
    <div class="xd-chat-bubble"></div>
  `;
  wrap.querySelector(".xd-chat-bubble").textContent = text;
  stream.appendChild(wrap);
  stream.scrollTop = stream.scrollHeight;
}

function xdAppendAI(text) {
  const stream = document.getElementById("xd-chat-stream");
  const wrap = document.createElement("div");
  wrap.className = "xd-chat-msg ai";
  wrap.innerHTML = `
    <div class="xd-chat-avatar">S</div>
    <div class="xd-chat-bubble"></div>
  `;
  wrap.querySelector(".xd-chat-bubble").textContent = text;
  stream.appendChild(wrap);
  stream.scrollTop = stream.scrollHeight;
}

function xdAppendTyping() {
  const stream = document.getElementById("xd-chat-stream");
  const wrap = document.createElement("div");
  wrap.className = "xd-chat-msg ai";
  wrap.id = "xd-typing";
  wrap.innerHTML = `
    <div class="xd-chat-avatar">S</div>
    <div class="xd-chat-bubble typing"><span></span><span></span><span></span></div>
  `;
  stream.appendChild(wrap);
  stream.scrollTop = stream.scrollHeight;
}

function xdRemoveTyping() {
  const el = document.getElementById("xd-typing");
  if (el) el.remove();
}

function xdSetBusy(b) {
  XD.busy = b;
  const btn = document.getElementById("xd-send-btn");
  if (btn) btn.disabled = b;
}

async function xdSend(text) {
  const input = document.getElementById("xd-input");
  const msg = (text || input.value || "").trim();
  if (!msg || XD.busy) return;
  input.value = "";
  xdAppendUser(msg);
  XD.history.push({ role: "user", content: msg });
  xdSetBusy(true);
  xdAppendTyping();

  try {
    const reply = await xdCall(msg);
    xdRemoveTyping();
    xdAppendAI(reply);
    XD.history.push({ role: "assistant", content: reply });
  } catch (e) {
    xdRemoveTyping();
    const fallback = xdFallback(msg);
    xdAppendAI(fallback);
    XD.history.push({ role: "assistant", content: fallback });
  }
  xdSetBusy(false);
}

async function xdCall(userMsg) {
  const sysPrompt = XD.persona + "\n\n用户信息: " + JSON.stringify({
    name: FS.user.name,
    title: FS.user.title,
    level: FS.user.level,
    region: FS.user.region
  });

  const messages = [
    { role: "system", content: sysPrompt },
    ...XD.history.slice(-10).map(m => ({ role: m.role, content: m.content }))
  ];

  if (XD.apiKey) {
    const r = await fetch(XD.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${XD.apiKey}`
      },
      body: JSON.stringify({
        model: "MiniMax-M3",
        messages,
        max_tokens: 600,
        temperature: 0.5
      })
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();
    return d.choices[0].message.content;
  }

  throw new Error("no key");
}

function xdFallback(q) {
  const lower = q.toLowerCase();

  if (lower.includes("air max") || lower.includes("气垫")) {
    return "Air Max 系列核心科技:\n\n• Air Max 1 (1987) — 首款可视化气垫, Tinker Hatfield 设计\n• Air Max 90 — 加大气垫窗口, 强化缓冲\n• Air Max 95 — 人体工学分段气垫\n• Air Max 270 — 270 度环绕气垫, 日常通勤\n• Air Max Plus — TN 鞋面, 街头潮流\n\n卖点话术: 「Air Max = 可看见的缓震, 30+ 年科技沉淀」\n\n适合门店: 跑步入门 / 街头潮流 / 通勤";
  }

  if (lower.includes("dri-fit") || lower.includes("速干")) {
    return "Dri-FIT 是 Nike 核心速干科技:\n\n• 原理: 聚酯纤维 + 特殊编织, 把汗液从皮肤导到面料外层快速蒸发\n• 适用: 跑步 / 训练 / 高强度运动\n• 卖点话术: 「出汗不贴身, 运动后保持干爽」\n\n搭配推荐: Dri-FIT 上衣 + Flex 短裤 / 紧身裤";
  }

  if (lower.includes("vomero") || lower.includes("登乐")) {
    return "Nike Vomero 是 Premium 缓震跑鞋线:\n\n• Vomero 5 / Plus / Premium 三档\n• ZoomX + React 双密度中底\n• 主打: 长距离舒适跑\n• 价格区间: ¥899 - ¥1599\n\n和 Pegasus 区别: Pegasus 是日常训练 (回弹), Vomero 是长距离 (缓震)";
  }

  if (lower.includes("巡店") || lower.includes("opr")) {
    return "OPR (Operational Performance Review) 巡店流程:\n\n1. 开店前 30 分钟到店 — 检查员工到岗 / 卫生 / 音乐 / 灯光\n2. VM 视觉陈列 — 模特 / 中岛 / 橱窗是否符合当季\n3. 产品知识抽查 — 随机问 3 个员工当季主推卖点\n4. 顾客体验 — 跟随 1-2 个销售过程, 听问候话术\n5. 营运 SOP — 收银 / 退换货 / 试穿流程\n6. 闭店前 15 分钟 — 检查 SKU 归位 / 安全\n\n区域领导重点: 看员工带训能力, 不是单纯抓违规。";
  }

  if (lower.includes("listen u") || lower.includes("顾客反馈")) {
    return "Listen U 是 Nike 顾客反馈系统:\n\n• 渠道: 门店扫码 / 短信 / 小程序推送\n• NPS 评分 0-10, 9-10 为推荐者\n• 关键指标: NPS / 品类满意度 / 员工提及率 / 复购意愿\n• 区域经理可以看自己区域 9 家门店的趋势\n\n话术: 高 NPS 门店 = 复制 SOP 到低分门店; 低 NPS 必须 48 小时内做 RCA。";
  }

  if (lower.includes("培训") || lower.includes("学习")) {
    return `你 (${FS.user.name}, ${FS.user.title}, ${FS.user.level}) 当前培训:\n\n【必修】\n• 当季主推产品 (Air Max / Vomero) — 截止本周五\n• 新员工带训 SOP v2.3\n• Listen U 顾客反馈处理流程\n\n【选修】\n• 区域经理教练力 (8 小时课程)\n• 销售心理学基础\n\n【直播预告】\n• 下周二 14:00 全区域 Q3 战略解读`;
  }

  if (lower.includes("你好") || lower.includes("hi") || lower.includes("hello")) {
    return `你好 ${FS.user.name}。有什么我可以帮你的? \n\n可以试试:\n• 「Air Max 系列核心科技」\n• 「OPR 巡店流程」\n• 「我该上什么培训」\n• 「Listen U 怎么看」`;
  }

  return `已收到: 「${q}」\n\n(注: 学道 AI 当前未连接到 MiniMax 实时推理, 这是演示回退。在生产环境中, 这个问题会被发到 MiniMax-M3 模型并由 Nike 知识库增强。)\n\n快捷查询:\n• 产品: Air Max / Dri-FIT / Vomero / Pegasus\n• 运营: OPR 巡店 / 培训 / Listen U\n• 其它: 输入任意问题`;
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("xd-input");
  const btn = document.getElementById("xd-send-btn");
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.isComposing) xdSend();
    });
  }
  if (btn) btn.addEventListener("click", () => xdSend());
});