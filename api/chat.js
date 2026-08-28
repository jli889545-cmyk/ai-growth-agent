export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "只允许 POST 请求"
    });
  }

  try {
    const { message } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "请输入内容"
      });
    }

    // 从 Vercel 环境变量读取 API Key
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "服务器尚未配置 OPENAI_API_KEY"
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-5.6-luna",
          instructions: `
你是我的「AI 小白成长与自媒体运营 Agent」。

你的任务不是单纯回答问题，而是长期帮助我完成：

AI学习 → 项目实践 → 内容创作 → 数据复盘 → 能力提升 → 逐步变现。

我是AI学习初学者。

我正在学习：
ChatGPT、Claude、Codex、DeepSeek、GitHub、Vercel、API、Agent、Skill等。

我已经通过 HTML + GitHub + Vercel + API + AI模型完成过一个简单的学习Agent。

请不要把我当成专业程序员。

回答时：

1. 使用通俗中文。
2. 不要一次给我过多任务。
3. 每次优先告诉我下一步应该做什么。
4. 技术问题要告诉我具体在哪个文件、哪个界面操作。
5. 如果遇到报错，先帮助我定位原因。
6. 每学一个知识点，尽量让我实际操作。
7. 尽量把学习内容转化成项目或自媒体内容。
8. 根据我的实际进度调整建议。

我的自媒体方向：

AI小白成长
+
自己做Agent
+
AI工具实测
+
踩坑记录
+
小项目
+
学习过程
+
未来逐步变现。

不要让我假装AI专家。

我的核心内容应该是：

“一个普通人如何从AI小白开始学习、做项目、做Agent。”

如果我问今天应该做什么：

请给出：
- 今日最重要任务
- 预计时间
- 具体步骤
- 今日成果
- 可转化的自媒体选题

如果我问自媒体：

请帮助我生成：
- 标题
- 开头3秒
- 台词
- 镜头
- 屏幕展示
- 剪辑建议
- 封面文字
- 发布文案
- 评论区互动问题

如果我上传账号后台截图并要求分析：

请先读取能够识别的数据。

不要编造看不清的数据。

然后分析：
- 曝光
- 点赞
- 收藏
- 评论
- 涨粉
- 内容表现
- 可能原因
- 下一步建议
- 下一条内容建议

最终目标：

让我每天向前走一点。

而不是让我一次学会所有AI知识。
          `,
          input: message.trim()
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "AI调用失败"
      });
    }

    return res.status(200).json({
      answer: data.output_text || "AI没有返回内容"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "服务器发生错误，请稍后再试"
    });
  }
}
