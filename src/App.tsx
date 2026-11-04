import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { getProject, profile, projects } from './data/portfolio';
import HomeGallery from './editor/HomeGallery';
import LayoutEditor from './editor/LayoutEditor';
import { isLocalEditorHost } from './editor/layout';
import EmotionalVacuumPage from './components/EmotionalVacuumPage';
import DKUCampusExplorerPage from './components/DKUCampusExplorerPage';
import PCGProjectOverview from './components/PCGProjectOverview';
import ProjectLayoutLayer from './editor/ProjectLayoutLayer';
import MixedLivesPage from './components/MixedLivesPage';
import { useDesktopLayout } from './editor/useDesktopLayout';
import ProjectHeader from './components/ProjectHeader';
import { useNavigationGeometry } from './components/useNavigationGeometry';

function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg className={back ? 'arrow arrow--back' : 'arrow'} viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M5 19 19 5M6 5h13v13" stroke="currentColor" strokeWidth="1.35" />
    </svg>
  );
}

function PageMeta({ title, description }: { title?: string; description: string }) {
  useEffect(() => {
    const pageTitle = title ? `${title} — ${profile.name}` : `${profile.name} — Portfolio`;
    document.title = pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', pageTitle);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  }, [title, description]);
  return null;
}

function RouteEffects() {
  const { pathname } = useLocation();
  const previous = useRef(pathname);
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (previous.current !== pathname) {
      document.getElementById('main')?.focus({ preventScroll: true });
    }
    previous.current = pathname;
  }, [pathname]);
  return null;
}

