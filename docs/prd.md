# USC CS Course Impact Visualizer - PRD

## Problem
USC CS本科生选课时难以预见课程变更对prerequisite链和track要求的影响。

## Solution
DAG可视化工具，用户点击标记某门课为"不选"，即时显示受影响的下游课程和track状态。

## Target User
USC CS本科生

## MVP Scope

### 功能需求
- FR1: 展示USC CS课程的prerequisite DAG图
- FR2: 用户点击课程节点标记为"不选"
- FR3: 自动高亮所有依赖该课程的下游课程
- FR4: 侧边栏显示2-3个track的completion状态

### 非功能需求
- NFR1: 纯前端，无后端
- NFR2: 课程数据JSON预设

## Technical Stack
- React
- D3.js 或 vis.js（DAG渲染）
- JSON文件存储prerequisite关系

## Out of Scope
- 用户账户/登录
- 课程推荐
- 时间排课
- 数据持久化
- 后端服务

## Core Interaction Flow
1. 页面加载 → 渲染USC CS课程DAG
2. 用户点击课程节点 → 标记为"不选"
3. 系统即时更新 → 受影响课程变红
4. 侧边栏更新 → 显示哪些track现在incomplete
