import { useEffect, useRef, useState } from 'react'
import BlueButterfly from './components/BlueButterfly.jsx'
import './App.css'

const ACHIEVEMENTS = [
  {
    year: '2024',
    title: '设计系统',
    text: '把分散页面收成一套可复用的颜色、字体与组件。',
  },
  {
    year: '2025',
    title: '产品上线',
    text: '从一个模糊想法，做到别人可以打开的版本。',
  },
  {
    year: '2026',
    title: '开源组件',
    text: '把踩过的坑写成别人能直接接进项目的组件。',
  },
]

const STARS = Array.from({ length: 42 }, (_, index) => ({
  id: index,
  left: `${(index * 67) % 100}%`,
  top: `${(index * 41) % 100}%`,
  size: (index % 3) + 1,
  delay: `${(index % 7) * 0.45}s`,
  duration: `${2.8 + (index % 5) * 0.6}s`,
}))

function mulberry32(seed) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function useStageSize() {
  const [size, setSize] = useState(() => fitSize())

  useEffect(() => {
    const onResize = () => setSize(fitSize())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return size
}

function fitSize() {
  if (typeof window === 'undefined') return 500
  return Math.round(Math.min(1080, Math.max(340, window.innerWidth - 48)))
}

function Nebula({ phase, origin }) {
  const canvasRef = useRef(null)
  const phaseRef = useRef(phase)
  const originRef = useRef(origin)
  phaseRef.current = phase
  originRef.current = origin
  const shown = phase !== 'idle'

  useEffect(() => {
    if (!shown) return undefined
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const rand = mulberry32(20261027)
    const stars = Array.from({ length: 280 }, () => ({
      angle: rand() * Math.PI * 2,
      dist: 0.04 + rand() ** 0.65 * 0.72,
      size: 0.4 + rand() * 2.1,
      tw: rand() * Math.PI * 2,
      speed: 0.35 + rand() * 0.9,
      violet: rand() > 0.78,
    }))
    const clouds = [
      { x: 0.2, y: 0.28, r: 0.42, color: '96, 72, 196', drift: 0.7 },
      { x: 0.74, y: 0.56, r: 0.48, color: '28, 92, 196', drift: 1.1 },
      { x: 0.48, y: 0.74, r: 0.34, color: '132, 64, 168', drift: 0.5 },
      { x: 0.52, y: 0.4, r: 0.24, color: '186, 220, 255', drift: 0.9 },
    ]
    let frame = 0
    let leaveAt = 0
    const started = performance.now()

    const paint = (now) => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (!width || !height) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const pixelWidth = Math.round(width * dpr)
      const pixelHeight = Math.round(height * dpr)
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth
        canvas.height = pixelHeight
      }
      if (phaseRef.current === 'leaving' && !leaveAt) leaveAt = now
      const time = (now - started) / 1000
      const leaveT = leaveAt ? Math.min(1, (now - leaveAt) / (reduce ? 1 : 1400)) : 0
      const reveal = phaseRef.current === 'leaving'
        ? 1 - leaveT
        : (reduce ? 1 : Math.min(1, time / 0.9))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'lighter'
      clouds.forEach((cloud) => {
        const drift = reduce ? 0 : Math.sin(time * 0.18 * cloud.drift) * 26
        const cx = cloud.x * width + drift
        const cy = cloud.y * height + Math.cos(time * 0.14 * cloud.drift) * 16
        const radius = cloud.r * Math.max(width, height)
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
        glow.addColorStop(0, `rgba(${cloud.color}, ${0.2 * reveal})`)
        glow.addColorStop(0.45, `rgba(${cloud.color}, ${0.08 * reveal})`)
        glow.addColorStop(1, `rgba(${cloud.color}, 0)`)
        ctx.globalAlpha = 1
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.fill()
      })
      const ox = originRef.current.x * width
      const oy = originRef.current.y * height
      stars.forEach((star) => {
        const fly = leaveAt
          ? 1 - leaveT
          : (reduce ? 1 : 1 - Math.exp(-time * star.speed))
        const reach = Math.max(width, height) * star.dist * fly
        const x = ox + Math.cos(star.angle) * reach
        const y = oy + Math.sin(star.angle) * reach * 0.86
        const twinkle = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(time * 1.8 + star.tw))
        ctx.globalAlpha = reveal * (reduce ? 0.8 : twinkle)
        ctx.fillStyle = star.violet ? '#efe8ff' : '#f7fbff'
        ctx.beginPath()
        ctx.arc(x, y, star.size, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    if (reduce && phaseRef.current !== 'leaving') {
      paint(started + 4000)
      return undefined
    }
    const loop = (now) => {
      paint(now)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [shown])

  if (!shown) return null
  return <canvas ref={canvasRef} className="nebula-canvas" aria-hidden="true" />
}

export default function App() {
  const size = useStageSize()
  const spotRef = useRef(null)
  const leaveTimer = useRef(0)
  const [gatherToken, setGatherToken] = useState(0)
  const [phase, setPhase] = useState('idle')
  const [origin, setOrigin] = useState({ x: 0.5, y: 0.36 })

  useEffect(() => () => window.clearTimeout(leaveTimer.current), [])

  const openCosmos = () => {
    if (phase !== 'idle') return
    const rect = spotRef.current?.getBoundingClientRect()
    if (rect) {
      setOrigin({
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height * 0.46) / window.innerHeight,
      })
    }
    setPhase('cosmos')
  }

  const replay = () => {
    if (phase !== 'cosmos') return
    setPhase('leaving')
    setGatherToken((value) => value + 1)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.clearTimeout(leaveTimer.current)
    leaveTimer.current = window.setTimeout(() => setPhase('idle'), reduce ? 0 : 1500)
  }

  return (
    <main className={`stage ${phase === 'cosmos' ? 'cosmos' : ''} ${phase === 'leaving' ? 'leaving' : ''}`}>
      <div className="sky" />
      <Nebula phase={phase} origin={origin} />
      {STARS.map((star) => (
        <span
          key={star.id}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">作品集开场</p>
          <h1>成果在这里绽开</h1>
          <p className="lede">翅膀张开后，点击蝴蝶。</p>
        </div>
        <div className="butterfly-slot" ref={spotRef}>
          <BlueButterfly
            size={size}
            reactToPointer
            gatherToken={gatherToken}
            label="点击蝴蝶，展开个人成就"
            onBurst={openCosmos}
          />
        </div>

        {phase !== 'idle' && (
          <div className={`constellation ${phase === 'leaving' ? 'leaving' : ''}`}>
            {ACHIEVEMENTS.map((item) => (
              <article className="frame" key={item.title}>
                <span>{item.year}</span>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        )}

        <div className="actions">
          {phase === 'cosmos' && (
            <button type="button" onClick={replay}>
              回到蝴蝶
            </button>
          )}
        </div>

        {phase === 'idle' && (
          <pre className="usage">
            <code>{`<BlueButterfly
  size={780}
  reactToPointer
  onBurst={() => setCosmos(true)}
/>`}</code>
          </pre>
        )}
      </section>
    </main>
  )
}
