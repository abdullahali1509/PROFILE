import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { motion, useScroll, useSpring } from 'framer-motion'
import Background3D from './Background3D.jsx'
import DeskScene from './DeskScene.jsx'
import ProjectPage from './ProjectPage.jsx'
import Admin from './Admin.jsx'
import { useSite } from './store.jsx'
import { buildDesk } from './data.js'

function Hero({ profile }) {
  // The one orchestrated entrance: each word of the name rises letter by letter.
  let n = 0
  return (
    <section className="hero" id="top">
      <h1 aria-label={profile.name}>
        {profile.name.split(' ').map((word, w) => (
          <span className="word" key={w} aria-hidden="true">
            {[...word].map((ch, i) => (
              <motion.span
                key={i}
                initial={{ y: '110%', rotate: 8 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ delay: 0.15 + n++ * 0.09, duration: 0.8, ease: [0.2, 0.9, 0.2, 1] }}
              >
                {ch}
              </motion.span>
            ))}
          </span>
        ))}
      </h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>{profile.tagline}</motion.p>
      <motion.p className="role" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>{profile.role}</motion.p>
      <motion.p className="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>Scroll to move through the scene.</motion.p>
    </section>
  )
}

function About({ profile, skills }) {
  return (
    <section id="about" className="about">
      <h2>About me</h2>
      <div className="about-grid">
        <div>{profile.about.map((t, i) => <p key={i}>{t}</p>)}</div>
        <ul className="skill-list panel">{skills.map((s) => <li key={s}>{s}</li>)}</ul>
      </div>
    </section>
  )
}

function Projects({ projects }) {
  return (
    <section id="projects">
      <h2>Projects</h2>
      {projects.map((p) => (
        <Link className="project" to={`/project/${p.slug}`} key={p.slug}>
          <h3>{p.title}</h3>
          <p>{p.desc}</p>
          <div className="tags">{p.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
        </Link>
      ))}
    </section>
  )
}

function Desk({ content }) {
  const [active, setActive] = useState('monitor')
  const [lampOn, setLampOn] = useState(true)
  const info = buildDesk(content)[active]
  return (
    <section id="desk">
      <h2>My desk</h2>
      <div className="desk-wrap">
        <div className="desk-canvas">
          <DeskScene active={active} onSelect={setActive} lampOn={lampOn} onLamp={() => setLampOn((v) => !v)} />
        </div>
        <motion.div className="desk-info panel" key={active} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}>
          <h3>{info.title}</h3>
          <p>{info.text}</p>
          {info.href && <a className="btn" href={info.href}>{info.cta}</a>}
          <p style={{ opacity: 0.65, fontSize: '.9rem' }}>Drag sideways to look around. Tap the monitor, books, mug or lamp.</p>
        </motion.div>
      </div>
    </section>
  )
}

function Contact({ profile }) {
  return (
    <section id="contact" className="contact">
      <h2>Let's work together</h2>
      <a className="mail" href={`mailto:${profile.email}`}>{profile.email}</a>
      <ul>{profile.links.map((l) => <li key={l.label}><a href={l.url} target="_blank" rel="noreferrer">{l.label}</a></li>)}</ul>
    </section>
  )
}

function Home({ content }) {
  return (
    <>
      <Hero profile={content.profile} />
      <About profile={content.profile} skills={content.skills} />
      <Projects projects={content.projects} />
      <Desk content={content} />
      <Contact profile={content.profile} />
    </>
  )
}

export default function App() {
  const { content, ready } = useSite()
  const { pathname, hash } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  // Scroll to the #section, or to the top on a new page.
  useEffect(() => {
    if (!ready) return
    if (hash) {
      try { document.querySelector(hash)?.scrollIntoView() } catch {}
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [pathname, hash, ready])

  useEffect(() => {
    if (ready && pathname === '/') document.title = `${content.profile.name} | Portfolio`
  }, [ready, pathname, content])

  if (isAdmin) return ready ? <Admin /> : null

  const initials = ready ? content.profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2) : ''
  return (
    <>
      <Background3D />
      <motion.div className="progress" style={{ scaleX }} />
      {ready && (
        <nav>
          <Link className="logo" to="/#top"><span className="full">{content.profile.name}</span><span className="short">{initials}</span></Link>
          <ul>
            <li><Link to="/#about">About</Link></li>
            <li><Link to="/#projects">Projects</Link></li>
            <li><Link to="/#desk">Desk</Link></li>
            <li><Link to="/#contact">Contact</Link></li>
          </ul>
        </nav>
      )}
      <main>
        {!ready ? (
          <section className="hero"><p>Loading…</p></section>
        ) : (
          <Routes>
            <Route path="/" element={<Home content={content} />} />
            <Route path="/project/:slug" element={<ProjectPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
      <footer>Built with React, Three.js and Framer Motion</footer>
    </>
  )
}
