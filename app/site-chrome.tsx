import Link from "next/link";

export function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-frame">
      <aside className="sidebar">
        <Link href="/" className="identity">
          <span className="monogram portrait-mark" aria-hidden="true" />
          <span><strong>Balakrishnan</strong><br />(Murali) Narayanaswamy</span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="/">About Me</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/research">Research Publications</Link>
          <Link href="/patents">Patents</Link>
          <Link href="/cv">CV</Link>
        </nav>
        <div className="sidebar-elsewhere">
          <p>Elsewhere</p>
          <a href="https://scholar.google.com/citations?user=mKzKZfUAAAAJ" target="_blank" rel="noreferrer">Scholar</a>
          <a href="https://github.com/muralibalki" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.amazon.science/author/balakrishnan-murali-narayanaswamy" target="_blank" rel="noreferrer">Amazon Science</a>
        </div>
      </aside>
      <div className="main-column">
        <header className="mobile-header">
          <Link href="/" className="identity"><span className="monogram portrait-mark" aria-hidden="true" /><strong>Murali Balki</strong></Link>
          <nav><Link href="/blog">Blog</Link><Link href="/research">Research</Link><Link href="/cv">CV</Link></nav>
        </header>
        <main>{children}</main>
        <footer>
          <p>The postings on this site are my own and don&apos;t necessarily represent Amazon&apos;s positions, strategies or opinions.</p>
          <p>© {new Date().getFullYear()} Balakrishnan (Murali) Narayanaswamy</p>
        </footer>
      </div>
    </div>
  );
}

export function PageHeader({ kicker, title, description }: { kicker: string; title: string; description?: string }) {
  return (
    <header className="page-header">
      <p className="kicker">{kicker}</p>
      <h1>{title}</h1>
      {description && <p className="page-description">{description}</p>}
    </header>
  );
}
