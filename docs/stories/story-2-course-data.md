# Story 2: 课程数据准备

## User Story
作为开发者，我需要准备USC CS课程的prerequisite数据结构，以便DAG能正确渲染课程依赖关系。

## Background
数据是整个系统的核心。需要定义清晰的JSON schema来表示：
- 课程信息
- Prerequisite关系
- Track要求

## Acceptance Criteria
- [x] 创建 `src/data/courses.json` 文件
- [x] 包含至少15-20门核心CS课程（覆盖本科主要课程）
- [x] 每门课程包含：
  - `id`: 课程代码（如 "CSCI104"）
  - `name`: 课程名称（如 "Data Structures"）
  - `prerequisites`: 先修课程ID数组
- [x] 创建 `src/data/tracks.json` 文件
- [x] 包含2-3个track（如 AI, Systems, Software Engineering）
- [x] 每个track定义：
  - `id`: track标识
  - `name`: track名称
  - `requiredCourses`: 必修课程ID数组
- [x] 数据准确反映USC CS实际课程要求
- [x] 导出数据供组件使用

## Sample Data Structure
```json
// courses.json
{
  "courses": [
    {
      "id": "CSCI104",
      "name": "Data Structures and Object Oriented Design",
      "prerequisites": ["CSCI103"]
    }
  ]
}

// tracks.json
{
  "tracks": [
    {
      "id": "ai",
      "name": "Artificial Intelligence",
      "requiredCourses": ["CSCI360", "CSCI467", "CSCI561"]
    }
  ]
}
```

## Key Courses to Include
- CSCI103 (Intro to Programming)
- CSCI104 (Data Structures)
- CSCI170 (Discrete Math)
- CSCI201 (Software Development)
- CSCI270 (Algorithms)
- CSCI310 (Software Engineering)
- CSCI350 (Operating Systems)
- CSCI353 (Networks)
- CSCI360 (AI)
- CSCI467 (Machine Learning)

## Dependencies
Story 1 完成

## Estimated Time
45分钟

---

## Dev Agent Record

### Status
Ready for Review

### Agent Model Used
Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### File List
- `app/src/data/courses.json` - 18 USC CS courses with prerequisite relationships
- `app/src/data/tracks.json` - 3 tracks (AI, Systems, Software Engineering)
- `app/src/data/index.ts` - TypeScript exports, interfaces, and helper functions
- `app/tsconfig.app.json` - Added resolveJsonModule support

### Completion Notes
- Created 18 core CS courses covering foundation to advanced levels
- Established realistic prerequisite chains (e.g., CSCI103 → CSCI104 → CSCI201 → CSCI310)
- Defined 3 tracks: AI (CSCI360, CSCI467, CSCI561), Systems (CSCI350, CSCI353, CSCI356), Software Engineering (CSCI310, CSCI401, CSCI571)
- TypeScript interfaces defined for Course and Track types
- Helper functions: getCourseById, getAllCourseIds, buildDependentsMap

### Change Log
- 2024-11-16: Course and track data created with export utilities
