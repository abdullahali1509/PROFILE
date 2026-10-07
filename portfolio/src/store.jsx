import { createContext, useContext, useEffect, useState } from 'react'
import { defaults, blankProject } from './data.js'

const Ctx = createContext(null)
export const useSite = () => useContext(Ctx)

// Fills any missing field with a default so the site never breaks on partial data.
export function mergeContent(d) {
  const x = d || {}
  return {
    profile: { ...defaults.profile, ...x.profile },
    skills: x.skills || defaults.skills,
    projects: (x.projects || defaults.projects).map((p) => ({ ...blankProject, ...p, tags: p.tags || [] })),
    desk: { ...defaults.desk, ...x.desk },
  }
}

export function SiteProvider({ children }) {
  const [content, setContent] = useState(null)

  useEffect(() => {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 4000)
    ;(async () => {
      let data = null
      try {
        const r = await fetch('/api/content', { signal: ctrl.signal })
        if (r.ok) data = (await r.json()).data
      } catch {}
      if (!data && import.meta.env.DEV) {
        try { data = JSON.parse(localStorage.getItem('portfolio-content')) } catch {}
      }
      clearTimeout(timer)
      setContent(mergeContent(data))
    })()
    return () => { clearTimeout(timer); ctrl.abort() }
  }, [])

  return (
    <Ctx.Provider value={{ content, ready: !!content, setContent: (c) => setContent(mergeContent(c)) }}>
      {children}
    </Ctx.Provider>
  )
}
