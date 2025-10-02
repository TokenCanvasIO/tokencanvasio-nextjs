import React, { memo } from 'react';
import Link from 'next/link'; // --- 1. IMPORT the Next.js Link component ---

const FullScreenMenu = memo(function FullScreenMenu({ isOpen, navItems, onClose }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fullscreen-menu-overlay" onClick={onClose}>
      <nav className="fullscreen-nav" onClick={(e) => e.stopPropagation()}>
        {navItems.map((item, index) => {
          const ItemIcon = item.icon;
          const animationStyle = { animationDelay: `${0.1 + index * 0.05}s` };

          // --- 2. UPDATED LOGIC to handle three types of menu items ---

          // Case 1: Internal page navigation (uses Next.js Link)
          if (item.href && !item.isExternal) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="fullscreen-nav-item"
                style={animationStyle}
                onClick={onClose}
              >
                <span className="nav-icon">
                  {/* Handle cases where icon is a component vs. a function returning JSX */}
                  {typeof ItemIcon === 'function' && !ItemIcon.prototype?.isReactComponent ? ItemIcon() : <ItemIcon />}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          }

          // Case 2: A button that performs a client-side action
          if (item.action) {
            return (
              <button
                key={item.name}
                className="fullscreen-nav-item"
                style={animationStyle}
                onClick={() => {
                  item.action();
                  onClose();
                }}
              >
                <span className="nav-icon">
                  {typeof ItemIcon === 'function' && !ItemIcon.prototype?.isReactComponent ? ItemIcon() : <ItemIcon />}
                </span>
                <span>{item.name}</span>
              </button>
            );
          }

          // Case 3: A standard external link
          return (
            <a
              key={item.name}
              href={item.href}
              className="fullscreen-nav-item"
              style={animationStyle}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="nav-icon">
                {typeof ItemIcon === 'function' && !ItemIcon.prototype?.isReactComponent ? ItemIcon() : <ItemIcon />}
              </span>
              <span>{item.name}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
});

export default FullScreenMenu;