# Story 1: 项目初始化

## User Story
作为开发者，我需要初始化React项目并配置必要的依赖，以便团队可以开始开发课程可视化工具。

## Background
这是MVP的基础，需要建立一个干净的React项目结构，安装DAG可视化所需的库。

## Acceptance Criteria
- [x] 使用Vite或Create React App创建React项目
- [x] 安装vis.js（推荐vis-network，比D3更适合快速实现DAG）
- [x] 创建基本目录结构：
  - `src/components/` - React组件
  - `src/data/` - 课程JSON数据
  - `src/utils/` - 工具函数
- [x] 清理默认模板代码
- [x] 添加基本的CSS reset
- [x] `npm run dev` 能正常启动项目
- [x] 页面显示"USC CS Course Impact Visualizer"标题

## Technical Notes
- 推荐使用Vite（更快）
- vis-network文档：https://visjs.github.io/vis-network/docs/network/
- 不需要路由，单页面应用

## Dependencies
无

## Estimated Time
30分钟

---

## Dev Agent Record

### Status
Ready for Review

### Agent Model Used
Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### File List
- `app/` - New Vite React project directory
- `app/package.json` - Project dependencies (React 18, vis-network, vis-data)
- `app/src/App.tsx` - Main application component with USC header
- `app/src/App.css` - App styles with USC colors
- `app/src/index.css` - CSS reset
- `app/src/main.tsx` - React entry point (unchanged)
- `app/src/components/` - Empty directory for future components
- `app/src/data/` - Empty directory for course JSON data
- `app/src/utils/` - Empty directory for utility functions
- `app/index.html` - Updated with project title

### Completion Notes
- Created Vite React TypeScript project in `/app` subdirectory
- Installed vis-network and vis-data for DAG visualization
- Set up USC-themed header with cardinal red (#990000) and gold (#FFCC00)
- Added comprehensive CSS reset in index.css
- Dev server runs successfully on localhost:5173

### Change Log
- 2024-11-16: Initial project setup completed