function Header() {
  const desktop = useDesktopLayout();
  const { geometry, buttonStyle } = useNavigationGeometry();
  const { pathname: routePathname } = useLocation();
  const pathname = routePathname.replace(/\/+$/, '') || '/';
  const isCv = pathname === '/cv';
  const isProject = pathname.startsWith('/work/');
  const [editorAvailable, setEditorAvailable] = useState(false);
  useEffect(() => {
    if (!isLocalEditorHost()) return;
    const controller = new AbortController();
    fetch('/__portfolio-editor/status', { signal: controller.signal, cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(status => setEditorAvailable(status?.enabled === true))
      .catch(() => {});
    return () => controller.abort();
  }, []);
  if (isProject) return null;
  if (pathname === '/' && desktop) return editorAvailable ? (
    <nav className="home-editor-access" aria-label="Local editing"><Link to="/edit">编辑排版 ↗</Link></nav>
  ) : null;
  return (
    <header className="site-header" style={desktop ? { height: Math.max(geometry.name.y + geometry.name.height, geometry.subtitle.y + geometry.subtitle.height, geometry.top + geometry.height) + 12, paddingBlock: 0 } : undefined}>
      <Link className="identity" to="/" aria-label={`${profile.name}, portfolio homepage`} style={desktop ? { position: 'absolute', left: geometry.name.x, top: geometry.name.y, width: geometry.name.width } : undefined}>
        {pathname === '/' ? <h1 className="identity-name">{profile.name}</h1> : <span className="identity-name" style={desktop ? { fontSize: geometry.name.fontSize, lineHeight: geometry.name.lineHeight } : undefined}>{profile.name}</span>}
        <span className="identity-subtitle" style={desktop ? { position: 'absolute', left: geometry.subtitle.x - geometry.name.x, top: geometry.subtitle.y - geometry.name.y, width: geometry.subtitle.width, marginTop: 0, fontSize: geometry.subtitle.fontSize, lineHeight: geometry.subtitle.lineHeight } : undefined}>Portfolio</span>
      </Link>
      <nav aria-label="Main navigation">
        {pathname === '/' && editorAvailable && <Link className="header-editor-link" to="/edit">编辑排版</Link>}
        <Link className="header-link site-header-navigation-button" style={{ ...buttonStyle, left: geometry.cvLeft }} to={isCv ? '/' : '/cv'}>
          {isCv ? 'Portfolio' : 'CV'}<Arrow back={isCv} />
        </Link>
      </nav>
    </header>
  );
}

function Home() {
  return (
    <>
      <PageMeta description={`${profile.name}. Games, procedural art, and interactive experiences.`} />
      <main className="home-page" id="main" tabIndex={-1}>
        <HomeGallery />
      </main>
      <footer className="home-footer">
        <a href={`mailto:${profile.email}`} className="contact-link">{profile.email}<Arrow /></a>
      </footer>
    </>
  );
}

function CV() {
  return (
    <>
      <PageMeta title="CV" description={profile.intro} />
      <main className="cv-page" id="main" tabIndex={-1}>
        <div className="cv-column cv-personal">
          <section className="cv-introduction" aria-labelledby="cv-heading">
            <h1 id="cv-heading">{profile.headline}</h1>
            <p>{profile.intro}</p>
            <a href={`mailto:${profile.email}`} className="cv-email">{profile.email}</a>
          </section>
          <section className="cv-section" aria-labelledby="education-heading">
            <div className="cv-section-heading">
              <h2 id="education-heading">Education</h2><span>{profile.education[0]?.period}</span>
            </div>
            <div className="education-list">
              {profile.education.map(item => (
                <div className="education-entry" key={item.institution}>
                  <h3>{item.institution}</h3><p>{item.degree}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="cv-section" aria-labelledby="skills-heading">
            <h2 id="skills-heading">Tools & practice</h2>
            <dl className="skills-list">
              {profile.skills.map(group => (
                <div key={group.label}><dt>{group.label}</dt><dd>{group.items.join(', ')}</dd></div>
              ))}
            </dl>
          </section>
        </div>
        <div className="cv-column cv-work">
          <section aria-labelledby="projects-heading">
            <h2 id="projects-heading">Selected projects</h2>
            <div className="cv-project-list">
              {profile.projectEntries.map(entry => {
                const project = getProject(entry.slug);
                if (!project) return null;
                return (
                  <article className="cv-project" key={entry.slug}>
                    <Link to={`/work/${project.slug}`} className="cv-project-link"><h3>{project.title}</h3><Arrow /></Link>
                    {entry.role && <p className="cv-role">{entry.role}</p>}
                    <p className="cv-project-description">{entry.description}</p>
                  </article>
                );
              })}
            </div>
          </section>
          <section className="cv-section cv-experience" aria-labelledby="experience-heading">
            <h2 id="experience-heading">Research & community</h2>
            {profile.experience.map(entry => (
              <article className="experience-entry" key={entry.organization}>
                <div><h3>{entry.organization}</h3><span>{entry.period}</span></div><p>{entry.title}</p>
              </article>
            ))}
          </section>
        </div>
      </main>
    </>
  );
}

function ProjectPage() {
  const { slug = '' } = useParams();
  const project = getProject(slug);
  if (!project) return <NotFound />;
  if (project.slug === 'emotional-vacuum') return <><PageMeta title={project.title} description="An alternative-controller game exploring emotional suppression through collection, containment, and release. A collaborative design and development case study by Xueyao Jiang." /><EmotionalVacuumPage /></>;
  if (project.slug === 'dku-campus-tour') return <><PageMeta title={project.title} description="A two-person campus exploration game connecting places, conversations, and everyday life at Duke Kunshan University. Design and interaction work by Xueyao Jiang." /><DKUCampusExplorerPage /></>;
  if (project.slug === 'mixed-lives') return <><PageMeta title={project.title} description={project.summary} /><MixedLivesPage project={project} /></>;
  return (
    <>
      <PageMeta title={project.title} description={project.summary} />
      <main className={`project-page${project.slug === 'pcg-project' ? ' project-page--pcg' : ''}`} id="main" tabIndex={-1}>
        {project.slug === 'pcg-project' ? <PCGProjectOverview project={project} /> : <><header className="project-heading">
          <div className="project-heading-text">
            <h1>{project.title}</h1>
          </div>
        </header>
        <div className="project-canvas" /></>}
        <nav className="project-navigation" aria-label="Other projects">
          {projects.filter(item => item.id !== project.id).map(item => (
            <Link to={`/work/${item.slug}`} key={item.id}><span>{item.title}</span><Arrow /></Link>
          ))}
        </nav>
      </main>
    </>
  );
}

function NotFound() {
  return (
    <main className="not-found" id="main" tabIndex={-1}>
      <PageMeta title="Page not found" description={`${profile.name}'s portfolio.`} />
      <h1>Page not found.</h1><Link className="return-link" to="/"><Arrow back />Portfolio</Link>
    </main>
  );
}

export default function App() {
  const { pathname: routePathname } = useLocation();
  const pathname = routePathname.replace(/\/+$/, '') || '/';
  const isProject = pathname.startsWith('/work/');
  const currentProject = isProject ? getProject(pathname.split('/')[2]) : undefined;
  if (pathname === '/edit') return <LayoutEditor />;
  return (
    <div className={`site-shell${pathname === '/' ? ' site-shell--home' : ''}${pathname === '/cv' ? ' site-shell--cv' : ''}${isProject ? ' site-shell--project' : ''}${pathname === '/work/pcg-project' ? ' site-shell--pcg' : ''}${pathname === '/work/emotional-vacuum' ? ' site-shell--ev' : ''}${pathname === '/work/dku-campus-tour' ? ' site-shell--dku' : ''}${pathname === '/work/mixed-lives' ? ' site-shell--ml' : ''}`}>
      <a className="skip-link" href="#main">Skip to content</a>
      <RouteEffects />{!isProject && <Header />}
      {currentProject && <ProjectHeader key={`project-header:${currentProject.slug}`} project={currentProject} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cv" element={<CV />} />
        <Route path="/work/:slug" element={<ProjectPage />} />
        <Route path="/about" element={<Navigate replace to="/cv" />} />
        <Route path="/resume" element={<Navigate replace to="/cv" />} />
        <Route path="/contact" element={<Navigate replace to="/cv" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {currentProject && <ProjectLayoutLayer key={`project-layout:${currentProject.slug}`} slug={currentProject.slug} />}
    </div>
  );
}
