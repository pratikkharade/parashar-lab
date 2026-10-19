import { useEffect, useMemo, useState } from 'react'
import './App.css'
import './modal.css'
import './shell.css'
import './publications.css'
import './hero-photo.css'
import './projects.css'
import './mission-vision.css'
import './responsive.css'

const files = import.meta.glob('../content/**/*.md', { eager: true, query: '?raw', import: 'default' })
const parse = (raw, path) => {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  const meta = {}
  ;(match?.[1] || '').split('\n').forEach((line) => { const i = line.indexOf(':'); if (i > -1) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"|"$/g, '') })
  const pathParts = path.split('/')
  const contentFolder = pathParts.lastIndexOf('content')
  const pageFolder = pathParts[contentFolder + 1]
  return { ...meta, body: (match?.[2] || '').trim(), slug: pathParts.at(-1).replace('.md', ''), type: pageFolder.endsWith('.md') ? 'site' : pageFolder }
}
const records = Object.entries(files).map(([path, raw]) => parse(raw, path))
const collection = (page, contentType) => records.filter((item) => item.type === page && (contentType ? item.content_type === contentType : !item.content_type))
const initials = (name) => name.replace(/Prof\.|Dr\./g, '').split(' ').filter(Boolean).map((word) => word[0]).join('').slice(0, 2)
const routes = new Set(['home', 'projects', 'publications', 'team', 'contact', 'news'])
const pageFromLocation = () => {
  const queryPage = new URLSearchParams(location.search).get('page')
  if (routes.has(queryPage)) return queryPage
  const lastPathPart = location.pathname.split('/').filter(Boolean).at(-1)
  return routes.has(lastPathPart) ? lastPathPart : 'home'
}
const pathForPage = (page) => {
  const parts = location.pathname.split('/').filter(Boolean)
  const baseParts = routes.has(parts.at(-1)) ? parts.slice(0, -1) : parts
  return `/${[...baseParts, page].join('/')}`
}
function Title({ eyebrow, children }) { return <div className="title">{eyebrow && <span>{eyebrow}</span>}<h2>{children}</h2></div> }
function ProfileImage({ person, className = '' }) { return person.photo ? <img className={`profile-image ${className}`} src={person.photo} alt={person.name} /> : <div className={`avatar ${className}`}>{initials(person.name)}</div> }
function Person({ person, onSelect }) { return <button className="person" onClick={() => onSelect(person)}><ProfileImage person={person}/><h3>{person.name}</h3><p className="role">{person.role}</p><p>{person.interests}</p></button> }
function Project({ project, settings, detail = false }) { return <article className={`project ${detail ? 'project-detail' : ''}`}><div><p className="meta">{project.area}</p><h3>{project.title}</h3><p>{project.summary}</p>{project.link && <a className="project-link" href={project.link} target="_blank" rel="noreferrer">{project.link}</a>}</div>{detail && <aside><b>{settings.leadPeopleLabel}</b><p>{project.leads}</p><b>{settings.collaboratorsLabel}</b><p>{project.collaborators}</p></aside>}</article> }
function NewsCard({ item, settings }) { return <article className="news-card"><p className="meta">{item.date} {settings.metadataSeparator} {item.category}</p><h3>{item.title}</h3><p>{item.excerpt}</p></article> }
function Areas({ areas, description }) { return <div className="three">{areas.map((a) => <article key={a.slug}><small>{a.index}</small><h3>{a.title}</h3><p>{a[description]}</p></article>)}</div> }
function ProfileLinks({ person, settings }) {
  const configured = (value) => value && value !== 'null'
  const links = [
    { label: settings.emailLabel, href: configured(person.email) ? `mailto:${person.email}` : null, external: false },
    { label: settings.linkedinLabel, href: configured(person.linkedin) ? person.linkedin : null, external: true },
    { label: settings.githubLabel, href: configured(person.github) ? person.github : null, external: true },
    { label: settings.homepageLabel, href: configured(person.homepage) ? person.homepage : null, external: true },
  ].filter((link) => link.href)

  if (!links.length) return null

  return <div className="profile-links">{links.map((link, index) => <span key={link.label}>{index > 0 && <span className="profile-link-separator"> {settings.profileLinkSeparator} </span>}<a href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined}>{link.label}</a></span>)}</div>
}

