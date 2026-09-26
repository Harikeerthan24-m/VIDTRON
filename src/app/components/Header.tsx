import React from 'react';

export default function Header() {
  return (
    <header className="app__header">
      <div className="app__header-inner">
        <div className="app__logo">
          <span className="app__title">VIDTRON</span>
        </div>
        <nav>
          <a href="#" className="btn btn--outline btn--sm">Get Started</a>
        </nav>
      </div>
    </header>
  );
}
