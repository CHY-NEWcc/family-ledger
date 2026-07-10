# 技术规范 — 极简记账

## 1. 技术栈

| 项 | 方案 |
|---|---|
| 结构 | HTML5 |
| 样式 | CSS3（CSS 变量驱动，无预处理器） |
| 逻辑 | 原生 JavaScript（ES6+），无框架 |
| 存储 | `window.localStorage` |
| 部署 | 单文件 `index.html`，双击浏览器打开 |

## 2. 文件结构

```
D:\AI\jtjz\
├── index.html          # 主应用（所有代码内联）
├── AGENTS.md           # Codex 工作指引
├── devlog/             # 开发日志
│   └── YYYY-MM-DD.md
└── docs/
    ├── requirements.md
    ├── tech-spec.md
    ├── design-spec.md
    └── execution-plan.md
```

## 3. 数据模型

### 3.1 账单对象（Bill）
```js
{
  id: "string",           // 唯一标识，时间戳+随机数
  type: "income"|"expense", // 类型
  amount: number,         // 金额（正数，最多2位小数）
  categoryId: "string",   // 关联分类ID
  date: "YYYY-MM-DD",     // 日期字符串
  note: "string",         // 备注（可为空）
  createdAt: "ISO string" // 创建时间
}
```

### 3.2 分类对象（Category）
```js
{
  id: "string",           // 唯一标识
  name: "string",         // 分类名称
  type: "income"|"expense", // 所属类型
  icon: "string"          // emoji 图标
}
```

### 3.3 localStorage 键名
| 键名 | 存储内容 | 初始值 |
|------|----------|--------|
| `jz_bills` | 账单数组 JSON | `[]` |
| `jz_categories` | 分类数组 JSON | 预设14类 |

## 4. localStorage 工具函数

```js
// 读取
function loadData(key) { ... }
// 保存
function saveData(key, data) { ... }
// 获取所有账单
function getBills() { ... }
// 保存所有账单
function saveBills(bills) { ... }
// 获取所有分类
function getCategories() { ... }
// 保存所有分类
function saveCategories(categories) { ... }
// 初始化预设分类（仅首次）
function initDefaultCategories() { ... }
```

## 5. 编码规范

### HTML
- 语义化标签（`<header>`, `<nav>`, `<main>`, `<section>`）
- 表单使用 `<form>` + 原生验证属性辅助
- 使用 `data-*` 属性传递业务数据（如 `data-id`、`data-type`）

### CSS
- 所有颜色、圆角、阴影、间距通过 CSS 变量定义在 `:root`
- 类名使用 kebab-case（如 `.bill-card`、`.summary-card`）
- 使用 Flexbox / Grid 布局
- 不依赖 CSS 框架

### JavaScript
- 使用 `const` / `let`，禁用 `var`
- 函数命名使用 camelCase
- 事件委托优先于逐个绑定
- DOM 操作集中于渲染函数
- 核心函数列表：
  - `renderApp()` — 主渲染入口
  - `renderSummary()` — 概览卡片
  - `renderBillList()` — 账单列表
  - `renderStats()` — 统计面板
  - `renderCategories()` — 分类管理
  - `addBill(bill)` — 新增账单
  - `deleteBill(id)` — 删除账单
  - `updateBill(id, data)` — 编辑账单

## 6. CSS 变量清单（设计）
```css
:root {
  /* 主色 */
  --color-income: #22c55e;
  --color-income-light: #f0fdf4;
  --color-expense: #f97316;
  --color-expense-light: #fff7ed;
  /* 中性色 */
  --color-bg: #f8fafc;
  --color-card: #ffffff;
  --color-text: #1e293b;
  --color-text-secondary: #64748b;
  --color-border: #e2e8f0;
  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  /* 圆角 */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  /* 阴影 */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-card-hover: 0 4px 12px rgba(0,0,0,0.12);
}
```

## 7. 浏览器兼容
- Chrome 100+
- Edge 100+
- Firefox 100+
