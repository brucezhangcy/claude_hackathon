# Technology Stack

## Core Technologies

### Frontend Framework: React 18+

**选择理由：**
- 组件化架构适合构建交互式UI
- Hooks API简化状态管理
- 大量生态系统支持
- TypeScript集成完善
- Virtual DOM优化渲染性能

**版本要求：** `^18.2.0`

---

### Build Tool: Vite

**选择理由：**
- 极快的冷启动（ESM-based）
- 即时热更新（HMR）
- 开箱即用的TypeScript支持
- 优化的生产构建（Rollup）
- 简单配置

**版本要求：** `^5.0.0`

**对比其他选项：**
| Tool | Pros | Cons |
|------|------|------|
| Vite | 快速，现代 | 较新 |
| CRA | 成熟，文档多 | 慢，配置复杂 |
| Next.js | SSR支持 | 过度设计，本项目不需要 |

---

### Language: TypeScript

**选择理由：**
- 静态类型检查，减少运行时错误
- IDE智能提示和自动补全
- 重构安全性
- 代码自文档化
- 适合复杂数据结构（Course, Track等）

**版本要求：** `^5.3.0`

**配置重点：**
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx"
  }
}
```

---

### Graph Visualization: D3.js + dagre-d3

**选择理由：**
- 完全控制SVG渲染
- dagre算法专门优化DAG布局
- 高度可定制节点样式
- 支持交互（zoom, pan, click）
- 性能优秀

**版本要求：**
- `d3`: `^7.8.5`
- `dagre-d3`: `^0.6.4`

**对比其他选项：**

| Library | Pros | Cons | 适用场景 |
|---------|------|------|----------|
| **D3.js + dagre** | 完全控制，性能好，DAG优化 | 学习曲线陡 | 自定义需求高 |
| vis.js | 开箱即用 | 定制受限 | 快速原型 |
| Cytoscape.js | 功能全面 | 体积大 | 复杂网络分析 |
| React Flow | React原生 | DAG布局弱 | 流程图 |

**为什么选D3：**
1. DAG（有向无环图）需要特定布局算法
2. dagre-d3专门解决这个问题
3. 需要自定义节点颜色、样式、交互
4. 未来可能需要复杂动画

---

### State Management: Zustand

**选择理由：**
- 极简API，学习成本低
- 无boilerplate（对比Redux）
- 性能优秀（自动选择性订阅）
- TypeScript支持好
- 体积小（~1KB）

**版本要求：** `^4.4.7`

**对比其他选项：**

| Solution | Pros | Cons |
|----------|------|------|
| **Zustand** | 简单，性能好，小体积 | 生态系统较小 |
| Redux Toolkit | 成熟，中间件丰富 | Boilerplate多 |
| Jotai | 原子化，细粒度 | 概念复杂 |
| React Context | 内置 | 性能问题，重渲染 |
| MobX | 响应式 | 学习曲线 |

**为什么选Zustand：**
1. 状态简单（只有excludedCourses）
2. 不需要复杂中间件
3. 快速开发MVP

---

### Styling: Tailwind CSS

**选择理由：**
- Utility-first，快速开发
- 无需切换文件写CSS
- 响应式设计简单
- 生产构建自动tree-shaking
- 高度可定制

**版本要求：** `^3.4.0`

**关键配置：**
```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        course: {
          normal: '#6B7280',
          excluded: '#374151',
          affected: '#EF4444',
        }
      }
    }
  }
}
```

---

## Development Tools

### Linting: ESLint

**配置：**
- `@typescript-eslint/recommended`
- `react-hooks/recommended`
- 自定义规则确保代码质量

### Formatting: Prettier

**配置：**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2
}
```

### Type Checking: TypeScript Compiler

```bash
npm run type-check  # tsc --noEmit
```

---

## Deployment

### Hosting Options

| Platform | Pros | Setup |
|----------|------|-------|
| **GitHub Pages** | 免费，简单 | `gh-pages` package |
| **Vercel** | 自动部署，CDN | 连接GitHub |
| **Netlify** | 类似Vercel | 拖拽部署 |

**推荐：GitHub Pages**
- 项目已在GitHub
- 纯静态，完美适配
- 免费

### CI/CD: GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**不支持：**
- IE (EOL)
- 旧版移动浏览器

---

## Performance Budget

| Metric | Target |
|--------|--------|
| Initial Load | < 2s |
| Bundle Size (gzipped) | < 200KB |
| Time to Interactive | < 3s |
| First Contentful Paint | < 1.5s |

**实现方式：**
- Vite tree-shaking
- 按需加载D3模块
- Tailwind purge unused CSS
- 图片优化（如有）

---

## Security Considerations

- 纯前端，无后端API
- 无用户数据存储
- 无认证需求
- CSP headers（部署时配置）
- 依赖定期更新（npm audit）

---

## Future Considerations

如果项目扩展，考虑：

1. **数据持久化** → LocalStorage / IndexedDB
2. **分享功能** → URL query params encoding
3. **测试** → Vitest + React Testing Library
4. **监控** → Sentry (free tier)
5. **分析** → Plausible (privacy-focused)
