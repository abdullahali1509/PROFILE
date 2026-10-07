import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSite, mergeContent } from './store.jsx'
import { defaults, blankProject, slugify } from './data.js'

// The form edits plain strings; these convert to and from the stored shape.
const toDraft = (c) => ({
  profile: { ...c.profile, about: c.profile.about.join('\n\n'), links: c.profile.links.map((l) => ({ ...l })) },
  skills: c.skills.join('\n'),
  projects: c.projects.map((p) => ({ ...p, tags: p.tags.join(', ') })),
  desk: { ...c.desk },
})

function fromDraft(d) {
  const used = new Set()
  return {
    profile: {
      ...d.profile,
      name: d.profile.name.trim() || 'Your Name',
      about: d.profile.about.split('\n\n').map((s) => s.trim()).filter(Boolean),
      links: d.profile.links.filter((l) => l.label.trim() && l.url.trim()),
    },
    skills: d.skills.split('\n').map((s) => s.trim()).filter(Boolean),
    projects: d.projects.map((p) => {
      const base = slugify(p.slug || p.title) || 'project'
      let slug = base, n = 2
      while (used.has(slug)) slug = `${base}-${n++}`
      used.add(slug)
      return { ...p, slug, title: p.title.trim(), tags: p.tags.split(',').map((t) => t.trim()).filter(Boolean) }
    }),
    desk: d.desk,
  }
}

const getp = (o, path) => path.split('.').reduce((a, k) => a?.[k], o)
const setp = (o, path, v) => {
  const ks = path.split('.'), last = ks.pop()
  ks.reduce((a, k) => a[k], o)[last] = v
}

async function api(body) {
  const r = await fetch('/api/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  let json = {}
  try { json = await r.json() } catch {}
  return { r, json }
}
// `npm run dev` has no /api, so saving falls back to this browser only.
const noApiInDev = (r) => import.meta.env.DEV && (r.status === 404 || r.status === 405)

function Login({ onOk }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setErr('')
    try {
      const { r, json } = await api({ password: pw })
      if (r.ok || noApiInDev(r)) { sessionStorage.setItem('admin-pw', pw); onOk(pw) }
      else setErr(json.error || 'Could not log in.')
    } catch { setErr('Network error. Try again.') }
    setBusy(false)
  }

  return (
    <form className="admin-login panel" onSubmit={submit}>
      <h2>Admin login</h2>
      <label className="field"><span>Password</span>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
      </label>
      {err && <p className="status">{err}</p>}
      <button className="btn" disabled={busy || !pw}>{busy ? 'Checking…' : 'Log in'}</button>
      <Link to="/">← Back to site</Link>
    </form>
  )
}

