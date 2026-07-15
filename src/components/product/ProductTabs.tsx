'use client';
import { useState, ReactNode } from 'react';

interface Tab {
  key: string;
  label: string;
  content: ReactNode;
}

export default function ProductTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <div>
      <div className="pt-tabbar">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`pt-tab${active === t.key ? ' pt-tab--active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-panel">
        {tabs.find(t => t.key === active)?.content}
      </div>

      <style jsx>{`
        .pt-tabbar { display: flex; gap: 28px; border-bottom: 1px solid #E5E1DC; overflow-x: auto; }
        .pt-tab { background: none; border: none; cursor: pointer; padding: 14px 2px; font-family: 'Syne',sans-serif; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #6B7280; white-space: nowrap; border-bottom: 2px solid transparent; transition: color .15s, border-color .15s; }
        .pt-tab:hover { color: #0B2447; }
        .pt-tab--active { color: #F07316; border-bottom-color: #F07316; }
        .pt-panel { padding-top: 32px; }
      `}</style>
    </div>
  );
}
