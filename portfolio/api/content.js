// Vercel serverless function: GET = read content, POST = save content (password protected).
import { Redis } from '@upstash/redis'

const KEY = 'portfolio:content'

const redis = () =>
  new Redis({
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
  })

const valid = (d) =>
  d && typeof d === 'object' &&
  d.profile && typeof d.profile === 'object' &&
  Array.isArray(d.skills) && Array.isArray(d.projects) &&
  JSON.stringify(d).length < 200000

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = await redis().get(KEY)
      res.setHeader('Cache-Control', 's-maxage=10')
      return res.status(200).json({ data: data ?? null })
    }

    if (req.method === 'POST') {
      const secret = process.env.ADMIN_PASSWORD
      if (!secret) return res.status(500).json({ error: 'ADMIN_PASSWORD is not set in the Vercel environment variables.' })

      const { password, data } = req.body || {}
      if (password !== secret) {
        await new Promise((r) => setTimeout(r, 600)) // slow down guessing
        return res.status(401).json({ error: 'Wrong password.' })
      }
      if (data === undefined) return res.status(200).json({ ok: true }) // login check only
      if (!valid(data)) return res.status(400).json({ error: 'Invalid or too large data.' })

      await redis().set(KEY, data)
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed.' })
  } catch (e) {
    return res.status(500).json({ error: 'Storage error: ' + e.message + ' (is the Redis database connected to this project?)' })
  }
}
