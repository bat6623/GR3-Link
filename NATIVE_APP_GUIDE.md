# GR3 Link - 原生 App 打包指南

> 將 PWA 轉換為原生 iOS/Android App，繞過 Mixed Content 限制

---

## 🎯 為什麼要做成原生 App？

### 問題
- **PWA 限制**：HTTPS 網頁無法存取 HTTP API（Mixed Content）
- **iOS 限制**：Safari 無法繞過此安全限制

### 解決方案
- **原生 App**：可以直接發送 HTTP 請求，不受瀏覽器限制
- **完整功能**：真正連線 GR3 相機，瀏覽和下載照片

---

## 📦 推薦方案：Capacitor

**Capacitor** 是 Ionic 團隊開發的工具，可以將 Web App 打包成原生 App。

### 優點
- ✅ 零程式碼修改（或極少修改）
- ✅ 支援 iOS 和 Android
- ✅ 保留所有 Web 功能
- ✅ 可以存取原生 API
- ✅ 繞過 Mixed Content 限制

---

## 🚀 快速開始

### 1. 安裝 Capacitor

```bash
cd /Users/bat.huang/Buna-Star/Ai-WEB/GR3

# 安裝 Capacitor CLI
npm install @capacitor/core @capacitor/cli

# 初始化 Capacitor
npx cap init
```

**設定提示**：
- App name: `GR3 Link`
- App ID: `com.gr3link.app`（或您的自訂 ID）
- Web directory: `dist`

### 2. 新增 iOS 平台

```bash
# 安裝 iOS 平台
npm install @capacitor/ios

# 新增 iOS 專案
npx cap add ios
```

### 3. 修改設定以允許 HTTP

編輯 `ios/App/App/Info.plist`，新增以下內容：

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
    <!-- 或更安全的方式：只允許特定 IP -->
    <key>NSExceptionDomains</key>
    <dict>
        <key>192.168.0.1</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

### 4. 建置並開啟 Xcode

```bash
# 建置 Web 部分
npm run build

# 同步到 iOS
npx cap sync ios

# 開啟 Xcode
npx cap open ios
```

### 5. 在 Xcode 中執行

1. 連接您的 iPhone
2. 選擇您的裝置作為目標
3. 點擊 ▶️ Run
4. App 會安裝到您的手機上

---

## 🤖 Android 版本（選用）

```bash
# 安裝 Android 平台
npm install @capacitor/android

# 新增 Android 專案
npx cap add android

# 建置並同步
npm run build
npx cap sync android

# 開啟 Android Studio
npx cap open android
```

**Android 設定**：
編輯 `android/app/src/main/res/xml/network_security_config.xml`：

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">192.168.0.1</domain>
    </domain-config>
</network-security-config>
```

並在 `AndroidManifest.xml` 中引用：

```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

---

## 🔧 可能需要的程式碼調整

### 1. 更新 `capacitor.config.json`

建立 `capacitor.config.json`：

```json
{
  "appId": "com.gr3link.app",
  "appName": "GR3 Link",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "allowNavigation": [
      "192.168.0.1"
    ]
  }
}
```

### 2. 檢查相機連線邏輯

在 `src/camera.js` 中，確保使用絕對 URL：

```javascript
// 已經正確使用絕對 URL
const response = await fetch('http://192.168.0.1/v1/photos', {
  method: 'GET',
  signal: controller.signal
});
```

### 3. 移除 Mock 模式判斷（選用）

如果您希望 App 版本總是嘗試真實連線：

```javascript
// src/camera.js
constructor() {
  this.baseUrl = '/v1';
  this.isConnected = false;
  // 移除或修改這行
  // this.isMock = location.hostname === 'localhost' && !location.search.includes('real');
  this.isMock = false; // App 版本永遠不使用 Mock
}
```

---

## 📱 測試流程

