# Issue #022: [功能] AutoResizer 元件

## 目標

開發視覺縮放容器元件，讓遊戲畫面可以在 Discord 不同裝置（桌面、側邊欄、行動端）中正確顯示，並維持地圖長寬比。

## 關聯

- Milestone: [#001 Discord Activity 遷移](https://github.com/side-project-at-SPT/split-front/milestone/1)
- 規劃討論: [Issue #020](https://github.com/side-project-at-SPT/split-front/issues/20)
- 依賴: [Issue #021 整合 Discord SDK](https://github.com/side-project-at-SPT/split-front/issues/21)（測試時需要）

---

## 驗收標準

- [ ] 建立 `AutoResizer` 元件
- [ ] 遊戲畫面可根據視窗大小自動縮放
- [ ] 維持地圖長寬比，不變形
- [ ] 支援 Discord 桌面版、側邊欄、行動端三種尺寸
- [ ] 縮放過程流暢，無明顯卡頓

## 範圍

### 新增項目

- [ ] 建立 `src/components/AutoResizer.vue`
  - 監聽視窗大小變化
  - 計算適當的縮放比例
  - 使用 CSS `transform: scale()` 進行縮放
- [ ] 整合到 `GameView.vue`

### 不包含

- Discord SDK 整合（Issue #021）
- 遊戲邏輯修改
- 六邊形網格 `105px` 硬編碼重構（可作為後續優化）

---

## 技術細節

### 元件設計

```vue
<template>
  <div ref="container" class="auto-resizer">
    <div
      class="content"
      :style="{ transform: `scale(${scale})` }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  // 原始設計尺寸
  baseWidth: { type: Number, default: 1920 },
  baseHeight: { type: Number, default: 1080 },
});

const container = ref(null);
const scale = ref(1);

function calculateScale() {
  if (!container.value) return;

  const { clientWidth, clientHeight } = container.value;
  const scaleX = clientWidth / props.baseWidth;
  const scaleY = clientHeight / props.baseHeight;

  // 取較小值以確保內容完全顯示
  scale.value = Math.min(scaleX, scaleY);
}

onMounted(() => {
  calculateScale();
  window.addEventListener('resize', calculateScale);
});

onUnmounted(() => {
  window.removeEventListener('resize', calculateScale);
});
</script>
```

### Discord SDK 整合（未來）

當 Discord SDK 整合完成後，可改用 SDK 的 layout 事件：

```javascript
discordSdk.subscribe('ACTIVITY_LAYOUT_MODE_UPDATE', (event) => {
  // event.layout_mode: 'focused' | 'pip' | 'grid'
  calculateScale();
});
```

### 現有硬編碼問題

目前 `GameView.vue` 中六邊形位置使用硬編碼 `105px`：

```javascript
// GameView.vue:257-258
newDiv.style.left = `calc(${ from.x * 105 }px + ...)`
```

**本 issue 的做法**：使用 `transform: scale()` 整體縮放，不修改硬編碼。

**後續優化**：可考慮將 `105px` 改為 CSS 變數或動態計算。

---

## 測試方式

### 開發階段（不需 Discord）

1. 調整瀏覽器視窗大小
2. 使用 Chrome DevTools 模擬不同裝置尺寸
3. 確認遊戲畫面正確縮放且不變形

### 整合階段（需要 Issue #021 完成）

1. 在 Discord Activity 中測試
2. 測試桌面版全螢幕
3. 測試側邊欄模式
4. 測試行動端（如有）

---

## 參考資料

- [CSS transform: scale()](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/scale)
- [Discord Activity Layout Modes](https://discord.com/developers/docs/activities/development-guides#activity-layout-mode-updates)
