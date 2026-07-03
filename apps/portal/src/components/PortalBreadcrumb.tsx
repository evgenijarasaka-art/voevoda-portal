import { useNavigate } from 'react-router-dom';
import './portal-breadcrumb.css';

export type BreadcrumbItem = {
  label: string;
  to?: string | null;
  onClick?: () => void;
  state?: unknown;
};

type PortalBreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
  tone?: 'default' | 'inverse';
};

export function PortalBreadcrumb({ items, className = '', tone = 'default' }: PortalBreadcrumbProps) {
  const navigate = useNavigate();

  if (items.length < 3) return null;

  return (
    <nav className={`portal-breadcrumbs ${tone === 'inverse' ? 'portal-breadcrumbs--inverse' : ''} ${className}`.trim()} aria-label="Навигационный путь">
      <ol>
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`}>
              {index > 0 && (
                <svg className="portal-breadcrumbs__separator" width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              )}
              {!current && (item.to || item.onClick) ? (
                <button type="button" onClick={() => item.onClick ? item.onClick() : navigate(item.to!, item.state === undefined ? undefined : { state:item.state })}>{item.label}</button>
              ) : (
                <span aria-current={current ? 'page' : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
