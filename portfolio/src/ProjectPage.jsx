import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSite } from './store.jsx'

export default function ProjectPage() {
  const { slug } = useParams()
  const { content } = useSite()
  const list = content.projects
  const i = list.findIndex((p) => p.slug === slug)
  const p = list[i]

  useEffect(() => {
    if (p) document.title = `${p.title} | ${content.profile.name}`
  }, [p, content.profile.name])

  if (!p) {
    return (
      <section className="project-page">
        <div className="sheet">
          <h1>Project not found</h1>
          <Link className="btn" to="/#projects">Back to projects</Link>
        </div>
      </section>
    )
  }

  const next = list[(i + 1) % list.length]
  return (
    <section className="project-page">
      <motion.article className="sheet" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Link className="back" to="/#projects">← All projects</Link>
        <h1>{p.title}</h1>
        <div className="meta">
          {p.year && <span>{p.year}</span>}
          {p.role && <span>{p.role}</span>}
        </div>
        {p.tags.length > 0 && <div className="tags" style={{ justifyContent: 'flex-start', marginBottom: '1.5rem' }}>{p.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>}
        <p className="lead">{p.desc}</p>
        {p.image && <img className="cover" src={p.image} alt={p.title} />}
        <div className="body">
          {p.details.split(/\n{2,}/).filter(Boolean).map((para, k) => <p key={k}>{para}</p>)}
        </div>
        {(p.link || p.repo) && (
          <div className="actions">
            {p.link && <a className="btn" href={p.link} target="_blank" rel="noreferrer">Live demo</a>}
            {p.repo && <a className="btn ghost" href={p.repo} target="_blank" rel="noreferrer">Source code</a>}
          </div>
        )}
        {next && next.slug !== p.slug && (
          <Link className="next" to={`/project/${next.slug}`}>
            <span>Next project</span>
            <h3>{next.title} →</h3>
          </Link>
        )}
      </motion.article>
    </section>
  )
}
