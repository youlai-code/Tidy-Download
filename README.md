# TidyDownload - 下载自动归类助手

基于 Chrome Manifest V3 的智能文件整理扩展，自动按规则将下载文件存入对应子文件夹，让你的下载文件夹从此井井有条。

![Preview](Images/Preview.png)

## 核心功能

- **自动归档**：根据文件扩展名，自动将下载文件分类到 Images、Documents、Videos、Audio、Archives、Apps 等文件夹。
- **隐私优先**：本地运行，不收集任何数据。详情请参阅 [隐私政策](PRIVACY.md)。
- **多语言支持**：支持 简体中文、繁体中文、英语、日语、韩语、法语、西班牙语、阿拉伯语、葡萄牙语、俄语、德语、印尼语、泰语、越南语、土耳其语、意大利语、波兰语、荷兰语、瑞典语、印地语、希腊语。
- **灵活配置**：
  - 可自定义分类规则、扩展名和目标文件夹。
  - 支持启用/禁用特定规则。
  - **自动保存**：修改设置或切换语言后自动静默保存。
- **极简体验**：
  - 现代化 UI 设计 (Glassmorphism + Bento Box)。
  - 弹窗一键开关智能分类功能。

## 快速开始

1. **安装扩展**：
   - 打开 Chrome 浏览器，访问 `chrome://extensions/`。
   - 开启右上角的 **“开发者模式”**。
   - 点击 **“加载已解压的扩展程序”**，选择本项目的根目录。

2. **使用说明**：
   - 安装后，点击浏览器右上角的扩展图标。
   - **Popup 弹窗**：可快速查看运行状态（运行中/已暂停）或进入设置页。
   - **设置页**：
     - **添加规则**：点击 “+” 号卡片添加新的分类规则。
     - **编辑规则**：点击已有卡片修改文件夹名称或扩展名列表。
     - **切换语言**：左下角选择你熟悉的语言，界面即刻更新。

## 目录结构

```text
/TidyDownload
  ├── manifest.json       # 扩展配置文件 (MV3)
  ├── background.js       # 后台服务 (处理下载分类逻辑)
  ├── popup.html          # 弹窗界面
  ├── popup.js            # 弹窗逻辑 (i18n, 状态切换)
  ├── options.html        # 设置页面
  ├── options.js          # 设置逻辑 (规则管理, 多语言, 自动保存)
  ├── style.css           # 全局样式 (Glassmorphism, Bento Grid)
  └── icons/              # 图标资源
```

## UI 风格

- **设计语言**：Modern Minimalist + Glassmorphism + Bento Box
- **配色方案**：
  - 主色调：`#6366f1` (Indigo)
  - 背景色：`#f8fafc` (Slate 50)
- **技术栈**：原生 HTML/CSS/JS (零依赖，轻量级，完全符合 CSP 规范)

## 开发日志

- **v1.0.0**: 初始版本发布，支持基础自动分类。

---

# TidyDownload - Download Organizer

A smart file organization extension based on Chrome Manifest V3 that automatically sorts downloaded files into corresponding subfolders based on rules, keeping your download folder organized forever.

![Preview](Images/Preview.png)

## Core Features

- **Automatic Archiving**: Automatically classifies downloads into Images, Documents, Videos, Audio, Archives, Apps, etc., based on file extensions.
- **Privacy First**: Local processing, no data collection. See [Privacy Policy](PRIVACY.md) for details.
- **Multi-language Support**: Support for Simplified Chinese, Traditional Chinese, English, Japanese, Korean, French, Spanish, Arabic, Portuguese, Russian, German, Indonesian, Thai, Vietnamese, Turkish, Italian, Polish, Dutch, Swedish, Hindi, Greek.
- **Flexible Configuration**:
  - Customizable classification rules, extensions, and target folders.
  - Support enabling/disabling specific rules.
  - **Auto-save**: Automatically saves silently after modifying settings or switching languages.
- **Minimalist Experience**:
  - Modern UI Design (Glassmorphism + Bento Box).
  - One-click toggle for smart classification in the popup.

## Quick Start

1. **Install Extension**:
   - Open Chrome browser and visit `chrome://extensions/`.
   - Enable **"Developer mode"** in the top right corner.
   - Click **"Load unpacked"** and select the root directory of this project.

2. **Instructions**:
   - After installation, click the extension icon in the browser toolbar.
   - **Popup**: Quickly view status (Running/Paused) or enter the settings page.
   - **Settings Page**:
     - **Add Rule**: Click the "+" card to add a new classification rule.
     - **Edit Rule**: Click existing cards to modify folder names or extension lists.
     - **Switch Language**: Select your language in the bottom left, the interface updates instantly.

## Directory Structure

```text
/TidyDownload
  ├── manifest.json       # Extension Configuration (MV3)
  ├── background.js       # Background Service (Handles download classification logic)
  ├── popup.html          # Popup Interface
  ├── popup.js            # Popup Logic (i18n, status toggle)
  ├── options.html        # Settings Page
  ├── options.js          # Settings Logic (Rule management, multi-language, auto-save)
  ├── style.css           # Global Styles (Glassmorphism, Bento Grid)
  └── icons/              # Icon Resources
```

## UI Style

- **Design Language**: Modern Minimalist + Glassmorphism + Bento Box
- **Color Scheme**:
  - Primary: `#6366f1` (Indigo)
  - Background: `#f8fafc` (Slate 50)
- **Tech Stack**: Native HTML/CSS/JS (Zero dependencies, lightweight, fully CSP compliant)

## Dev Log

- **v1.0.0**: Initial release, supports basic auto-classification.
