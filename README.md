# 蓝色蝴蝶

个人网站的成果开场。蝴蝶由蓝色光粒子聚成，从一道光里绽开。点击之后光点散成星云，再浮出个人成就。

这个目录是可预览的 Vite + React 18 示例。接到自己的网站时，不需要整包搬过去，按下面两种方式选一种。

## 本地预览

```bash
npm install
npm run dev
```

浏览器打开 http://127.0.0.1:5173

翅膀张开后点击蝴蝶。星云里点「回到蝴蝶」，光点会收回来，不是刷新页面。

## 今晚接到自己的项目

项目需要 React 18。组件本身没有额外依赖，Vite 或 Create React App 都可以。

### 只接蝴蝶

复制这两个文件：

- `src/components/BlueButterfly.jsx`
- `src/components/BlueButterfly.css`

```jsx
import { useState } from 'react'
import BlueButterfly from './components/BlueButterfly.jsx'

export function WorksIntro() {
  const [open, setOpen] = useState(false)
  const [gatherToken, setGatherToken] = useState(0)

  return (
    <section>
      <BlueButterfly
        size={780}
        bloomWhenVisible
        reactToPointer
        onBurst={() => setOpen(true)}
        gatherToken={gatherToken}
      />
      {open && (
        <button type="button" onClick={() => setGatherToken((value) => value + 1)}>
          回到蝴蝶
        </button>
      )}
    </section>
  )
}
```

`onBurst` 在点击后触发。你在这里把自己的成就框显示出来。`gatherToken` 每加 1，蝴蝶从散开状态慢慢聚回去。

### 连同星云和成就框

示例页把星云、成就文案和「回到蝴蝶」放在 `src/App.jsx`，样式在 `src/App.css`。成就文案在 `ACHIEVEMENTS` 数组里，换成你自己的年份、标题和一句说明即可。

星云画在页面上，不在蝴蝶组件里。要整段效果时，对照 `App.jsx` 里的 `Nebula`、`phase`（`idle` / `cosmos` / `leaving`）和 `App.css` 里的 `.constellation`、`.frame`。

## 组件参数

| 参数 | 默认 | 作用 |
| --- | --- | --- |
| `size` | `780` | 宽度（像素），高度按 640:520 缩放 |
| `autoBloom` | `true` | 挂载后立即绽放 |
| `bloomWhenVisible` | `false` | 进入视口才绽放 |
| `replayToken` | `0` | 数字变化时整段重新绽放 |
| `reactToPointer` | `false` | 跟随指针轻微偏转 |
| `showParticles` | `true` | 周围漂浮的光点 |
| `decorative` | `false` | 纯装饰，不响应点击 |
| `label` | `蓝色蝴蝶绽放` | 按钮的无障碍名称 |
| `className` | `''` | 额外类名 |
| `onBloomEnd` | — | 翅膀完全打开后回调 |
| `onBurst` | — | 点击爆开后回调，用来打开成就 |
| `gatherToken` | `0` | 数字增加时，光点慢慢收回 |

系统开启「减少动态效果」时，蝴蝶直接呈现打开状态，收回也没有过渡。