function Home({ settings, areas, news, go }) { return <><section className="hero"><div><p className="eyebrow">{settings.homeEyebrow}</p><h1>{settings.homeTitle}</h1><p className="lead">{settings.homeLead}</p><button className="primary" onClick={() => go('projects')}>{settings.researchButton}</button></div><div className="hero-photo"><img src={settings.heroImage} alt={settings.heroImageAlt}/></div></section><section className="mission-vision"><Title eyebrow={settings.missionVisionEyebrow}>{settings.missionVisionTitle}</Title><div className="mission-vision-grid"><article><p className="eyebrow">{settings.missionLabel}</p><p>{settings.missionText}</p></article><article><p className="eyebrow">{settings.visionLabel}</p><p>{settings.visionText}</p></article></div></section><section className="areas"><Title eyebrow={settings.researchAreasEyebrow}>{settings.researchAreasTitle}</Title><Areas areas={areas} description="homeDescription" /></section><section className="section latest"><div className="heading"><Title eyebrow={settings.latestNewsEyebrow}>{settings.latestNewsTitle}</Title><button className="text" onClick={() => go('news')}>{settings.allNewsLabel}</button></div><div className="news-grid">{news.slice(0, 3).map((n) => <NewsCard item={n} settings={settings} key={n.slug}/>)}</div></section><section className="callout"><div><p className="eyebrow">{settings.collaborationEyebrow}</p><h2>{settings.collaborationTitle}</h2><p>{settings.collaborationText}</p></div><button className="primary" onClick={() => go('contact')}>{settings.contactLabLabel}</button></section></> }
function People({ settings, people }) {
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const openProfile = (person) => {
    setSelectedPerson(person)
    requestAnimationFrame(() => setProfileOpen(true))
  }
  const closeProfile = () => {
    setProfileOpen(false)
    setTimeout(() => setSelectedPerson(null), 220)
  }
  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === 'Escape') closeProfile() }
    addEventListener('keydown', closeOnEscape)
    return () => removeEventListener('keydown', closeOnEscape)
  }, [])
  const categories = [...new Map(people.filter((person) => person.category).map((person) => [person.category, Number(person.category_index) || Number.MAX_SAFE_INTEGER])).entries()]
    .sort(([firstCategory, firstIndex], [secondCategory, secondIndex]) => firstIndex - secondIndex || firstCategory.localeCompare(secondCategory))
    .map(([category]) => category)
  return <div className="page"><p className="eyebrow">{settings.peopleEyebrow}</p><h1>{settings.peopleTitle}</h1><p className="lead narrow">{settings.peopleLead}</p>{categories.map((category) => {
    const list = people.filter((person) => person.category === category).sort((a, b) => Number(a.index) - Number(b.index))
    const featuredProfiles = list.filter((person) => person.featured === 'true')
    const gridProfiles = list.filter((person) => person.featured !== 'true')
    return <section className="people-section" key={category}><Title>{category}</Title>{featuredProfiles.map((person) => <button type="button" className="director" onClick={() => openProfile(person)} aria-label={person.name} key={person.slug}><ProfileImage person={person} className="large"/><div><h2>{person.name}</h2><p className="role">{person.role}</p><p>{person.description}</p></div></button>)}{gridProfiles.length > 0 && <div className="people-grid">{gridProfiles.map((person) => <Person person={person} onSelect={openProfile} key={person.slug}/>)}</div>}</section>
  })}{selectedPerson && <div className={`modal-backdrop ${profileOpen ? 'is-open' : ''}`} role="presentation" onClick={closeProfile}><section className="profile-modal" role="dialog" aria-modal="true" aria-label={selectedPerson.name} onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={closeProfile} aria-label={settings.closeLabel}>{settings.closeLabel}</button><div className="modal-profile"><aside><ProfileImage person={selectedPerson}/><p className="role">{selectedPerson.role}</p><p>{selectedPerson.interests}</p></aside><div><h2>{selectedPerson.name}</h2><p>{selectedPerson.description}</p><ProfileLinks person={selectedPerson} settings={settings}/></div></div></section></div>}</div>
}
function Research({ settings, projects }) { return <div className="page"><p className="eyebrow">{settings.researchEyebrow}</p><h1>{settings.researchTitle}</h1><p className="lead narrow">{settings.researchLead}</p><div className="project-list project-page-list">{projects.map((p) => <Project project={p} settings={settings} detail key={p.slug}/>)}</div></div> }
function Publications({ settings, publications }) { const years = [...new Set(publications.map((p) => p.year))].sort((a, b) => b - a); return <div className="page"><p className="eyebrow">{settings.publicationsEyebrow}</p><h1>{settings.publicationsTitle}</h1><p className="lead narrow">{settings.publicationsLead}</p><div className="publication-list">{years.map((year) => <section className="pub-year" key={year}><h2>{year}</h2>{publications.filter((p) => p.year === year).map((p) => <article key={p.slug}><h3>{p.title}</h3><p>{p.authors}</p><p><em>{p.venue}</em></p><a href={`https://www.doi.org/${p.DOI}`} target="_blank" rel="noreferrer">{settings.doiLabel} {p.DOI}</a></article>)}</section>)}</div></div> }
function News({ settings, news, events }) { return <div className="page"><p className="eyebrow">{settings.newsEyebrow}</p><h1>{settings.newsTitle}</h1><div className="news-layout"><section>{news.map((n, i) => <article className={i ? 'news-row' : 'featured-news'} key={n.slug}><div className="news-image">{n.category}</div><div><p className="meta">{n.date} {settings.metadataSeparator} {n.category}</p><h2>{n.title}</h2><p>{n.excerpt}</p></div></article>)}</section><aside className="sidebar events"><h2>{settings.eventsTitle}</h2>{events.map((event) => <article key={event.slug}><b>{event.date}</b><p><strong>{event.title}</strong><br/>{event.summary}</p></article>)}</aside></div></div> }
function Contact({ settings, join }) { return <div className="page"><p className="eyebrow">{settings.contactEyebrow}</p><h1>{settings.contactTitle}</h1><p className="lead narrow">{settings.contactLead}</p><div className="contact-grid"><section><h2>{settings.contactInfoTitle}</h2><p><strong>{settings.labAddressLabel}</strong><br/>{settings.department}<br/>{settings.university}<br/>{settings.streetAddress}<br/>{settings.cityState}</p><p><strong>{settings.professorLabel}</strong><br/><a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></p></section><section><h2>{settings.contactFormTitle}</h2><p>{settings.contactFormLead}</p><form onSubmit={(e) => e.preventDefault()}><label>{settings.nameLabel}<input /></label><label>{settings.emailLabel}<input type="email" /></label><label>{settings.messageLabel}<textarea rows="4" /></label><button className="primary">{settings.sendMessageLabel}</button></form></section></div><section className="join"><Title>{settings.joinTitle}</Title><div className="three">{join.map((item) => <article key={item.slug}><h3>{item.title}</h3><p>{item.summary}</p></article>)}</div></section></div> }
function MobileTopButton({ settings }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const updateVisibility = () => setVisible(window.innerWidth <= 800 && window.scrollY > 280)
    updateVisibility()
    addEventListener('scroll', updateVisibility, { passive: true })
    addEventListener('resize', updateVisibility)
    return () => {
      removeEventListener('scroll', updateVisibility)
      removeEventListener('resize', updateVisibility)
    }
  }, [])
  return <button className={`mobile-top-button ${visible ? 'is-visible' : ''}`} type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label={settings.backToTopLabel}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 18V6M7 11l5-5 5 5"/></svg></button>
}
function Header({ page, navigation, settings, go }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = (next) => { setMobileMenuOpen(false); go(next) }
  return <header className={mobileMenuOpen ? 'menu-open' : ''}><button className="wordmark" onClick={() => navigate('home')}>{settings.labNameFirst} <span>{settings.labNameLast}</span></button><nav className="desktop-nav" aria-label={settings.desktopNavigationLabel}>{navigation.map((item) => <button className={page === item.slug ? 'active' : ''} onClick={() => navigate(item.slug)} key={item.slug}>{item.label}</button>)}</nav><button className="mobile-menu-toggle" type="button" onClick={() => setMobileMenuOpen((isOpen) => !isOpen)} aria-expanded={mobileMenuOpen} aria-label={mobileMenuOpen ? settings.mobileMenuCloseLabel : settings.mobileMenuOpenLabel}><span></span><span></span><span></span></button><button className="mobile-menu-backdrop" type="button" aria-label={settings.mobileMenuCloseLabel} onClick={(event) => { event.stopPropagation(); setMobileMenuOpen(false) }}></button><nav className="mobile-nav" aria-label={settings.mobileNavigationLabel} aria-hidden={!mobileMenuOpen}>{navigation.map((item) => <button className={page === item.slug ? 'active' : ''} onClick={() => navigate(item.slug)} key={item.slug}>{item.label}</button>)}</nav></header>
}

