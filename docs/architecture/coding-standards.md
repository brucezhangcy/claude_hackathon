# Coding Standards

## TypeScript

### 严格模式
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 命名规范

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `GraphCanvas.tsx` |
| Hooks | camelCase with `use` prefix | `useSelectionStore.ts` |
| Utils | camelCase | `graphAlgorithms.ts` |
| Types/Interfaces | PascalCase | `Course`, `TrackStatus` |
| Constants | UPPER_SNAKE_CASE | `MAX_ZOOM_LEVEL` |
| Variables | camelCase | `excludedCourses` |
| Files | kebab-case (except components) | `track-calculations.ts` |

### 类型定义

```typescript
// 优先使用 interface
interface Course {
  id: string;
  name: string;
}

// 联合类型用 type
type CourseStatus = 'normal' | 'excluded' | 'affected';

// 避免 any，使用 unknown 或具体类型
function processData(data: unknown): Course[] {
  // 类型守卫
  if (isCourseArray(data)) {
    return data;
  }
  throw new Error('Invalid data format');
}
```

### 函数规范

```typescript
// 单一职责，函数不超过50行
// 参数不超过3个，多了用对象
interface LayoutOptions {
  rankDirection: 'TB' | 'LR';
  nodeSeparation: number;
  rankSeparation: number;
}

function layoutDAG(courses: Course[], options: LayoutOptions): LayoutResult {
  // ...
}

// 纯函数优先
function calculateAffected(excluded: Set<string>, graph: CourseGraph): Set<string> {
  // 不修改输入参数
  const result = new Set<string>();
  // ...
  return result;
}
```

## React

### 组件结构

```typescript
// 1. Imports (external -> internal)
import { useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { useSelectionStore } from '../store/useSelectionStore';
import type { Course } from '../types';

// 2. Types
interface GraphCanvasProps {
  courses: Course[];
  width: number;
  height: number;
}

// 3. Component
export function GraphCanvas({ courses, width, height }: GraphCanvasProps) {
  // 3.1 Hooks (top of component)
  const { excludedCourses, toggleCourse } = useSelectionStore();

  // 3.2 Derived state with useMemo
  const affectedCourses = useMemo(
    () => calculateAffected(excludedCourses, courses),
    [excludedCourses, courses]
  );

  // 3.3 Effects
  useEffect(() => {
    // D3 rendering logic
  }, [courses, excludedCourses]);

  // 3.4 Event handlers
  const handleNodeClick = (courseId: string) => {
    toggleCourse(courseId);
  };

  // 3.5 Render
  return (
    <div className="graph-canvas">
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
}
```

### Hooks 规范

```typescript
// Custom hooks 提取可复用逻辑
export function useTrackStatus(track: Track) {
  const { excludedCourses, affectedCourses } = useSelectionStore();

  return useMemo(() => {
    const unavailable = new Set([...excludedCourses, ...affectedCourses]);
    // 计算逻辑
    return {
      isComplete,
      missingRequired,
      progress
    };
  }, [track, excludedCourses, affectedCourses]);
}
```

### 避免的模式

```typescript
// BAD: 内联对象导致重渲染
<Component style={{ margin: 10 }} />

// GOOD: 提取常量
const styles = { margin: 10 };
<Component style={styles} />

// BAD: 匿名函数在render中
<button onClick={() => handleClick(id)} />

// GOOD: useCallback 或提取
const handleButtonClick = useCallback(() => handleClick(id), [id]);
<button onClick={handleButtonClick} />

// BAD: 条件hook调用
if (condition) {
  useEffect(() => {});  // 错误!
}

// GOOD: hook内部条件判断
useEffect(() => {
  if (condition) {
    // logic
  }
}, [condition]);
```

## 状态管理 (Zustand)

```typescript
// store/useSelectionStore.ts
import { create } from 'zustand';

interface SelectionState {
  excludedCourses: Set<string>;
  toggleCourse: (id: string) => void;
  resetSelection: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  excludedCourses: new Set(),

  toggleCourse: (id) =>
    set((state) => {
      const newSet = new Set(state.excludedCourses);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { excludedCourses: newSet };
    }),

  resetSelection: () => set({ excludedCourses: new Set() }),
}));
```

## CSS / Tailwind

### 类名组织

```tsx
// 按功能分组，使用 clsx 或 classnames
import clsx from 'clsx';

<div
  className={clsx(
    // Layout
    'flex items-center justify-between',
    // Spacing
    'p-4 mb-2',
    // Visual
    'bg-white rounded-lg shadow',
    // State
    isActive && 'ring-2 ring-blue-500',
    isDisabled && 'opacity-50 cursor-not-allowed'
  )}
/>
```

### 颜色语义化

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      course: {
        normal: '#6B7280',
        excluded: '#374151',
        affected: '#EF4444',
      },
      track: {
        complete: '#10B981',
        incomplete: '#F59E0B',
      }
    }
  }
}
```

## Git Commit 规范

```
<type>(<scope>): <subject>

type: feat | fix | refactor | style | docs | test | chore
scope: component name or module
subject: 简短描述，不超过50字符

Examples:
feat(graph): add zoom and pan interaction
fix(track): correct elective count calculation
refactor(store): migrate to zustand
docs(readme): add setup instructions
```

## 代码质量工具

```json
// package.json
{
  "scripts": {
    "lint": "eslint src --ext ts,tsx",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "format": "prettier --write src/**/*.{ts,tsx}",
    "type-check": "tsc --noEmit"
  }
}
```

### ESLint 配置

```javascript
// .eslintrc.cjs
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
```

### Prettier 配置

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

## 测试规范

```typescript
// 文件命名: *.test.ts 或 *.spec.ts
// 测试描述清晰

describe('graphAlgorithms', () => {
  describe('findAffectedCourses', () => {
    it('should return empty set when no courses excluded', () => {
      const result = findAffectedCourses(new Set(), mockGraph);
      expect(result.size).toBe(0);
    });

    it('should find all downstream courses', () => {
      const excluded = new Set(['CSCI103']);
      const result = findAffectedCourses(excluded, mockGraph);
      expect(result).toContain('CSCI104');
      expect(result).toContain('CSCI201');
    });
  });
});
```
