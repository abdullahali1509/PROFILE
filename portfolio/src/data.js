// Default content. Once you save from /admin, the saved version replaces this.
export const defaults = {
  profile: {
    name: 'Abdullah Ali',
    role: 'Computer Science student',
    tagline: 'I build games, mobile apps and web experiences.',
    about: [
      'I am a computer science student who likes turning ideas into things you can click, play and ship.',
      'I enjoy the whole path from design and architecture to testing and deployment.',
    ],
    email: 'you@example.com',
    links: [
      { label: 'GitHub', url: 'https://github.com/' },
      { label: 'LinkedIn', url: 'https://linkedin.com/' },
    ],
  },
  skills: [
    'JavaScript / TypeScript',
    'React and Three.js',
    'Game development',
    'Mobile apps',
    'Machine learning basics',
    'Software design and testing',
  ],
  projects: [
    {
      slug: 'project-one', title: 'Project One', year: '2026', role: 'Developer',
      desc: 'One sentence on what it does and why it matters.',
      details: 'Describe the problem this project solves.\n\nExplain how you built it, what you learned and what you would do next.',
      tags: ['React', 'Node'], link: '', repo: '', image: '',
    },
    {
      slug: 'project-two', title: 'Project Two', year: '2026', role: 'Developer',
      desc: 'One sentence on what it does and why it matters.',
      details: 'Describe the problem this project solves.\n\nExplain how you built it, what you learned and what you would do next.',
      tags: ['Unity', 'C#'], link: '', repo: '', image: '',
    },
    {
      slug: 'project-three', title: 'Project Three', year: '2026', role: 'Developer',
      desc: 'One sentence on what it does and why it matters.',
      details: 'Describe the problem this project solves.\n\nExplain how you built it, what you learned and what you would do next.',
      tags: ['Flutter', 'Firebase'], link: '', repo: '', image: '',
    },
  ],
  desk: {
    monitor: 'Open the work section for everything I have built.',
    lamp: 'Click it again to switch the light on or off.',
  },
}

export const blankProject = {
  slug: '', title: 'New project', year: '', role: '', desc: '', details: '',
  tags: [], link: '', repo: '', image: '',
}

export const slugify = (s) =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// Text shown beside the 3D desk when an object is clicked
export function buildDesk(c) {
  return {
    monitor: { title: 'Projects', text: c.desk.monitor, href: '#projects', cta: 'Go to projects' },
    books: { title: 'Skills', text: c.skills.join(', ') + '.' },
    mug: { title: 'Say hello', text: 'The best way to reach me is email.', href: `mailto:${c.profile.email}`, cta: 'Send an email' },
    lamp: { title: 'Lamp', text: c.desk.lamp },
  }
}
