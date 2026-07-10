# 极简记账 — Codex 开发指引

## 项目概述
一款纯网页版个人记账工具，单文件 HTML（零依赖），双击用浏览器打开即可使用。数据存储在浏览器 localStorage 中。

## 标准文件路径

| 文件 | 用途 | 路径 |
|------|------|------|
| 需求规格 | 功能需求详细说明 | `docs/requirements.md` |
| 技术规范 | 编码约定、数据模型、API 设计 | `docs/tech-spec.md` |
| 设计规范 | 配色、字体、间距、组件样式 | `docs/design-spec.md` |
| 执行计划 | 分阶段开发步骤 | `docs/execution-plan.md` |
| 开发日志 | 每日开发记录 | `devlog/YYYY-MM-DD.md` |

## 工作规则

1. **开发前**：阅读 `docs/` 下所有标准文件，确保理解当前阶段目标
2. **开发后**：更新 `devlog/YYYY-MM-DD.md`，记录完成事项和待办
3. **零依赖原则**：不引入任何框架、库、CDN 资源——纯 HTML + CSS + JS
4. **所有样式**：CSS 变量统一定义在 `:root` 选择器中
5. **所有数据操作**：通过统一的 localStorage 工具函数，键名前缀 `jz_`
6. **主文件**：`index.html`，所有 HTML/CSS/JS 内联在单文件中
7. **每次修改** `index.html` 后，在开发日志中简要记录改动内容

## 关键约定速查

- **兼容**：Chrome / Edge / Firefox 近两年版本
- **配色**：收入绿 `#22c55e`，支出橙红 `#f97316`
- **日期格式**：`YYYY-MM-DD`
- **本地存储键名**：`jz_bills`（账单）、`jz_categories`（分类）

## 开发阶段总览

1. 项目初始化 → 2. 页面骨架+样式 → 3. 数据层 → 4. 记账功能 → 5. 账单展示 → 6. 月度统计 → 7. 收尾打磨

详见 `docs/execution-plan.md`。
