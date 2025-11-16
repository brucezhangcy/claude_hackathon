# Story 5: Track状态显示

## User Story
作为学生，我想在侧边栏看到各个专业track的完成状态，以便了解我的课程选择是否满足特定track的毕业要求。

## Background
侧边栏显示2-3个track（如AI, Systems, Software Engineering），每个track有必修课程列表。当用户标记某课程为"不选"时，系统检查该课程（或其受影响的下游课程）是否在某track的必修列表中，并更新track状态。

## Acceptance Criteria
- [x] 创建 `src/components/TrackStatus.jsx` 组件
- [x] 页面右侧（约30%宽度）显示侧边栏
- [x] 从tracks.json加载track数据
- [x] 每个track显示：
  - Track名称（如 "AI Track"）
  - 状态标识：Complete ✓ 或 Incomplete ✗
  - 必修课程列表
  - 每门必修课状态（可选/不可选）
- [x] 实时响应课程标记变化：
  - 用户标记课程后立即更新
  - 检查excluded和affected课程
  - 如果任何必修课程被标记或受影响，track变为Incomplete
- [x] 视觉设计：
  - Complete track：绿色标识
  - Incomplete track：红色标识，列出缺失课程
- [x] 清晰展示哪门必修课导致track incomplete
- [x] 响应式布局，侧边栏不遮挡DAG

## Component Structure
```jsx
<TrackStatus>
  <TrackCard name="AI Track" status="incomplete">
    <CourseItem code="CSCI360" status="available" />
    <CourseItem code="CSCI467" status="affected" /> {/* 红色高亮 */}
    <CourseItem code="CSCI561" status="available" />
  </TrackCard>
  <TrackCard name="Systems Track" status="complete">
    ...
  </TrackCard>
</TrackStatus>
```

## State Management
```javascript
// App.jsx 需要管理的状态
const [excludedCourses, setExcludedCourses] = useState(new Set());
const [affectedCourses, setAffectedCourses] = useState(new Set());

// 传递给TrackStatus组件计算track状态
function isTrackComplete(track) {
  return track.requiredCourses.every(courseId =>
    !excludedCourses.has(courseId) && !affectedCourses.has(courseId)
  );
}
```

## Layout
```
+---------------------------+-------------+
|                           |   Track     |
|      Course DAG           |   Status    |
|       (70%)               |   (30%)     |
|                           |             |
+---------------------------+-------------+
```

## Visual Requirements
- 侧边栏固定在右侧
- 每个track用卡片形式展示
- 使用图标或颜色编码状态
- 滚动支持（如果track较多）

## Dependencies
Story 4 完成

## Estimated Time
1小时

---

## Dev Agent Record

### Status
Ready for Review

### Agent Model Used
Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### File List
- `app/src/components/TrackStatus.tsx` - Track completion status sidebar
- `app/src/App.css` - 70/30 flexbox layout with responsive design
- `app/src/App.tsx` - Integration of TrackStatus with main app

### Completion Notes
- Created TrackStatus component with card-based layout for each track
- Real-time status calculation based on excluded and affected courses
- Green border and checkmark for complete tracks
- Red border, X mark, and strike-through for incomplete tracks
- Lists all required courses with availability status
- Shows which specific courses are missing
- Responsive layout: stacks vertically on mobile (< 768px)
- 70/30 split maintained on desktop
- Footer with color legend for node states

### Change Log
- 2024-11-16: Track status sidebar with real-time completion tracking
