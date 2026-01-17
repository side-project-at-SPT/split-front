# Issue #020: [規劃] Discord Activity 遷移

## 目標

將「企鵝搶地」遊戲從獨立網頁版遷移至 Discord Activity，讓玩家可以直接在 Discord 頻道中遊玩。

> 詳細技術文件：[docs/milestones/001/README.md](../../milestones/001/README.md)

---

## 驗收標準

### MVP 功能範圍
- [ ] 用戶可在 Discord 頻道啟動 Activity
- [ ] 完成 Discord OAuth2 授權流程
- [ ] 進入遊戲後可看到當前房間狀態
- [ ] 可入座成為玩家 / 離座成為觀眾
- [ ] 玩家可進行完整遊戲流程（放置企鵝 → 移動 → 分配 → 結算）
- [ ] 觀眾可即時觀看遊戲進行
- [ ] 遊戲結束後顯示排行榜

### 效能與體驗
- [ ] 授權流程需在 X 秒內完成（待定義）
- [ ] 遊戲操作延遲需在 X ms 內（待定義）
- [ ] 支援 Discord 桌面版、側邊欄、行動端三種尺寸

### 完成的定義
- [ ] 所有 MVP 功能可正常運作
- [ ] 通過基本 E2E 測試（待定義測試項目）
- [ ] 無阻斷性 bug

---

## 變更範圍

### 前端變更

#### 刪除項目
- [ ] 移除 `HomeView.vue` 的大廳 UI（房間列表、建立房間）
- [ ] 移除 `LobbyChannel` 訂閱邏輯
- [ ] 移除帳密登入 / 訪客登入流程
- [ ] 移除 `@rails/actioncable` 依賴（若完全改用即時資料庫）

#### 新增項目
- [ ] Discord SDK 整合（`@discord/embedded-app-sdk`）
- [ ] V2 驗證流程（授權 → Loading → 進入遊戲）
- [ ] AutoResizer 元件（視覺縮放容器）
- [ ] Command 層抽象（`useRoomCommands`, `useGameCommands`）
- [ ] 通訊適配器（可抽換 ActionCable / Firestore）
- [ ] 座位系統 UI（入座 / 離座按鈕）

#### 重構項目
- [ ] 將 ActionCable 訂閱邏輯從 View 移至 Composable
- [ ] 將 `channel.send()` 呼叫抽象為 Command 函數
- [ ] 六邊形網格 `105px` 硬編碼改為響應式

### 後端配合（需確認）
- [ ] 新增 `/v2/auth` 端點（Discord OAuth2 Token 交換）
- [ ] 整合即時資料庫（Firestore / Supabase）
- [ ] 調整 API 為 CQRS 模式（Command 不回傳遊戲狀態）

### 不變更項目
- [ ] 遊戲規則邏輯（`useGame.js`）
- [ ] 遊戲畫面 UI 元件（`IcePasture.vue`, `PlayerAvatar.vue` 等）
- [ ] 排行榜計算邏輯

---

## 實作取捨

### 通訊架構
- [ ] **選項 A**：保留 ActionCable，僅新增 Discord SDK
  - 優點：改動最小
  - 缺點：無法做到真正的 CQRS，仍依賴 Rails 後端
- [ ] **選項 B**：改用 Firestore
  - 優點：原生即時同步、自動離線支援
  - 缺點：需要重構通訊層、後端需配合
- [ ] **選項 C**：改用 Supabase
  - 優點：類 PostgreSQL、有 Realtime 功能
  - 缺點：同上

### 開發順序
- [ ] **選項 A**：先重構解耦 → 再接 Discord SDK → 最後換通訊層
  - 優點：降低風險、每階段可獨立測試
  - 缺點：前期看不到 Discord 整合成果
- [ ] **選項 B**：先接 Discord SDK → 邊做邊重構
  - 優點：快速看到成果
  - 缺點：可能累積技術債

### 雙軌並存
- [ ] **選項 A**：完全取代，不保留原有流程
  - 優點：認知負擔低、程式碼乾淨
  - 缺點：無法在非 Discord 環境測試
- [ ] **選項 B**：保留原有流程供測試環境使用
  - 優點：開發期間可用原有方式測試
  - 缺點：需維護兩套邏輯

### 預載入機制
- [ ] 是否在 OAuth2 驗證期間預載入遊戲資源（圖片、地圖）？
  - 優點：加快遊戲渲染速度
  - 缺點：增加複雜度

### 樂觀更新
- [ ] 是否實作樂觀更新（Optimistic UI）？
  - 優點：操作手感更即時
  - 缺點：需處理預測失敗的 rollback 邏輯
  - 現況：目前企鵝移動動畫已有本地預測，但與狀態更新耦合

---

## 風險評估

| 風險項目 | 影響程度 | 緩解措施 |
|---------|---------|---------|
| 六邊形網格硬編碼 `105px` | 中 | 使用 CSS `transform: scale()` 或改為 CSS 變數 |
| 動畫與狀態耦合 | 高 | 重構時分離動畫層與狀態層 |
| 後端開發進度不同步 | 高 | 先用 Mock API 開發，定義好介面 |
| Discord SDK 學習曲線 | 低 | 官方文件完整，有範例專案 |

---

## 執行階段建議

```
Phase 1: 重構解耦
├── 抽出 Command 層
├── 抽出通訊適配器
└── 將事件處理從 View 移至 Composable

Phase 2: 平台接入
├── 整合 Discord SDK
├── 實作 V2 驗證流程
└── AutoResizer 元件

Phase 3: 簡化遊戲流程
├── 一頻一房邏輯
└── 座位系統

Phase 4: 通訊層替換（若選擇 Firestore/Supabase）
├── 引入即時資料庫監聽
└── 實作樂觀更新機制
```

---

## 待確認事項

### 後端相關
- [ ] 後端是否同步開發 `/v2/auth` 端點？
- [ ] 即時資料庫選擇：Firestore 或 Supabase？或保留 ActionCable？
- [ ] API 是否需要調整為 CQRS 模式？

### 產品相關
- [ ] MVP 上線時間目標？
- [ ] 是否需要支援非 Discord 環境（網頁版）？
- [ ] 玩家人數上限是否維持 4 人？

### 設計相關
- [ ] Loading 畫面的視覺設計
- [ ] 座位系統的 UI 設計
- [ ] Discord 行動端的適配設計