### 開發測試
1. 開啟 GR3 的 Wi-Fi
2. iPhone 連接到 GR3 Wi-Fi
3. 在 Xcode 中執行 App
4. 點擊 Connect
5. 應該能成功連線並看到照片

### 除錯
- 使用 Safari 的 Web Inspector 連接到 iOS 裝置
- 查看 Console 輸出
- 檢查網路請求

---

## 🎨 App 圖示和啟動畫面

### 圖示
將您的 App 圖示放在：
- iOS: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Android: `android/app/src/main/res/mipmap-*/`

您已經有 `public/pwa-192x192.png` 和 `public/pwa-512x512.png`，可以使用工具轉換：
- 線上工具：https://www.appicon.co/
- 或使用 Xcode 的 Asset Catalog

### 啟動畫面
Capacitor 會自動使用您的 PWA 啟動畫面。

---

## 📦 發布到 App Store

### 準備工作
1. 註冊 Apple Developer Program（年費 $99 USD）
2. 在 Xcode 中設定 Signing & Capabilities
3. 選擇您的 Team

### 建置發布版本
1. 在 Xcode 中選擇 `Product` → `Archive`
2. 上傳到 App Store Connect
3. 填寫 App 資訊、截圖等
4. 提交審核

---

## 🔄 更新流程

當您修改 Web 程式碼後：

```bash
# 1. 建置 Web
npm run build

# 2. 同步到原生專案
npx cap sync

# 3. 在 Xcode/Android Studio 中重新執行
```

---

## 💡 進階功能（選用）

### 使用 Capacitor Plugins

可以存取原生功能：

```bash
# 相機（拍照）
npm install @capacitor/camera

# 檔案系統（儲存照片）
npm install @capacitor/filesystem

# 分享
npm install @capacitor/share
```

範例：下載照片到相簿

```javascript
import { Filesystem, Directory } from '@capacitor/filesystem';

async downloadPhoto(photo) {
  const response = await fetch(photo.url);
  const blob = await response.blob();
  const base64 = await this.blobToBase64(blob);
  
  await Filesystem.writeFile({
    path: photo.name,
    data: base64,
    directory: Directory.Documents
  });
}
```

---

## ⚠️ 注意事項

### 安全性
- 只允許 `192.168.0.1` 的 HTTP 連線
- 不要允許所有 HTTP 連線（`NSAllowsArbitraryLoads`）

### 效能
- 原生 App 效能通常比 PWA 更好
- 但檔案大小會增加（包含 WebView）

### 維護
- 需要同時維護 Web 版和 App 版
- 建議使用相同的程式碼庫

---

## 🆘 常見問題

### Q: 需要 Mac 才能開發 iOS App 嗎？
**A**: 是的，iOS 開發需要 macOS 和 Xcode。

### Q: 可以只做 Android 版嗎？
**A**: 可以！Android 開發可以在 Windows/Mac/Linux 上進行。

### Q: App 大小會是多少？
**A**: 約 10-20 MB（包含 WebView 和您的程式碼）

### Q: 需要重新寫程式碼嗎？
**A**: 幾乎不需要！只需要設定檔和建置流程。

---

## 📚 參考資源

- [Capacitor 官方文件](https://capacitorjs.com/docs)
- [iOS 開發指南](https://capacitorjs.com/docs/ios)
- [Android 開發指南](https://capacitorjs.com/docs/android)
- [App Store 發布指南](https://developer.apple.com/app-store/submissions/)

---

## ✅ 總結

使用 Capacitor 將您的 GR3 Link 打包成原生 App：

1. ✅ **完全繞過 Mixed Content 限制**
2. ✅ **iOS 和 Android 都能真正連線 GR3**
3. ✅ **保留所有現有功能**
4. ✅ **可以發布到 App Store / Play Store**
5. ✅ **幾乎不需要修改程式碼**

**下一步**：執行上述的「快速開始」步驟，您就能在 iPhone 上測試真正的 GR3 連線功能了！
