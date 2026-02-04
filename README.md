# 智能下载管理器 (Smart Download Manager)

基于 Chrome Manifest V3 的下载管理扩展，自动按文件类型分类下载，并提供管理页用于搜索、查看与操作下载记录。

## 功能概览

- 自动分类下载文件（按扩展名）
- 管理页：搜索、打开文件、在文件夹中显示
- 设置页：自定义扩展名分类

## 快速开始

1. 打开 `chrome://extensions/`，启用“开发者模式”
2. 点击“加载已解压的扩展程序”，选择项目根目录
3. 点击扩展图标打开管理页

## 文档

- 分类逻辑：`分类逻辑.md`
- 测试与部署：`测试部署文档.md`

## 目录结构

```text
/smart-download-manager
  ├── manifest.json
  ├── background.js
  ├── options.html
  ├── options.js
  ├── manager.html
  ├── manager.js
  ├── style.css
  ├── organize-downloads.py
  └── icons/
```

## UI 风格（已集成）

- Modern Minimalist + Glassmorphism + Bento Box
- 主色：`#6366f1`，背景：`#f8fafc`
- 左侧分类导航 + 右侧搜索与卡片/列表
