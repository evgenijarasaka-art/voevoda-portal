import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from './Footer';
import './legal-document.css';

export interface LegalSection {
  id: string;
  title: string;
  lead?: string;
  paragraphs?: string[];
  bullets?: string[];
}

interface LegalDocumentPageProps {
  badge: string;
  title: string;
  description: string;
  updated: string;
  readingTime: string;
  sections: LegalSection[];
  highlights: Array<{ value: string; label: string }>;
  notice: ReactNode;
  action?: { label: string; onClick: () => void };
}

const ShieldMark = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3 20 6.5v5.9c0 4.2-3.1 7.2-8 8.6-4.9-1.4-8-4.4-8-8.6V6.5L12 3Z" stroke="currentColor" strokeWidth="1.6" />
    <path d="m8.8 12.1 2.1 2.1 4.5-4.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function LegalDocumentPage({ badge, title, description, updated, readingTime, sections, highlights, notice, action }: LegalDocumentPageProps) {
  const navigate = useNavigate();

  return (
    <div className="legal-page-shell">
      <main className="legal-page">
        <button type="button" className="legal-back" onClick={() => navigate(-1)}>
          <span className="legal-back-icon" aria-hidden="true">←</span>
          <span>Назад</span>
        </button>

        <header className="legal-hero">
          <div className="legal-hero-grid" aria-hidden="true" />
          <div className="legal-orbit legal-orbit-one" aria-hidden="true" />
          <div className="legal-orbit legal-orbit-two" aria-hidden="true" />
          <div className="legal-hero-content">
            <div className="legal-badge"><ShieldMark />{badge}</div>
            <h1>{title}</h1>
            <p>{description}</p>
            <div className="legal-meta">
              <span>Редакция от {updated}</span>
              <span className="legal-meta-dot" />
              <span>{readingTime} на чтение</span>
            </div>
          </div>
          <div className="legal-signal" aria-hidden="true">
            <span>01</span><span>В</span><span>Д</span>
          </div>
        </header>

        <section className="legal-highlights" aria-label="Кратко о документе">
          {highlights.map((item, index) => (
            <div className="legal-highlight" key={item.label} style={{ animationDelay: `${index * 80}ms` }}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </section>

        <div className="legal-layout">
          <aside className="legal-toc">
            <div className="legal-toc-label">Содержание</div>
            <nav>
              {sections.map((section, index) => (
                <a key={section.id} href={`#${section.id}`}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {section.title.replace(/^\d+\.\s*/, '')}
                </a>
              ))}
            </nav>
            {action && <button type="button" className="legal-action" onClick={action.onClick}>{action.label}<span>↗</span></button>}
          </aside>

          <div className="legal-content">
            {sections.map((section, index) => (
              <section id={section.id} className="legal-section" key={section.id} style={{ animationDelay: `${120 + index * 55}ms` }}>
                <div className="legal-section-number">{String(index + 1).padStart(2, '0')}</div>
                <div className="legal-section-copy">
                  <h2>{section.title}</h2>
                  {section.lead && <p className="legal-lead">{section.lead}</p>}
                  {section.paragraphs?.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                  {section.bullets && (
                    <ul>
                      {section.bullets.map(item => <li key={item}><span className="legal-check">✓</span><span>{item}</span></li>)}
                    </ul>
                  )}
                </div>
              </section>
            ))}
            <div className="legal-notice">
              <ShieldMark />
              <div><strong>Важно</strong><p>{notice}</p></div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
