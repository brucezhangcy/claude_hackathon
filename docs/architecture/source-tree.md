# Source Tree Structure

## Project Root

```
usc-course-visualizer/
├── public/                     # Static assets
│   └── favicon.ico
├── src/                        # Source code
│   ├── components/            # React components
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # Zustand state management
│   ├── utils/                 # Pure utility functions
│   ├── types/                 # TypeScript type definitions
│   ├── data/                  # Static JSON data
│   ├── App.tsx                # Root component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles + Tailwind
├── docs/                       # Documentation
│   ├── prd.md
│   ├── technical-architecture.md
│   ├── setup-guide.md
│   └── architecture/
│       ├── coding-standards.md
│       ├── tech-stack.md
│       └── source-tree.md
├── .github/                    # GitHub configs
│   └── workflows/
│       └── deploy.yml
├── index.html                  # HTML entry
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
└── README.md
```

---

## Source Code Details

### `/src/components/`

UI组件，负责渲染和用户交互。

```
components/
├── GraphCanvas.tsx          # D3.js DAG渲染容器
├── CourseNode.tsx           # 单个课程节点（可能内联在GraphCanvas）
├── Sidebar.tsx              # 右侧信息面板容器
├── TrackCard.tsx            # 单个track状态卡片
├── TrackList.tsx            # Track列表容器
├── Legend.tsx               # 图例说明（颜色含义）
├── Header.tsx               # 页面标题和说明
└── ResetButton.tsx          # 重置选择按钮
```

**关键组件说明：**

#### `GraphCanvas.tsx`
- 职责：管理SVG画布，初始化D3.js，处理zoom/pan
- Props: `courses: Course[]`, `width: number`, `height: number`
- 依赖：D3.js, dagre-d3, useSelectionStore
- 大小：~150-200行

#### `TrackCard.tsx`
- 职责：显示单个track的完成状态
- Props: `track: Track`
- 内部使用`useTrackStatus` hook
- 显示：进度条、缺失课程列表
- 大小：~50-80行

---

### `/src/hooks/`

自定义React hooks，封装可复用逻辑。

```
hooks/
├── useGraphLayout.ts        # D3布局计算和缓存
├── useTrackStatus.ts        # 计算track完成度
└── useAffectedCourses.ts    # 计算受影响的下游课程
```

**示例：**

```typescript
// useTrackStatus.ts
export function useTrackStatus(track: Track): TrackStatus {
  const { excludedCourses } = useSelectionStore();
  const affectedCourses = useAffectedCourses();

  return useMemo(() => {
    // 计算逻辑
  }, [track, excludedCourses, affectedCourses]);
}
```

---

### `/src/store/`

Zustand状态管理。

```
store/
└── useSelectionStore.ts     # 全局选择状态
```

**Store结构：**

```typescript
interface SelectionStore {
  // State
  excludedCourses: Set<string>;

  // Actions
  toggleCourse: (id: string) => void;
  excludeCourse: (id: string) => void;
  includeCourse: (id: string) => void;
  resetSelection: () => void;
}
```

---

### `/src/utils/`

纯函数工具，无副作用，易于测试。

```
utils/
├── graphAlgorithms.ts       # DAG遍历、影响计算
├── trackCalculations.ts     # Track完成度计算
└── dataLoader.ts            # JSON数据加载和验证
```

**关键函数：**

```typescript
// graphAlgorithms.ts
export function buildDependentsMap(courses: Course[]): Map<string, string[]>
export function findAffectedCourses(excluded: Set<string>, dependents: Map<string, string[]>): Set<string>
export function topologicalSort(courses: Course[]): string[]

// trackCalculations.ts
export function calculateTrackProgress(track: Track, unavailable: Set<string>): number
export function getMissingRequirements(track: Track, unavailable: Set<string>): string[]
```

---

### `/src/types/`

TypeScript类型定义。

```
types/
└── index.ts                 # 所有类型导出
```

**类型定义：**