export default function App() {
  const [page, setPage] = useState(pageFromLocation)
  const settings = useMemo(() => Object.assign({}, ...collection('site', 'settings'), ...['home', 'projects', 'publications', 'team', 'contact', 'news'].flatMap((page) => collection(page, 'settings'))), [])
  const people = useMemo(() => collection('team'), []); const areas = useMemo(() => collection('home', 'area').sort((a, b) => Number(a.index) - Number(b.index)), []); const projects = useMemo(() => collection('projects', 'featured_project').sort((a, b) => Number(b.index) - Number(a.index)), []); const news = useMemo(() => collection('news', 'news_event').sort((a, b) => Number(b.index) - Number(a.index)), []); const publications = useMemo(() => collection('publications'), []); const navigation = useMemo(() => collection('home', 'navigation').sort((a, b) => Number(a.order) - Number(b.order)), []); const events = useMemo(() => collection('news', 'event'), []); const join = useMemo(() => collection('contact', 'join').sort((a, b) => Number(a.index) - Number(b.index)), [])
  useEffect(() => {
    const update = () => setPage(pageFromLocation())
    const queryPage = new URLSearchParams(location.search).get('page')
    if (routes.has(queryPage)) history.replaceState({}, '', pathForPage(queryPage))
    addEventListener('popstate', update)
    return () => removeEventListener('popstate', update)
  }, [])
  const go = (next) => { history.pushState({}, '', pathForPage(next)); setPage(next); if (window.innerWidth <= 800) window.scrollTo({ top: 0, behavior: 'smooth' }); else document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' }) }
  const props = { settings, people, areas, projects, news, publications, events, join, go }
  const Page = { home: Home, team: People, projects: Research, publications: Publications, news: News, contact: Contact }[page] || Home
  return <><Header page={page} navigation={navigation} settings={settings} go={go}/><main><Page {...props}/></main><MobileTopButton settings={settings}/><footer><strong>{settings.labName}</strong><span>{settings.tagline}</span><span>{settings.footerCopyright.replace('{year}', new Date().getFullYear())}</span></footer></>
}
