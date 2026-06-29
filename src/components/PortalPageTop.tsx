import type { ReactNode } from 'react';
import { PortalBreadcrumb, type BreadcrumbItem } from './PortalBreadcrumb';
import './portal-page-top.css';

type PortalPageTopProps = {
  title: string;
  icon: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
};

export function PortalPageTop({ title, icon, breadcrumbs, actions, className = '' }: PortalPageTopProps) {
  const items = breadcrumbs ?? [{ label:'Главная', to:'/' }, { label:title }];

  return (
    <header className={`portal-page-top ${className}`.trim()}>
      <div className="portal-page-top__bar">
        <div className="portal-page-top__title">
          <span className="portal-page-top__icon" aria-hidden="true">{icon}</span>
          <h1>{title}</h1>
        </div>
        {actions && <div className="portal-page-top__actions">{actions}</div>}
      </div>
      {items.length >= 3 && (
        <div className="portal-page-top__path">
          <PortalBreadcrumb className="embedded-breadcrumb" items={items} />
        </div>
      )}
    </header>
  );
}
