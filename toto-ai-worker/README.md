# 拓拓 AI · 腾讯云部署说明

当前后端采用腾讯云 CloudBase HTTP 云函数，代码目录为 `toto-ai-cloudbase/`。可直接使用交付的 `toto-ai-cloudbase-upload.zip` 上传部署，无需命令行或 GitHub 自动部署。

## 最少部署步骤

1. 腾讯云控制台打开 CloudBase → 云函数 → 新建 HTTP 云函数。
2. 运行环境选 Node.js 20.19，代码来源选上传 ZIP，上传 `toto-ai-cloudbase-upload.zip`。
3. 在云函数环境变量中设置 `ARK_API_KEY` 和 `ARK_MODEL`；可选设置 `ALLOWED_ORIGIN` 为实验室网页来源域名。
4. 部署后检查 `/health`，正常后将云函数 HTTPS 访问域名加上 `/chat`，填入实验室「腾讯云 AI 连接设置」。

## 保留的能力

- 拓拓密铺教学系统提示词和基础知识检索
- 多轮对话
- 接收自由创作工作台当前图形、旋转角、坐标和顶点角度
- 接收最近一次几何检测摘要
- 火山方舟模型接口代理，API Key 只保存在腾讯云函数环境变量中

不要把 API Key 放入 HTML、GitHub 或聊天消息。当前代码没有包含任何真实密钥。

## 中国大陆使用

建议选择中国大陆地域的 CloudBase 环境。正式绑定自有域名时按腾讯云要求完成 ICP 备案、域名解析和 HTTPS 配置。默认 HTTPS 访问地址可用于先行联调。
