# Split Sheep - 企鵝搶地遊戲前端

一個使用 Vue 3 開發的多人線上遊戲前端專案。

## 📋 目錄

- [技術棧](#技術棧)
- [環境需求](#環境需求)
- [快速開始](#快速開始)
- [開發指令](#開發指令)
- [專案結構](#專案結構)
- [開發工具配置](#開發工具配置)
- [程式碼規範](#程式碼規範)
- [Git 工作流程](#git-工作流程)

## 🛠 技術棧

### 核心框架
- **Vue 3.2.45** - 使用 Composition API 的現代化前端框架
- **Vite 4.1.0** - 新一代前端建構工具，提供快速的開發體驗
- **Vue Router 4.1.6** - Vue.js 官方路由管理器
- **Pinia 2.0.33** - Vue 3 官方推薦的狀態管理工具

### 樣式方案
- **TailwindCSS 3.3.3** - 實用優先的 CSS 框架
- **SCSS (Sass 1.61.0)** - CSS 預處理器
- **PostCSS 8.4.29** - CSS 轉換工具
- **Autoprefixer** - 自動添加 CSS 瀏覽器前綴

### 網路通訊
- **Axios 1.3.5** - HTTP 客戶端
- **ActionCable (@rails/actioncable 7.1.3-4)** - WebSocket 即時通訊

### 開發工具
- **ESLint 8.37.0** - JavaScript 程式碼檢查工具
  - 配置基於 Airbnb 風格指南
  - 支援 Vue 3 特性
- **Stylelint 13.7.2** - CSS/SCSS 程式碼檢查工具
- **Husky 8.0.0** - Git hooks 管理工具
- **Vite Plugin Vue DevTools** - Vue 開發者工具

### 其他工具
- **@vueuse/core** - Vue 組合式 API 工具集
- **normalize.css** - CSS 重置樣式

## 💻 環境需求

- **Node.js**: >= 18.0.0 (建議使用 v20.x)
- **npm**: >= 9.0.0
- **作業系統**: Windows / macOS / Linux

## 🚀 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 環境變數設定

複製 `.env` 檔案並根據需要修改：

```bash
# .env
VITE_SOCKET_IO_URL=https://magician-socketio.onrender.com
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

開發伺服器將在 `http://localhost:5173` 啟動（預設端口）。

## 📝 開發指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 啟動開發伺服器 (Vite) |
| `npm run build` | 建構生產環境版本 |
| `npm run build-github-page` | 建構 GitHub Pages 版本 (base: /magician/) |
| `npm run preview` | 預覽生產環境建構結果 |
| `npm run lint` | 執行所有程式碼檢查 (ESLint + Stylelint) |
| `npm run lint:script` | 只執行 JavaScript/Vue 檢查 (ESLint) |
| `npm run lint:style` | 只執行樣式檢查 (Stylelint) |

### 開發伺服器特性

- **熱模組替換 (HMR)**: 修改程式碼後自動更新頁面，無需手動刷新
- **快速冷啟動**: Vite 使用原生 ES 模組，啟動速度極快
- **Vue DevTools**: 自動啟用 Vue 開發者工具插件

## 📁 專案結構

```
split-front/
├── .github/              # GitHub 相關配置
│   └── workflows/        # GitHub Actions CI/CD
├── .husky/               # Git hooks 配置
├── .vscode/              # VS Code 編輯器配置
├── public/               # 靜態資源（不經過 Vite 處理）
├── src/                  # 原始碼目錄
│   ├── assets/           # 資源檔案（圖片、樣式等）
│   ├── components/       # Vue 元件
│   ├── composables/      # 組合式函數 (Composition API)
│   ├── models/           # 資料模型
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia 狀態管理
│   ├── views/            # 頁面元件
│   ├── App.vue           # 根元件
│   └── main.js           # 應用程式入口
├── .env                  # 環境變數
├── .eslintrc.cjs         # ESLint 配置
├── .stylelintrc.cjs      # Stylelint 配置
├── index.html            # HTML 入口檔案
├── package.json          # 專案依賴和腳本
├── postcss.config.js     # PostCSS 配置
├── tailwind.config.js    # TailwindCSS 配置
└── vite.config.js        # Vite 配置
```

### 目錄說明

- **`src/components/`**: 可重用的 Vue 元件
- **`src/composables/`**: 可組合的邏輯函數（Vue 3 Composition API）
- **`src/stores/`**: Pinia 狀態管理 store
- **`src/views/`**: 路由對應的頁面元件
- **`src/router/`**: Vue Router 路由配置

## 🔧 開發工具配置

### VS Code 建議擴充套件

- **Volar** - Vue 3 官方 IDE 支援
- **ESLint** - JavaScript 程式碼檢查
- **Stylelint** - CSS/SCSS 程式碼檢查
- **Tailwind CSS IntelliSense** - TailwindCSS 自動完成

### Vite 配置重點

```javascript
// vite.config.js
{
  build: {
    target: ['es2021']  // 建構目標為 ES2021
  },
  resolve: {
    alias: {
      '@': './src'      // 使用 @ 作為 src 目錄的別名
    }
  }
}
```

### 路徑別名

專案中可以使用 `@` 作為 `src` 目錄的別名：

```javascript
// 以下兩種方式等價
import MyComponent from '@/components/MyComponent.vue'
import MyComponent from './src/components/MyComponent.vue'
```

## 📏 程式碼規範

### JavaScript/Vue 規範 (ESLint)

- **風格基礎**: Airbnb JavaScript Style Guide
- **縮排**: 2 個空格
- **引號**: 單引號
- **物件**: 大括號內需要空格 `{ key: value }`
- **Vue 3**: 支援 Composition API 和 `<script setup>`

#### 常見規則

```javascript
// ✅ 正確
const obj = { name: 'John' }
if (condition) {
  console.log('Hello')
}

// ❌ 錯誤
const obj={name:'John'}  // 缺少空格
if(condition){           // 缺少空格
  console.log('Hello')
}
```

### CSS/SCSS 規範 (Stylelint)

- 使用 SCSS 推薦配置
- 屬性排序規則
- 自動修正格式問題

### Vue 元件規範

```vue
<script setup>
// 使用 Composition API
import { ref, computed } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)
</script>

<template>
  <!-- 模板內容 -->
</template>

<style lang="scss" scoped>
/* 樣式使用 scoped 避免污染全域 */
</style>
```

## 🔄 Git 工作流程

### Git Hooks (Husky)

專案使用 Husky 管理 Git hooks：

- **pre-commit**: 提交前自動執行 `npm run lint`
  - 檢查程式碼風格
  - 自動修正可修正的問題
  - 如果有錯誤會阻止提交

### Commit Message 規範

建議使用 Conventional Commits 格式：

```
<type>: <description>

[optional body]
```

**Type 類型**:
- `feat`: 新功能
- `fix`: 修復 bug
- `docs`: 文件更新
- `style`: 程式碼格式調整（不影響功能）
- `refactor`: 重構（不是新功能也不是修復）
- `test`: 測試相關
- `chore`: 建構過程或輔助工具的變動
- `mockup`: UI/UX 調整

**範例**:
```
feat: 新增玩家排行榜功能
fix: 修復遊戲結束時的計分錯誤
docs: 更新 README 開發指南
```

### 分支策略

- `main`: 主分支，用於生產環境
- `develop`: 開發分支
- `feature/*`: 功能分支
- `fix/*`: 修復分支

## 🤝 貢獻指南

1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📮 聯絡方式

如有問題或建議，請開啟 Issue 或聯絡專案維護者。

---

**Happy Coding! 🎮**
