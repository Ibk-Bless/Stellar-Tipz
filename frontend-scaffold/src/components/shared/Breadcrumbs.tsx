import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  if (items.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${window.location.origin}${item.href}` } : {}),
    })),
  };

  const shouldCollapse = items.length > 3;

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <nav aria-label="Breadcrumb" className={`mb-4 ${className}`}>
        <ol className="flex flex-wrap items-center gap-1 text-sm font-bold">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isCollapsed = shouldCollapse && index > 0 && index < items.length - 1;

            if (isCollapsed) {
              if (index === 1) {
                return (
                  <li
                    key={index}
                    className="hidden sm:flex items-center gap-1"
                  >
                    <ChevronRight size={14} className="text-gray-400" />
                    <span className="text-gray-400" aria-hidden="true">
                      &hellip;
                    </span>
                    <ChevronRight size={14} className="text-gray-400" />
                  </li>
                );
              }
              return null;
            }

            const isHiddenOnMobile = shouldCollapse && index === 0 && !isLast;
            const isMobileOnly = shouldCollapse && isLast;

            return (
              <li
                key={index}
                className={`flex items-center gap-1 ${isHiddenOnMobile ? 'hidden sm:flex' : ''} ${isMobileOnly ? 'sm:flex' : ''}`}
              >
                {index > 0 && (
                  <ChevronRight size={14} className="text-gray-400 shrink-0" />
                )}
                {isLast || !item.href ? (
                  <span
                    className="text-gray-500 truncate max-w-[200px]"
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    className="underline decoration-2 underline-offset-2 hover:opacity-70 transition-opacity truncate max-w-[200px]"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;
