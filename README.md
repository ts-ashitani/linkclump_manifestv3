# Linkclump - Manifest V3対応版

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

linkclump は複数のリンクを一度に開くことができるGoogle Chrome拡張機能です。Chrome拡張機能の新しいManifest V3仕様で動作するように修正しました。

## 概要

Linkclumpは、ウェブページ上で複数のリンクを選択して一度に操作できる便利な拡張機能です。以下の機能を提供します：

- **複数タブで開く**: 選択したリンクを新しいタブで一括オープン
- **新しいウィンドウで開く**: 選択したリンクを新しいウィンドウで開く
- **リンクをコピー**: 選択したリンクのURLやタイトルをクリップボードにコピー
- **ブックマークに追加**: 選択したリンクを一括でブックマークに追加

## インストール方法

1. このリポジトリをダウンロードまたはクローンします
2. Chrome拡張機能の開発者モードを有効にします
3. 「パッケージ化されていない拡張機能を読み込む」でプロジェクトフォルダを選択します

## 使用方法

1. ウェブページ上でマウスとキーボードの組み合わせを使用してリンクを選択します
2. デフォルトの操作: **左クリック + Zキー** でドラッグしてリンクを選択
3. 選択したリンクが赤い枠で囲まれます
4. マウスを離すと設定されたアクションが実行されます

### デフォルト設定
- **左クリック + Zキー**: 選択したリンクを新しいタブで開く

## Manifest V3対応について

このバージョンでは、Chrome拡張機能の新しいManifest V3仕様に完全対応しました。

### 主な変更点

#### 1. Manifest設定の更新
```json
{
  "manifest_version": 3,
  "background": {
    "service_worker": "background.js"
  },
  "permissions": ["bookmarks", "scripting", "storage"],
  "host_permissions": ["http://*/*", "https://*/*"]
}
```

#### 2. Service Worker対応
- **Background Scripts** → **Service Worker**への移行
- `importScripts()`を使用したモジュール読み込み
- DOM非依存の実装に変更

#### 3. API更新
- `chrome.extension` → `chrome.runtime`
- `chrome.tabs.executeScript` → `chrome.scripting.executeScript`
- `localStorage` → `chrome.storage.local`

#### 4. ストレージシステムの変更
従来の`localStorage`から`chrome.storage.local`への完全移行：
```javascript
// 旧実装
localStorage["settings"] = JSON.stringify(settings);

// 新実装
chrome.storage.local.set({
  'settings': JSON.stringify(settings)
}, callback);
```

#### 5. 非同期処理の強化
- 全てのストレージ操作を非同期化
- コールバック形式での適切なエラーハンドリング
- メッセージパッシングの信頼性向上

#### 6. セキュリティ強化
- Content Security Policy (CSP) の厳格化
- Host Permissionsの明示的な分離
- Service Workerによる安全な背景処理

## 技術仕様

### ファイル構成
```
├── manifest.json          # Manifest V3設定ファイル
├── background.js          # Service Worker
├── linkclump.js          # コンテンツスクリプト
├── settings_manager.js   # 設定管理（V3対応）
├── pages/
│   ├── options.html      # オプション画面
│   ├── options.js        # オプション画面ロジック
│   └── test_area.html    # テスト用ページ
└── images/               # アイコン画像
```

### 権限 (Permissions)
- `bookmarks`: ブックマーク機能
- `scripting`: コンテンツスクリプト実行
- `storage`: 設定データの永続化
- `host_permissions`: 全サイトでの動作

### 対応ブラウザ
- Google Chrome 88以降（Manifest V3サポート）
- Chromium系ブラウザ

## 開発者向け情報

### ビルド方法
```bash
# 依存関係のインストール（必要に応じて）
npm install

# 拡張機能のパッケージ化
zip -r linkclump-v3.zip . -x "*.git*" "node_modules/*" "*.md"
```

### デバッグ方法
1. Chrome開発者ツールで拡張機能のService Workerを検査
2. コンソールでエラーログを確認
3. `chrome://extensions/` での詳細なエラー情報の確認

### V3移行時の主な課題と解決策

#### 課題1: Service WorkerでのDOM非アクセス
**解決策**: クリップボード操作をコンテンツスクリプトに委譲
```javascript
// Service Worker側
function copyToClipboard(text, tabId) {
  chrome.tabs.sendMessage(tabId, {
    message: "copyToClipboard",
    text: text
  });
}

// コンテンツスクリプト側
chrome.runtime.onMessage.addListener(function(request, sender, callback) {
  if (request.message === "copyToClipboard") {
    copyToClipboardFallback(request.text);
  }
});
```

#### 課題2: 非同期ストレージへの移行
**解決策**: 全ての設定管理を非同期コールバック形式に変更
```javascript
// 新しい非同期実装
SettingsManager.prototype.load = function(callback) {
  chrome.storage.local.get(['settings'], function(result) {
    try {
      if (result.settings) {
        callback(JSON.parse(result.settings));
      } else {
        callback(getDefaultSettings());
      }
    } catch(error) {
      var settings = getDefaultSettings();
      settings.error = "Error: " + error;
      callback(settings);
    }
  });
};
```

## ライセンス

MIT License

## 貢献

バグレポートや機能改善の提案は Issue または Pull Request でお願いします。

## 元プロジェクトについて

このプロジェクトは [benblack86/linkclump](https://github.com/benblack86/linkclump/tree/master) をベースに、Manifest V3への完全対応を行ったものです。

## 更新履歴

### v2.9.5-mv3 (2024)
- Manifest V3への完全対応
- Service Worker実装
- Chrome Storage API対応
- 非同期処理の全面改修
- セキュリティ強化 

## その他

この修正は、Cursor v1.0 上で、claude-4-sonnet によって自動的に行われました。
