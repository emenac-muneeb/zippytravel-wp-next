// src/Components/BreadcrumbTrail.jsx
import React from 'react';

export default function BreadcrumbTrail({ items = [] }) {
  return (
    <nav className="text-sm text-gray-600 py-2 px-4">
      <ul className="flex flex-wrap items-center gap-1">
        {items.map((crumb, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center">
              {!isLast ? (
                <a href={crumb.path} className="text-blue-600 hover:underline capitalize">
                  {crumb.name}
                </a>
              ) : (
                <span className="font-semibold capitalize">{crumb.name}</span>
              )}
              {!isLast && <span className="mx-1">›</span>}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
