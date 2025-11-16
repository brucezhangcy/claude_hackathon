# USC CS Course Impact Visualizer - Technical Architecture

## 1. System Overview

纯前端SPA应用，使用React构建，D3.js渲染DAG图，无后端依赖。

```
┌─────────────────────────────────────────────┐
│                  Browser                     │
├─────────────────────────────────────────────┤
│  React App                                   │
│  ├─ Components Layer                         │
│  ├─ State Management (React Context/Zustand)│
│  ├─ Graph Engine (D3.js)                    │
│  └─ Static Data (JSON)                      │
└─────────────────────────────────────────────┘
```

## 2. Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | React 18+ | Component-based, hooks for state |
| Build Tool | Vite | Fast dev server, optimized builds |
| Graph Rendering | D3.js | Full control over DAG layout |
| Styling | Tailwind CSS | Rapid UI development |
| State | Zustand | Lightweight, minimal boilerplate |
| Type Safety | TypeScript | Catch errors at compile time |

## 3. Data Model

### 3.1 Course Node
```typescript
interface Course {
  id: string;           // e.g., "CSCI104"
  code: string;         // e.g., "CSCI 104"
  name: string;         // e.g., "Data Structures"
  units: number;
  prerequisites: string[];  // Course IDs
  corequisites?: string[];
  description?: string;
}
```

### 3.2 Track Definition
```typescript
interface Track {
  id: string;
  name: string;           // e.g., "Artificial Intelligence"
  requiredCourses: string[];  // Must complete all
  electiveCourses: string[];  // Choose N from list
  electiveCount: number;      // Number of electives needed
}
```

### 3.3 User Selection State
```typescript
interface SelectionState {
  excludedCourses: Set<string>;  // Courses marked as "not taking"
  affectedCourses: Set<string>;  // Downstream courses impacted
}
```

## 4. Component Architecture

```
App
├─ Header
│   └─ Title / Instructions
├─ MainLayout
│   ├─ GraphCanvas (70% width)
│   │   ├─ D3 SVG Container
│   │   ├─ CourseNode (rendered by D3)
│   │   └─ EdgeLine (rendered by D3)
│   └─ Sidebar (30% width)
│       ├─ TrackStatus
│       │   └─ TrackCard (per track)
│       └─ Legend
└─ Footer
```

### 4.1 Key Components

**GraphCanvas**
- 渲染D3.js DAG图
- 处理用户点击事件
- 支持zoom/pan交互

**CourseNode**
- 显示课程代码和名称
- 三种状态：normal (灰) / excluded (深灰+删除线) / affected (红)
- 点击切换excluded状态

**TrackCard**
- 显示track名称
- 计算并显示completion percentage
- 列出缺失的必修课

## 5. Core Algorithms

### 5.1 Downstream Impact Calculation
```typescript
function findAffectedCourses(
  excludedCourses: Set<string>,
  courseGraph: Map<string, Course>
): Set<string> {
  const affected = new Set<string>();

  // Build reverse adjacency list (course -> courses that depend on it)
  const dependents = buildDependentsMap(courseGraph);

  // BFS from each excluded course
  for (const excluded of excludedCourses) {
    const queue = [excluded];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const dependent of dependents.get(current) || []) {
        if (!affected.has(dependent)) {
          affected.add(dependent);
          queue.push(dependent);
        }
      }
    }
  }

  return affected;
}
```

### 5.2 Track Completion Check
```typescript
function checkTrackCompletion(
  track: Track,
  excludedCourses: Set<string>,
  affectedCourses: Set<string>
): TrackStatus {
  const unavailable = new Set([...excludedCourses, ...affectedCourses]);

  const missingRequired = track.requiredCourses.filter(
    course => unavailable.has(course)
  );

  const availableElectives = track.electiveCourses.filter(
    course => !unavailable.has(course)
  );

  return {
    isComplete: missingRequired.length === 0 &&
                availableElectives.length >= track.electiveCount,
    missingRequired,
    availableElectiveCount: availableElectives.length,
    neededElectiveCount: track.electiveCount
  };
}
```

## 6. DAG Layout Strategy

使用D3的dagre布局算法：

```typescript
import * as d3 from 'd3';
import * as dagre from 'dagre-d3';

function layoutDAG(courses: Course[]): LayoutResult {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', ranksep: 50, nodesep: 30 });
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes
  courses.forEach(course => {
    g.setNode(course.id, {
      label: course.code,
      width: 120,
      height: 40
    });
  });

  // Add edges (prerequisites -> course)
  courses.forEach(course => {
    course.prerequisites.forEach(prereq => {
      g.setEdge(prereq, course.id);
    });
  });

  dagre.layout(g);
  return g;
}
```

## 7. State Management Flow

```
User clicks course
       ↓
Toggle in excludedCourses (Zustand store)
       ↓
Recalculate affectedCourses (derived state)
       ↓
React re-renders:
  - GraphCanvas updates node colors
  - TrackCards recalculate completion
```

## 8. Project Structure

```
src/
├─ components/
│   ├─ GraphCanvas.tsx
│   ├─ CourseNode.tsx
│   ├─ Sidebar.tsx
│   ├─ TrackCard.tsx
│   └─ Legend.tsx
├─ store/
│   └─ useSelectionStore.ts
├─ hooks/
│   ├─ useGraphLayout.ts
│   └─ useTrackStatus.ts
├─ utils/
│   ├─ graphAlgorithms.ts
│   └─ trackCalculations.ts
├─ data/
│   ├─ courses.json
│   └─ tracks.json
├─ types/
│   └─ index.ts
├─ App.tsx
└─ main.tsx
```

## 9. Performance Considerations

1. **Memoization**: 使用`useMemo`缓存DAG布局计算
2. **Debounced Updates**: 快速点击时debounce重计算
3. **Virtualization**: 如果课程数量大，考虑只渲染viewport内节点
4. **Web Workers**: 复杂图计算可移至worker thread

## 10. Data Preparation

课程数据需预先整理为JSON格式：

```json
// courses.json
[
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
    "prerequisites": []
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
    "electiveCourses": ["CSCI566", "CSCI567", "CSCI571"],
    "electiveCount": 2
  }
]
```

## 11. Deployment

- **Build**: `npm run build` 生成静态文件
- **Host**: GitHub Pages / Vercel / Netlify
- **CI/CD**: GitHub Actions自动部署

## 12. Future Extensibility

虽然MVP不包含，但架构支持未来扩展：
- LocalStorage持久化用户选择
- 导出/分享选课方案 (URL params)
- 多学期规划视图
- 课程搜索过滤