function Editor({ password, onLogout }) {
  const { content, setContent } = useSite()
  const [d, setD] = useState(() => toDraft(content))
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  const up = (fn) => setD((prev) => { const n = structuredClone(prev); fn(n); return n })
  const bind = (path) => ({
    value: getp(d, path) ?? '',
    onChange: (e) => { const v = e.target.value; up((n) => setp(n, path, v)) },
  })
  const Field = ({ label, path, area, ph }) => (
    <label className="field"><span>{label}</span>
      {area ? <textarea {...bind(path)} placeholder={ph} /> : <input {...bind(path)} placeholder={ph} />}
    </label>
  )

  const move = (i, dir) => up((n) => { const j = i + dir; [n.projects[i], n.projects[j]] = [n.projects[j], n.projects[i]] })

  async function save() {
    setBusy(true); setStatus('Saving…')
    const data = fromDraft(d)
    try {
      const { r, json } = await api({ password, data })
      if (r.status === 401) { onLogout(); return }
      if (noApiInDev(r)) {
        localStorage.setItem('portfolio-content', JSON.stringify(data))
        setContent(data); setD(toDraft(mergeContent(data)))
        setStatus('Saved in this browser only. Saving for everyone works once deployed on Vercel.')
      } else if (!r.ok) {
        setStatus(json.error || 'Save failed.')
      } else {
        setContent(data); setD(toDraft(mergeContent(data)))
        setStatus('Published. Visitors see the change within a few seconds.')
      }
    } catch { setStatus('Network error. Nothing was saved.') }
    setBusy(false)
  }

  return (
    <div className="admin">
      <header className="admin-bar">
        <strong>Admin</strong>
        <span className="status">{status}</span>
        <div className="bar-actions">
          <Link className="btn ghost" to="/">View site</Link>
          <button className="btn" onClick={save} disabled={busy}>Save and publish</button>
          <button className="btn ghost" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <div className="card panel">
        <h2>Profile</h2>
        <div className="row">
          <Field label="Name" path="profile.name" />
          <Field label="Role" path="profile.role" />
        </div>
        <Field label="Tagline" path="profile.tagline" />
        <Field label="About (leave a blank line between paragraphs)" path="profile.about" area />
        <Field label="Email" path="profile.email" />
        <h3>Links</h3>
        {d.profile.links.map((l, i) => (
          <div className="row link-row" key={i}>
            <Field label="Label" path={`profile.links.${i}.label`} />
            <Field label="URL" path={`profile.links.${i}.url`} />
            <button type="button" className="mini danger" onClick={() => up((n) => n.profile.links.splice(i, 1))}>Remove</button>
          </div>
        ))}
        <button type="button" className="mini" onClick={() => up((n) => n.profile.links.push({ label: '', url: '' }))}>Add link</button>
      </div>

      <div className="card panel">
        <h2>Skills</h2>
        <Field label="One skill per line" path="skills" area />
      </div>

      <div className="card panel">
        <h2>Projects</h2>
        {d.projects.map((p, i) => (
          <div className="proj-edit" key={i}>
            <div className="proj-head">
              <strong>{p.title || 'Untitled'}</strong>
              <div>
                <button type="button" className="mini" disabled={i === 0} onClick={() => move(i, -1)}>Up</button>{' '}
                <button type="button" className="mini" disabled={i === d.projects.length - 1} onClick={() => move(i, 1)}>Down</button>{' '}
                <button type="button" className="mini danger" onClick={() => confirm(`Delete "${p.title}"?`) && up((n) => n.projects.splice(i, 1))}>Delete</button>
              </div>
            </div>
            <Field label="Title" path={`projects.${i}.title`} />
            <Field label="Short description (shown in the list)" path={`projects.${i}.desc`} />
            <div className="row">
              <Field label="Year" path={`projects.${i}.year`} />
              <Field label="Your role" path={`projects.${i}.role`} />
            </div>
            <Field label="Tags (comma separated)" path={`projects.${i}.tags`} />
            <Field label="Full details (blank line between paragraphs)" path={`projects.${i}.details`} area />
            <Field label="Cover image URL (optional)" path={`projects.${i}.image`} ph="https://..." />
            <div className="row">
              <Field label="Live demo URL (optional)" path={`projects.${i}.link`} ph="https://..." />
              <Field label="Source code URL (optional)" path={`projects.${i}.repo`} ph="https://github.com/..." />
            </div>
            {p.slug && <small>Page address: /project/{p.slug}</small>}
          </div>
        ))}
        <button type="button" className="mini" onClick={() => up((n) => n.projects.push({ ...blankProject, tags: '' }))}>Add project</button>
      </div>

      <div className="card panel">
        <h2>Desk texts</h2>
        <Field label="Monitor text" path="desk.monitor" />
        <Field label="Lamp text" path="desk.lamp" />
        <small>The books show your skills and the mug uses your email automatically.</small>
      </div>

      <button type="button" className="mini danger" onClick={() => confirm('Load the original placeholder content? Nothing is saved until you press Save.') && setD(toDraft(defaults))}>
        Reset form to defaults
      </button>
    </div>
  )
}

export default function Admin() {
  const [pw, setPw] = useState(() => sessionStorage.getItem('admin-pw') || '')

  useEffect(() => {
    document.title = 'Admin'
    const m = document.createElement('meta')
    m.name = 'robots'; m.content = 'noindex'
    document.head.appendChild(m)
    return () => m.remove()
  }, [])

  if (!pw) return <Login onOk={setPw} />
  return <Editor password={pw} onLogout={() => { sessionStorage.removeItem('admin-pw'); setPw('') }} />
}
