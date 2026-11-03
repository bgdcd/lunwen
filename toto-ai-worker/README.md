# 拓拓 AI · 腾讯云 CloudBase + 阿里云百炼

当前方案：腾讯云 CloudBase 负责运行拓拓后端；模型服务使用阿里云百炼（通义千问）。不再调用火山方舟。

## 部署配置

将 `toto-ai-cloudbase-upload.zip` 上传部署为腾讯云 CloudBase HTTP 云函数（Node.js 20.19）。部署后，在函数环境变量中配置：

- `DASHSCOPE_API_KEY`：阿里云百炼 API Key。
- `BAILIAN_MODEL`：模型名称，默认 `qwen-plus`。
- `BAILIAN_BASE_URL`：可选。北京地域公共兼容接口默认 `https://dashscope.aliyuncs.com/compatible-mode/v1`；如使用业务空间专属域名，填写相应 Base URL。
- `ALLOWED_ORIGIN`：实验室前端网页来源域名，建议设置。
- `PORT`：保持 9000。

百炼调用地址由后端自动拼为 `<BAILIAN_BASE_URL>/chat/completions`，并以 Bearer Token 方式传递 `DASHSCOPE_API_KEY`。

## 接口

- `GET /health`：健康检查。
- `POST /chat`：多轮对话。
- `OPTIONS`：浏览器跨域预检。

## 保留能力

拓拓的密铺教学系统提示词、密铺知识检索、多轮问答、自由创作工作台几何对象数据（图形种类、边数、坐标、旋转角、各顶点内角）和最近一次几何检测摘要均保留。模型不得假装看见屏幕，也不得臆测未传入的邻接、边长、缝隙或重叠关系。

## 环境变量示例

```text
DASHSCOPE_API_KEY=你的百炼API_Key
BAILIAN_MODEL=qwen-plus
BAILIAN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
ALLOWED_ORIGIN=https://你的实验室网页域名
```

API Key 只填写在腾讯云函数的环境变量中，不要放入 HTML、GitHub 或聊天消息。API Key 与 Base URL 必须属于同一地域/计费方案；中国大陆默认使用北京地域接口。
