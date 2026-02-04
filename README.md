# 智能下载管理器 (Smart Download Manager)

基于 Chrome Manifest V3 的智能分类扩展，自动按规则将下载文件存入对应子文件夹。

## 功能概览

- 自动分类下载文件（按扩展名）
- 弹窗：一键开关智能分类
- 设置页：自定义分类、扩展名与文件夹名称，支持导入/导出

## 快速开始

1. 打开 `chrome://extensions/`，启用“开发者模式”
2. 点击“加载已解压的扩展程序”，选择项目根目录
3. 点击扩展图标可开关“智能分类”，并进入设置页

## 目录结构

```text
/smart-download-manager
  ├── manifest.json
  ├── background.js
  ├── options.html
  ├── options.js
  ├── popup.html
  ├── popup.js
  ├── style.css
  └── icons/
```

## UI 风格（已集成）

- Modern Minimalist + Glassmorphism + Bento Box
- 主色：`#6366f1`，背景：`#f8fafc`
- 简洁面板 + 玻璃拟态风格
