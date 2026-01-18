# Issue #021: [功能] 整合 Discord SDK

## 目標

讓 Vue App 可以在 Discord Activity 的 iframe 中正常顯示，並完成基礎的 SDK 初始化。

## 關聯

- Milestone: [#001 Discord Activity 遷移](https://github.com/side-project-at-SPT/split-front/milestone/1)
- 規劃討論: [Issue #020](https://github.com/side-project-at-SPT/split-front/issues/20)

---

## 驗收標準

- [ ] 安裝 `@discord/embedded-app-sdk` 套件
- [ ] 完成 SDK 初始化流程
- [ ] 呼叫 `authorize()` 取得授權碼
- [ ] 在 Discord Activity 中可以看到 Vue App 的 iframe
- [ ] Console 無 SDK 相關錯誤

## 範圍

### 新增項目

- [ ] 安裝 `@discord/embedded-app-sdk`
- [ ] 建立 `src/composables/useDiscordSdk.js`（或類似結構）
  - SDK 初始化邏輯
  - `authorize()` 封裝
  - 錯誤處理
- [ ] 建立 Discord Activity 入口頁面（或修改現有入口）
- [ ] 環境變數設定（Discord Client ID 等）

### 不包含

- V2 驗證流程（後端 Token 交換）
- 遊戲邏輯修改

---

## 技術細節

### SDK 初始化流程

```javascript
import { DiscordSDK } from "@discord/embedded-app-sdk";

const discordSdk = new DiscordSDK(DISCORD_CLIENT_ID);

async function setup() {
  // 等待 SDK ready
  await discordSdk.ready();

  // 取得授權碼
  const { code } = await discordSdk.commands.authorize({
    client_id: DISCORD_CLIENT_ID,
    response_type: "code",
    scope: ["identify", "guilds"],
  });

  // code 可用於後續與後端交換 Token
  return code;
}
```

### 環境變數

```env
VITE_DISCORD_CLIENT_ID=your_client_id
```

---

## 測試方式

1. 在 Discord Developer Portal 建立 Application
2. 設定 Activity URL（開發時可用 ngrok 或 cloudflared）
3. 在 Discord 頻道中啟動 Activity
4. 確認 iframe 正常顯示

---

## 參考資料

- [Discord Embedded App SDK](https://discord.com/developers/docs/activities/overview)
- [Discord Activity 教學](https://discord.com/developers/docs/activities/building-an-activity)
