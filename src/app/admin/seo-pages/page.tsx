'use client';
// src/app/admin/seo-pages/page.tsx
// List and manage all SEO pages — uses unified seo_pages table

import { useState, useEffect } from 'react';

interface SEOPage {
  id: number;
  status: string;
  title: string | null;
  word_count: number | null;
  ai_generated_at: string | null;
  content_version: number | null;
  is_published: boolean;
  full_path: string;
  slug: string;
  page_type: string;
  seo_areas: { slug: string; display_name: string } | null;
  seo_categories: { slug: string; display_name: string } | null;
}

export default function SEOPagesList() {
  const [pages, setPages] = useState<SEOPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPages();
  }, [statusFilter]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'all' 
        ? '/api/admin/seo-pages' 
        : `/api/admin/seo-pages?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setPages(data.pages || []);
    } catch {
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return { bg: 'rgba(37,211,102,0.1)', color: '#25D366', border: 'rgba(37,211,102,0.2)' };
      case 'pending_review': return { bg: 'rgba(250,204,21,0.1)', color: '#FDE047', border: 'rgba(250,204,21,0.2)' };
      case 'draft': return { bg: 'rgba(154,128,112,0.1)', color: '#9A8070', border: 'rgba(154,128,112,0.2)' };
      case 'rejected': return { bg: 'rgba(248,113,113,0.1)', color: '#F87171', border: 'rgba(248,113,113,0.2)' };
      default: return { bg: 'rgba(154,128,112,0.1)', color: '#9A8070', border: 'rgba(154,128,112,0.2)' };
    }
  };

  const cardStyle: React.CSSProperties = {
    background: '#1C140D',
    border: '1px solid rgba(200,136,74,0.15)',
    borderRadius: 14,
    padding: '20px 24px',
    marginBottom: 12,
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0E0B08', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
        <div style={{ color: '#9A8070', fontFamily: 'Outfit,sans-serif' }}>Loading...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0E0B08', color: '#F0E8DC', fontFamily: 'Outfit,sans-serif', padding: '28px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: '#F0E8DC', marginBottom: 4 }}>
              SEO Pages
            </div>
            <div style={{ fontSize: 14, color: '#9A8070' }}>
              {pages.length} pages · {pages.filter(p => p.status === 'published').length} published
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              style={{ 
                background: '#1C140D', 
                border: '1px solid rgba(200,136,74,0.2)', 
                borderRadius: 8, 
                padding: '8px 14px', 
                color: '#F0E8DC', 
                fontFamily: 'Outfit,sans-serif',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              <option value="all">All Statuses</option>
              <option value="draft">📝 Draft</option>
              <option value="pending_review">⏳ Pending Review</option>
              <option value="published">✅ Published</option>
              <option value="rejected">❌ Rejected</option>
            </select>
            <a 
              href="/admin/seo-generator"
              style={{ 
                background: 'linear-gradient(135deg,#C8884A,#8B5E2A)', 
                color: 'white', 
                padding: '8px 18px', 
                borderRadius: 8, 
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              + Generate New
            </a>
          </div>
        </div>

        {/* Pages List */}
        {pages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9A8070' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
            <div style={{ fontSize: 16, marginBottom: 8 }}>No SEO pages found</div>
            <div style={{ fontSize: 13 }}>Generate content to see pages here</div>
          </div>
        )}

        {pages.map(page => {
          const statusStyle = getStatusColor(page.status);
          return (
            <div key={page.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#F0E8DC', marginBottom: 6 }}>
                    {page.title || `${page.seo_categories?.display_name} in ${page.seo_areas?.display_name}`}
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: '#9A8070', marginBottom: 8 }}>
                    <span>📍 {page.seo_areas?.display_name}</span>
                    <span>📦 {page.seo_categories?.display_name}</span>
                    {page.word_count && <span>📝 {page.word_count} words</span>}
                    {page.content_version && <span>🔢 v{page.content_version}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: 11, 
                      fontWeight: 600, 
                      padding: '3px 10px', 
                      borderRadius: 20, 
                      background: statusStyle.bg, 
                      color: statusStyle.color,
                      border: `1px solid ${statusStyle.border}`,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>
                      {page.status}
                    </span>
                    {page.is_published && (
                      <span style={{ fontSize: 11, color: '#25D366' }}>✓ Live</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
                  <a 
                    href={page.full_path}
                    target="_blank"
                    rel="noopener"
                    style={{ 
                      padding: '7px 12px', 
                      borderRadius: 7, 
                      background: 'rgba(200,136,74,0.1)', 
                      border: '1px solid rgba(200,136,74,0.2)', 
                      color: '#E0A86A', 
                      fontSize: 12, 
                      textDecoration: 'none',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    👁 Preview
                  </a>
                  {page.status === 'pending_review' && (
                    <button 
                      onClick={async () => {
                        const res = await fetch('/api/admin/save-seo-content', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            page_id: page.id, 
                            content: { status: 'published' },
                            reviewed_by: 'admin' 
                          }),
                        });
                        if (res.ok) fetchPages();
                      }}
                      style={{ 
                        padding: '7px 12px', 
                        borderRadius: 7, 
                        background: 'rgba(37,211,102,0.1)', 
                        border: '1px solid rgba(37,211,102,0.2)', 
                        color: '#25D366', 
                        fontSize: 12, 
                        cursor: 'pointer',
                        fontFamily: 'Outfit,sans-serif',
                        fontWeight: 600,
                      }}
                    >
                      ✓ Publish
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