```typescript
// index.ts
export interface Course {
  id: string;
  code: string;
  name: string;
  units: number;
  prerequisites: string[];
  corequisites?: string[];
}

export interface Track {
  id: string;
  name: string;
  requiredCourses: string[];
  electiveCourses: string[];
  electiveCount: number;
}

export interface TrackStatus {
  isComplete: boolean;
  progress: number;           // 0-100
  missingRequired: string[];
  availableElectives: number;
  neededElectives: number;
}

export type CourseStatus = 'normal' | 'excluded' | 'affected';

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  status: CourseStatus;
}

export interface GraphEdge {
  source: string;
  target: string;
}
```

---

### `/src/data/`

静态数据文件。

```
data/
├── courses.json             # USC CS课程数据
└── tracks.json              # CS specialization tracks
```

**数据结构示例：**

```json
// courses.json
[
  {
    "id": "CSCI103",
    "code": "CSCI 103",
    "name": "Introduction to Programming",
    "units": 4,
    "prerequisites": []
  },
  {
    "id": "CSCI104",
    "code": "CSCI 104",
    "name": "Data Structures and Object Oriented Design",
    "units": 4,
    "prerequisites": ["CSCI103"]
  },
  {
    "id": "CSCI170",
    "code": "CSCI 170",
    "name": "Discrete Methods in Computer Science",
    "units": 4,
    "prerequisites": ["CSCI103"]
  },
  {
    "id": "CSCI201",
    "code": "CSCI 201",
    "name": "Principles of Software Development",
    "units": 4,
    "prerequisites": ["CSCI104"]
  },
  {
    "id": "CSCI270",
    "code": "CSCI 270",
    "name": "Introduction to Algorithms and Theory of Computing",
    "units": 4,
    "prerequisites": ["CSCI104", "CSCI170"]
  }
]
```

```json
// tracks.json
[
  {
    "id": "ai",
    "name": "Artificial Intelligence",
    "requiredCourses": ["CSCI360", "CSCI467"],
    "electiveCourses": ["CSCI566", "CSCI567", "CSCI571", "CSCI572"],
    "electiveCount": 2
  },
  {
    "id": "systems",
    "name": "Computer Systems",
    "requiredCourses": ["CSCI350", "CSCI356"],
    "electiveCourses": ["CSCI402", "CSCI450", "CSCI455"],
    "electiveCount": 2
  },
  {
    "id": "game-dev",
    "name": "Game Development",
    "requiredCourses": ["CSCI420", "CSCI422"],
    "electiveCourses": ["CSCI480", "CSCI520", "CSCI522"],
    "electiveCount": 1
  }
]
```

---

### Root Files

#### `App.tsx`
```typescript
import { GraphCanvas } from './components/GraphCanvas';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import coursesData from './data/courses.json';
import tracksData from './data/tracks.json';

export function App() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <div className="w-[70%]">
          <GraphCanvas courses={coursesData} />
        </div>
        <div className="w-[30%] border-l">
          <Sidebar tracks={tracksData} />
        </div>
      </main>
    </div>
  );
}
```

#### `main.tsx`
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### `index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom global styles if needed */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| React Components | PascalCase.tsx | `GraphCanvas.tsx` |
| Hooks | camelCase.ts (use prefix) | `useSelectionStore.ts` |
| Utils | camelCase.ts | `graphAlgorithms.ts` |
| Types | index.ts (barrel) | `types/index.ts` |
| Data | kebab-case.json | `courses.json` |
| Config | kebab-case.ext | `vite.config.ts` |

---

## Import Order Convention

```typescript
// 1. React/External libraries
import { useState, useEffect } from 'react';
import * as d3 from 'd3';

// 2. Internal modules (absolute paths)
import { useSelectionStore } from '@/store/useSelectionStore';
import { findAffectedCourses } from '@/utils/graphAlgorithms';

// 3. Types
import type { Course, TrackStatus } from '@/types';

// 4. Assets/Data
import coursesData from '@/data/courses.json';

// 5. Styles (if any)
import './GraphCanvas.css';
```

---

## Growth Path

随着功能增加，可能的结构扩展：

```
src/
├── features/                  # Feature-based organization
│   ├── graph/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   └── tracks/
│       ├── components/
│       ├── hooks/
│       └── utils/
├── shared/                    # Shared across features
│   ├── components/
│   ├── hooks/
│   └── utils/
└── ...
```

当前扁平结构适合MVP，功能扩展后再重构为feature-based。
