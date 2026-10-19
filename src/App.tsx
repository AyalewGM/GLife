import { useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Atom, BookOpen, Dna, ExternalLink, Infinity as InfinityIcon, Menu, Play, Sparkles, X } from 'lucide-react'

type Lab = 'home' | 'life' | 'mandelbrot'
const base = import.meta.env.BASE_URL

const experiments = [
  { id: 'life' as const, number: '01', category: 'CELLULAR AUTOMATA', short: 'Emergence & patterns', name: "Conway's Game of Life", description: 'A universe built from four simple rules. Draw your starting pattern, press play, and watch complexity emerge.', image: base + 'img/gif2.gif', url: base + 'GL/index.html', label: 'Launch simulation' },
  { id: 'mandelbrot' as const, number: '02', category: 'FRACTAL GEOMETRY', short: 'Infinity & iteration', name: 'The Mandelbrot Set', description: 'Find infinite detail hidden inside a single equation. Zoom in, change the settings, and lose yourself in fractal geometry.', image: base + 'img/800px-Mandel_zoom_00_mandelbrot_set.jpg', url: base + 'Manibrot/index.html', label: 'Explore fractals' }
]

export default function App() {
  const [lab, setLab] = useState<Lab>('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const selected = experiments.find((item) => item.id === lab)
  function navigate(next: Lab) {
    setLab(next)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return <div className="app">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="topbar"><div className="layout topbar-content">
      <button className="wordmark" onClick={() => navigate('home')} aria-label="GLife home"><span className="mark"><Atom size={23} strokeWidth={2.2}/></span><span>g<span className="mint">life</span><small>THE INTERACTIVE MATH LAB</small></span></button>
      <nav className={menuOpen ? 'nav open' : 'nav'} aria-label="Primary navigation">
        <button className={lab === 'home' ? 'nav-active' : ''} onClick={() => navigate('home')}>Explore</button>
        <button className={lab === 'life' ? 'nav-active' : ''} onClick={() => navigate('life')}>Game of Life</button>
        <button className={lab === 'mandelbrot' ? 'nav-active' : ''} onClick={() => navigate('mandelbrot')}>Mandelbrot</button>
      </nav>
      <button className="mobile-menu" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
      <button className="header-cta" onClick={() => navigate('life')}>Launch lab <ArrowUpRight size={15}/></button>
    </div></header>
    <main id="main">
      {selected ? <>
        <section className="layout workspace-head"><button className="back" onClick={() => navigate('home')}><ArrowLeft size={16}/> All experiments</button><div className="workspace-titles"><div><span className="eyebrow">{selected.category} / INTERACTIVE STUDIO</span><h1>{selected.name}<span className="mint">.</span></h1><p>{selected.description}</p></div><button className="outline-btn" onClick={() => setReloadKey(k => k + 1)}>↻ Reset workspace</button></div></section>
        <section className="layout lab-layout" aria-label={selected.name + ' interactive simulator'}><div className="lab-toolbar"><span className="live-dot"/> LIVE EXPERIMENT <span className="toolbar-right">Use the controls inside the workspace</span></div><iframe key={selected.id + reloadKey} title={selected.name + ' interactive simulation'} src={selected.url} className="lab-frame" loading="eager"/></section>
        <section className="layout help-strip"><BookOpen size={19}/><p>{lab === 'life' ? 'Tip: Stop the simulation before selecting new cells. Use Next Step to observe each generation.' : 'Tip: Drag across the fractal to zoom in. Hold Shift while dragging to zoom out.'}</p><a href={selected.url} target="_blank" rel="noopener noreferrer">Open full screen <ExternalLink size={14}/></a></section>
      </> : <>
        <section className="layout hero"><div className="hero-content"><span className="eyebrow"><span className="live-dot"/> A PLAYGROUND FOR CURIOUS MINDS</span><h1>Mathematics<br/>you can <em>explore.</em></h1><p>Discover the beautiful systems hiding behind the world around us. Play with living patterns, dive into infinite fractals, and see equations come alive.</p><div className="hero-buttons"><button className="primary-btn" onClick={() => navigate('life')}><Play size={17} fill="currentColor"/> Start exploring <ArrowRight size={17}/></button><button className="outline-btn" onClick={() => document.getElementById('experiments')?.scrollIntoView({ behavior: 'smooth' })}>Browse experiments ↓</button></div><div className="hero-foot"><Sparkles size={16}/> No installs. Just curiosity.</div></div><div className="hero-media"><img src={experiments[1].image} alt="Detailed colorful Mandelbrot fractal"/><div className="media-label"><span className="live-dot"/> THE BEAUTY OF COMPLEXITY <InfinityIcon size={23}/></div></div></section>
        <div className="metric-wrap"><div className="layout metrics"><div><strong>02</strong><span>Interactive labs</span></div><div><strong>∞</strong><span>Ways to explore</span></div><div><strong><Dna size={30}/></strong><span>Learn by doing</span></div></div></div>
        <section className="layout labs-section" id="experiments"><div className="section-header"><div><span className="eyebrow">CHOOSE YOUR ADVENTURE</span><h2>Explore the experiments<span className="mint">.</span></h2></div><p>Hands-on mathematical discovery. Pick an experiment and start playing.</p></div><div className="cards">{experiments.map(experiment => <article key={experiment.id} className="experiment"><button className="card-media" onClick={() => navigate(experiment.id)} aria-label={'Launch ' + experiment.name}><img src={experiment.image} alt={experiment.name + ' visualization'}/><span className="media-chip">{experiment.number} / {experiment.category}</span></button><div className="card-body"><span className="card-tag">{experiment.short.toUpperCase()}</span><h3>{experiment.name}</h3><p>{experiment.description}</p><button className="card-action" onClick={() => navigate(experiment.id)}>{experiment.label} <ArrowUpRight size={18}/></button></div></article>)}</div></section>
        <section className="mission-wrap"><div className="layout mission"><div><span className="eyebrow">THE IDEA BEHIND GLIFE</span><h2>Serious mathematics.<br/><em>Playful discovery.</em></h2><p>GLife is an independent space for learning through exploration. It turns abstract mathematical ideas into interactive experiences that reward experimentation and curiosity.</p><button onClick={() => navigate('mandelbrot')} className="link-btn">See where curiosity takes you <ArrowRight size={17}/></button></div><div className="mission-list"><div><span>01</span> Experiment with simple rules</div><div><span>02</span> Discover unexpected patterns</div><div><span>03</span> Connect math, art, and nature</div><div><span>04</span> Learn by making and observing</div></div></div></section>
      </>}
    </main>
    <footer><div className="layout footer-content"><div className="footer-wordmark"><Atom size={20}/> glife <span>© {new Date().getFullYear()} · Created by Ayalew Mersha</span></div><span>Built for curiosity, powered by mathematics.</span></div></footer>
  </div>
}
