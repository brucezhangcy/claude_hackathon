# Project Setup Guide

## Quick Start

```bash
# 创建React项目
npm create vite@latest usc-course-visualizer -- --template react-ts
cd usc-course-visualizer

# 安装依赖
npm install d3 @types/d3 dagre-d3 @types/dagre-d3
npm install zustand
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Package.json Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "d3": "^7.8.5",
    "dagre-d3": "^0.6.4",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/d3": "^7.4.3",
    "@types/dagre-d3": "^0.6.6",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0"
  }
}
```

## Tailwind Config

```javascript
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'course-normal': '#6B7280',
        'course-excluded': '#374151',
        'course-affected': '#EF4444',
      }
    }
  },
  plugins: []
}
```

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview build
```

## Next Steps

1. 创建`src/data/courses.json` - 爬取USC课程数据
2. 创建`src/data/tracks.json` - 定义CS tracks
3. 实现GraphCanvas组件
4. 集成Zustand状态管理
5. 添加TrackCard组件
