# 拓拓 AI（豆包 / 火山方舟）部署说明

## 已加入页面的能力
- 点击原有 3D 拓拓打开聊天窗口；3D Canvas、实验室背景和主工作台保持原样。
- 多轮文字对话、清空对话、连接地址设置。
- API 地址保存在当前浏览器本地；API Key 不会写入 HTML 或浏览器。
- 机器人原有 3D 动画继续运行，聊天思考状态通过 DOM 状态标记提供后续动作联动入口。

## 还需要部署一次后端，才能真正调用豆包
GitHub Pages 是静态托管，不能安全保存火山方舟 API Key。请把 `toto-ai-worker/worker.js` 部署为 Cloudflare Worker：

1. 在 Cloudflare 创建一个 Worker，将此文件内容作为 Worker 代码部署。
2. 在 Worker 的 Settings → Variables and Secrets 中添加：
   - `ARK_API_KEY`：选择 Secret，填入火山方舟 API Key。
   - `ARK_MODEL`：普通变量，填入方舟控制台中已创建的推理接入点 ID（Endpoint ID）。
   - 可选 `ALLOWED_ORIGIN`：填入实验室网页域名，限制跨域来源。
3. 部署后访问 `https://你的-worker域名/health`，看到 `{"ok":true,...}` 即表示后端在线。
4. 打开实验室，点击拓拓 → 连接设置，填写 `https://你的-worker域名/chat` 并保存，即可开始对话。

## 火山方舟接口
后端调用 `POST https://ark.cn-beijing.volces.com/api/v3/chat/completions`，使用 Bearer API Key。模型由 `ARK_MODEL` 环境变量指定，不把任何密钥写入仓库。

## 注意
- API 调用费用由火山引擎方舟账户承担，与 ChatGPT 订阅无关。
- 不要把 API Key 发到聊天窗口、HTML、GitHub 仓库或前端配置框。
- 目前交付的是文字对话第一阶段；语音识别、语音合成及更细致的机器人表情/动作状态联动可在文字链路验证后继续接入。


## 第二阶段新增：密铺知识增强与机器人状态反馈

Worker 已内置轻量关键词检索知识库，覆盖：
- 密铺定义与判断要点
- 正三角形、正方形、正六边形的单独密铺
- 正五边形内角及不能单独规则密铺的角度原因
- 正多边形内角公式与顶点 360° 条件
- 半正密铺、平面密铺与立体堆砌的区别
- 观察—猜想—操作—验证的探究流程

每次对话会按最新问题检索最多 3 条相关知识片段，作为模型的补充上下文。响应中的 `knowledgeUsed` 用于提示前端本轮是否调用了密铺知识资料。

页面新增：
- 拓拓思考时的青色呼吸光环
- 拓拓回答时的暖金色状态光环
- “停止回答”按钮，可中止当前请求
- 原 3D 机器人绘制代码与实验室场景保持独立，不替换机器人模型

## 第二阶段部署更新

如果 Worker 已经部署过，需要将更新后的 `toto-ai-worker/worker.js` 重新部署一次。无需更改已有的 `ARK_API_KEY` 与 `ARK_MODEL` Secrets/Variables。页面文件更新后刷新 GitHub Pages 即可。

知识库当前为 Worker 内置的基础知识片段，不会自动读取学生当前画布或实验操作；如需读取工作台图形状态，下一阶段需为原实验室增加明确的状态导出接口，再把经过筛选的状态传给 AI。
