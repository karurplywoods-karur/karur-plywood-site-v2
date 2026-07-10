'use client';
// src/components/Gallery.tsx
import { useState } from 'react';
import Image from 'next/image';

interface GalleryItem { id: number; title: string; category: string; image_url: string; }
interface Props { items: GalleryItem[]; }

const CATS = ['all', 'plywood', 'doors', 'laminates', 'hardware', 'showroom'];
const CAT_LABELS: Record<string, string> = {
  all: '🏷️ All', plywood: '🪵 Plywood', doors: '🚪 Doors',
  laminates: '🎨 Laminates', hardware: '🔩 Hardware', showroom: '🏪 Showroom',
};

export default function Gallery({ items }: Props) {
  const [active, setActive] = useState('all');
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  const filtered = active === 'all' ? items : items.filter(i => i.category === active);

  return (
    <>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        {CATS.map(c => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`fbtn${active === c ? ' active' : ''}`}
          >
            {CAT_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Grid — CSS hover only, no JS mouse events */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
        {filtered.map(item => (
          <div
            key={item.id}
            className="gal-card"
            onClick={() => setLightbox(item)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setLightbox(item)}
          >
            <div className="gal-img-wrap">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.title || item.category}
                  fill
                  className="gal-img"
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width:768px) 100vw, 33vw"
                />
              ) : (
                <div className="gal-placeholder">
                  {item.category === 'plywood' ? '🪵' : item.category === 'doors' ? '🚪' : item.category === 'laminates' ? '🎨' : '📦'}
                </div>
              )}
            </div>
            {item.title && (
              <div className="gal-body">
                <div className="gal-title">{item.title}</div>
                <div className="gal-cat">{item.category}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#7A8EA8' }}>
          No images in this category yet.
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="gal-lightbox"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="gal-lightbox-inner" onClick={e => e.stopPropagation()}>
            <div className="gal-lightbox-img">
              {lightbox.image_url && (
                <Image
                  src={lightbox.image_url}
                  alt={lightbox.title || ''}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              )}
            </div>
            {lightbox.title && (
              <div className="gal-lightbox-bar">
                <div>
                  <div style={{ fontWeight: 600, color: '#F8F9FB' }}>{lightbox.title}</div>
                  <div style={{ fontSize: 12, color: '#7A8EA8', textTransform: 'capitalize' }}>{lightbox.category}</div>
                </div>
                <button className="gal-close-btn" onClick={() => setLightbox(null)}>✕ Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .gal-card {
          border-radius: 10px; overflow: hidden;
          border: 1px solid rgba(249,115,22,0.15);
          cursor: pointer; background: rgba(25,55,109,0.35);
          transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
        }
        .gal-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.45);
          border-color: rgba(249,115,22,0.4);
        }
        .gal-card:hover .gal-img { transform: scale(1.05); }
        .gal-img-wrap {
          position: relative; height: 200px; overflow: hidden;
          background: rgba(11,36,71,0.6);
        }
        .gal-img { object-fit: cover; transition: transform 0.4s ease; }
        .gal-placeholder {
          height: 100%; display: flex; align-items: center;
          justify-content: center; font-size: 56px;
        }
        .gal-body { padding: 12px 16px; }
        .gal-title { font-size: 14px; font-weight: 600; color: #F8F9FB; margin-bottom: 2px; }
        .gal-cat { font-size: 11px; color: #7A8EA8; text-transform: capitalize; }
        .gal-lightbox {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.9); z-index: 10000;
          display: flex; align-items: center; justify-content: center;
          padding: 24px; cursor: zoom-out;
        }
        .gal-lightbox-inner {
          position: relative; max-width: 800px; width: 100%;
          border-radius: 10px; overflow: hidden; cursor: auto;
        }
        .gal-lightbox-img { position: relative; height: 500px; }
        .gal-lightbox-bar {
          background: rgba(11,36,71,0.95);
          padding: 16px 20px;
          display: flex; justify-content: space-between; align-items: center;
          border-top: 1px solid rgba(249,115,22,0.15);
        }
        .gal-close-btn {
          background: none;
          border: 1px solid rgba(249,115,22,0.3);
          border-radius: 6px;
          color: #F97316; padding: 6px 14px;
          cursor: pointer; font-size: 13px;
          font-family: 'Syne', sans-serif;
          transition: background 0.15s;
        }
        .gal-close-btn:hover { background: rgba(249,115,22,0.1); }
      `}</style>
    </>
  );
}
