# Pony Sticker Generator

一个“像素小马 → 手绘表情包”的网站 MVP。

核心原则：

1. 上传的像素图只进入 `/api/analyze` 做角色信息提取。
2. 最终 `/api/generate` 只接收结构化文字 Prompt，不接收源像素图。
3. 这样可以避免像素风、方块轮廓、直接临摹源图等问题。

## 功能

- 上传像素源图
- AI 解析角色信息
- 手动修正解析卡
- 表情库 20 个表情
- 优先选择历史次数低的表情
- V1/V2 画风库规则继承
- 自动生成纯文字 Prompt
- 调用 OpenAI Image API 生成表情包

## 本地运行

```bash
npm install
cp .env.example .env.local
# 编辑 .env.local，填入 OPENAI_API_KEY
npm run dev
```

打开：

```bash
http://localhost:3000
```

## 环境变量

```bash
OPENAI_API_KEY=sk-your-key-here
OPENAI_VISION_MODEL=gpt-4.1-mini
OPENAI_IMAGE_MODEL=gpt-image-2
OPENAI_IMAGE_SIZE=1024x1024
OPENAI_IMAGE_QUALITY=medium
```

## 部署建议

第一版建议：

- 前端/后端：Vercel 部署 Next.js
- 数据库/登录/额度：Supabase
- 生图：OpenAI Image API

当前 MVP 为单站点版本，表情次数暂存在浏览器状态中。开放给别人使用时，建议把这些迁移到数据库：

- 用户信息
- 每日生成次数
- 每月额度
- 表情使用次数
- 生成记录
- 反馈标签

## 生产版必须增加的功能

1. 用户登录
2. 每用户每日生成上限
3. 全站每日预算上限
4. 失败重试最多 1 次
5. 生成历史保存
6. 反馈标记：颜色错、角错、翅膀错、画风偏、马蹄错、像素风残留等

## 重要工程限制

`/api/generate` 中不要上传原始像素图，只能传 Prompt。

如果把源图传给生图模型，模型很容易继承像素几何结构，导致画风跑偏。
