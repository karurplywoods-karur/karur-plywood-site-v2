// src/app/admin/seo-generator/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface Area { id: number; slug: string; display_name: string; }
interface Category { id: number; slug: string; display_name: string; }

export default function SEOGeneratorPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, current: '' });
  const [results, setResults] = useState<{success: number; failed: number; errors: string[], total: number}>({ success: 0, failed: 0, errors: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/seo-data')
      .then(r => {
        if (!r.ok) throw new Error('Failed to download base data');
        return r.json();
      })
      .then(d => {
        setAreas(d.areas || []);
        setCategories(d.categories || []);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const toggleArea = (id: number) => {
    setSelectedAreas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleCategory = (id: number) => {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const generateAll = async () => {
    const combinations: {area_id: number; category_id: number}[] = [];
    selectedAreas.forEach(aid => {
      selectedCategories.forEach(cid => combinations.push({ area_id: aid, category_id: cid }));
    });

    if (combinations.length === 0) return alert('Select at least one area and one category');
    if (combinations.length > 50) return alert('Max 50 combinations per batch targeted to protect rate profiles');

    setGenerating(true);
    setProgress({ done: 0, total: combinations.length, current: '' });
    setResults({ success: 0, failed: 0, errors: [], total: combinations.length });

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < combinations.length; i++) {
      const { area_id, category_id } = combinations[i];
      const area = areas.find(a => a.id === area_id);
      const cat = categories.find(c => c.id === category_id);
      const label = `${area?.display_name || area_id}/${cat?.display_name || category_id}`;

      setProgress({ done: i, total: combinations.length, current: label });

      try {
        const res = await fetch('/api/admin/generate-seo-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ area_id, category_id }),
        });

        // FIXED: Explicitly capture HTTP error payloads instead of resolving silently
        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: `Server returned status ${res.status}` }));
          throw new Error(errData.error || `HTTP Code ${res.status}`);
        }
        
        success++;
      } catch (err: any) {
        failed++;
        errors.push(`${label}: ${err.message || err}`);
        console.error(`Error processing execution on ${label}:`, err);
      }

      if (i < combinations.length - 1) {
        await new Promise(r => setTimeout(r, 3500));
      }
    }

    setProgress({ done: combinations.length, total: combinations.length, current: 'Completed' });
    setResults({ success, failed, errors, total: combinations.length });
    setGenerating(false);
  };

  const selectAllAreas = () => setSelectedAreas(areas.map(a => a.id));
  const selectAllCategories = () => setSelectedCategories(categories.map(c => c.id));
  const clearAll = () => { setSelectedAreas([]); setSelectedCategories([]); };

  const cardStyle: React.CSSProperties = {
    background: '#1C140D',
    border: '1px solid rgba(200,136,74,0.15)',
    borderRadius: 14,
    padding: '24px',
    marginBottom: 16,
  };

  const tagStyle = (selected: boolean): React.CSSProperties => ({
    display: 'inline-block',
    padding: '8px 16px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    margin: '4px',
    border: selected ? '1px solid transparent' : '1px solid rgba(200,136,74,0.2)',
    background: selected ? 'linear-gradient(135deg,#C8884A,#8B5E2A)' : 'transparent',
    color: selected ? 'white' : '#9A8070',
  });

  const btnPrimary: React.CSSProperties = {
    width: '100%',
    padding: '14px 0',
    borderRadius: 8,
    border: 'none',
    fontWeight: 700,
    fontSize: 15,
    fontFamily: 'Outfit,sans-serif',
    cursor: generating ? 'default' : 'pointer',
    background: generating ? '#5c4a2e' : 'linear-gradient(135deg,#C8884A,#8B5E2A)',
    color: 'white',
    transition: 'all 0.2s',
  };

  const progressBarBg: React.CSSProperties = {
    width: '100%',
    height: 6,
    background: 'rgba(200,136,74,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 16,
  };

  const progressBarFill = (pct: number): React.CSSProperties => ({
    height: '100%',
    width: `${pct}%`,
    background: 'linear-gradient(135deg,#C8884A,#8B5E2A)',
    borderRadius: 3,
    transition: 'width 0.3s ease',
  });

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0E0B08', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>â³</div>
        <div style={{ color: '#9A8070', fontFamily: 'Outfit,sans-serif' }}>Loading Configuration Core...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0E0B08', color: '#F0E8DC', fontFamily: 'Outfit,sans-serif', padding: '28px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: '#F0E8DC', marginBottom: 4 }}>
            SEO Content Generator
          </div>
          <div style={{ fontSize: 14, color: '#9A8070' }}>
            Generate unique AI content for location + category pages
          </div>
        </div>

        {/* Areas */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#F0E8DC' }}>
              Select Areas <span style={{ color: '#C8884A' }}>({selectedAreas.length})</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={selectAllAreas} style={{ fontSize: 12, color: '#C8884A', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
                Select All
              </button>
              <button onClick={clearAll} style={{ fontSize: 12, color: '#F87171', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
                Clear
              </button>
            </div>
          </div>
          <div>
            {areas.map(area => (
              <span key={area.id} onClick={() => toggleArea(area.id)} style={tagStyle(selectedAreas.includes(area.id))}>
                {area.display_name}
              </span>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#F0E8DC' }}>
              Select Categories <span style={{ color: '#C8884A' }}>({selectedCategories.length})</span>
            </div>
            <button onClick={selectAllCategories} style={{ fontSize: 12, color: '#C8884A', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
              Select All
            </button>
          </div>
          <div>
            {categories.map(cat => (
              <span key={cat.id} onClick={() => toggleCategory(cat.id)} style={tagStyle(selectedCategories.includes(cat.id))}>
                {cat.display_name}
              </span>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, color: '#9A8070', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Combinations</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#E0A86A', fontFamily: "'Cormorant Garamond',serif" }}>
                {selectedAreas.length * selectedCategories.length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#9A8070', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Est. Time</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#E0A86A', fontFamily: "'Cormorant Garamond',serif" }}>
                ~{Math.ceil(selectedAreas.length * selectedCategories.length * 3.5 / 60)} min
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button onClick={generateAll} disabled={generating} style={btnPrimary}>
          {generating 
            ? `Generating ${progress.current}... (${progress.done}/${progress.total})` 
            : 'Generate Content'}
        </button>

        {/* Progress Bar */}
        {generating && (
          <div style={progressBarBg}>
            <div style={progressBarFill(progress.total > 0 ? (progress.done / progress.total) * 100 : 0)}></div>
          </div>
        )}

        {/* Results Overview Output */}
        {results.total > 0 && !generating && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', color: '#25D366', padding: '10px 18px', borderRadius: 8, fontWeight: 600, fontSize: 14 }}>
                âœ… Success: {results.success}
              </div>
              {results.failed > 0 && (
                <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171', padding: '10px 18px', borderRadius: 8, fontWeight: 600, fontSize: 14 }}>
                  âŒ Failed: {results.failed}
                </div>
              )}
            </div>

            {results.errors.length > 0 && (
              <div style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontWeight: 700, color: '#F87171', marginBottom: 8, fontSize: 14 }}>Generation Failures Explained:</div>
                <div style={{ fontSize: 12, color: '#F87171', lineHeight: 1.8 }}>
                  {results.errors.map((e, i) => (
                    <div key={i} style={{ marginBottom: 4 }}>â€¢ {e}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
