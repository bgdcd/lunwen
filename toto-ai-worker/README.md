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

知识库当前为 Worker 内置的基础知识片段。当前页面的 `benchCanvas` 是 3D 展示台绘制画布，并没有可读取的学生图形拖动/旋转模型，因此本阶段新增了“探究情境”选择区，由学生或教师选择研究图形、当前操作和遇到的情况；这些白名单字段会随问题发送给 Worker，作为模型上下文，并参与知识检索。界面已明确标注这不是自动识别画布。后续若接入真正可操作的几何编辑器，再将其真实图形状态接入同一 `sceneContext` 数据通道。


## 第三阶段新增：探究情境传递

聊天区新增三个情境选择项：
- 研究图形：正三角形、正方形、正五边形、正六边形、自定义多边形或多种图形组合。
- 正在进行：观察、拖动拼接、旋转、尝试密铺、检查顶点角度或比较平面与立体。
- 遇到的情况：出现缝隙、重叠、边无法贴合、顶点角度不等于 360 度或不知道从哪里开始。

前端仅发送固定选项值，Worker 再次进行白名单校验；不会接受任意页面指令作为场景数据。Worker 会把情境加入本轮系统上下文，并与学生问题一起进行知识片段检索。若三个选项均为“未指定”，则按普通文字对话处理。

注意：情境由学生/教师主动选择，不是机器人视觉识别，也不代表当前页面已经具备可操作几何图形模型。原 3D 拓拓和 3D 展台未被替换。

## 第四阶段新增：几何对象状态接口

页面现在向未来的可操作几何编辑器开放 `window.TotoAI.updateGeometryState(state)`。编辑器每次拖动、旋转或增删图形后，可把真实对象列表同步给拓拓；下一次提问会将最多 20 个对象的类型、边数、旋转角和画布坐标一并发送给 Worker。前端与 Worker 均会校验数据，Worker 根据边数计算正多边形内角，并明确限制模型不得臆测未提供的边长、邻接或重叠情况。

示例（供后续图形编辑器接入）：

```js
window.TotoAI.updateGeometryState({
  dimension: "2d",
  objects: [
    { id: "shape-1", shape: "正五边形", sides: 5, vertexAnglesDeg: [108, 108, 108, 108, 108], rotationDeg: 36, x: 120, y: 80 },
    { id: "shape-2", shape: "菱形", sides: 4, vertexAnglesDeg: [72, 108, 72, 108], rotationDeg: 0, x: 220, y: 80 }
  ]
});
```

也可通过 `window.dispatchEvent(new CustomEvent('toto:geometrychange',{detail: state}))` 同步，或调用 `window.TotoAI.clearGeometryState()` 清空。聊天面板会显示已接收的对象数量。

重要：真实的二维自由创作编辑器位于仓库根目录的 `index.html`，现已完成数据桥接，不再只是预留接口。添加图形、拖动图形（拖动过程中实时同步）、旋转、复制、删除、清空、恢复布局和加载示例后，都会自动更新 `window.TotoAI.getGeometryState()`，并广播 `toto:geometrychange` 与 `polylab:geometry-updated` 事件。当前 `index-workbench.html` 的 `benchCanvas` 仍是独立的装饰性 3D 展示画布，不会被误报为可编辑模型。

几何角度数据特别说明：正三角形、正方形、正五边形、正六边形等规则多边形可由边数计算内角；菱形不是正方形，不能用“4 边形内角都是 90°”代替真实角度。真实编辑器现在会把每个顶点的角度逐一传入 `vertexAnglesDeg`（例如菱形为 72°、108°、72°、108°），Worker 会优先使用这些实测顶点角，不再把菱形错误计算成 90°。\n\n注意两个页面目前仍是独立入口：`index.html` 中的本地拓拓可使用其内置几何检测引擎；`index-workbench.html` 中的云端 Worker 聊天读取其自身页面收到的几何状态。此提交已让真实编辑器持续输出标准化状态事件，但没有声称两个独立页面之间已经自动跨页传输，也没有声称豆包后端已部署。若要让云端 Worker 直接回答 `index.html` 当前作品的状态，需要下一步把该页面的聊天请求接到同一 Worker，或建立明确的同源消息桥接。