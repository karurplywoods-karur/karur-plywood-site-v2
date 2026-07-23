'use client';
// src/components/ProductVariantSelector.tsx
// Client component — renders variant pills on the product detail page.
// Shows thickness / size / grade pills; updates displayed price live.

import { useState } from 'react';
import type { ProductVariant } from '@/lib/types';

interface Props {
  variants: ProductVariant[];
  basePrice:    number | null;
  baseMrp:      number | null;
  unit:         string;
}

const STOCK_LABEL: Record<ProductVariant['stock_status'], { label: string; color: string }> = {
  in_stock:      { label: '✅ In Stock',       color: '#4ADE80' },
  low_stock:     { label: '🟡 Low Stock',      color: '#FBBF24' },
  out_of_stock:  { label: '❌ Out of Stock',   color: '#F87171' },
  made_to_order: { label: '🛠 Made to Order',  color: '#A78BFA' },
};

// Group variants by a dimension label (thickness → size → grade)
function getPrimaryLabel(v: ProductVariant): string {
  return [v.thickness, v.size, v.grade].filter(Boolean).join(' · ') || 'Standard';
}

export default function ProductVariantSelector({ variants, basePrice, baseMrp, unit }: Props) {
  if (!variants || variants.length === 0) return null;

  const defaultVariant = variants.find(v => v.is_default) ?? variants[0];
  const [selected, setSelected] = useState<ProductVariant>(defaultVariant);

  const displayPrice = selected.price ?? basePrice;
  const displayMrp   = selected.mrp   ?? baseMrp;
  const discount = displayMrp && displayPrice && displayMrp > displayPrice
    ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100)
    : null;

  const stockInfo = STOCK_LABEL[selected.stock_status] ?? STOCK_LABEL.in_stock;

  return (
    <div style={{ marginBottom: 24 }}>
      {/* ── Section header ── */}
      <div style={{
        fontSize: 11, fontFamily: "'Inter',sans-serif",
        fontWeight: 700, letterSpacing: '.12em',
        textTransform: 'uppercase', color: '#7A8EA8', marginBottom: 12,
      }}>
        Choose Variant
      </div>

      {/* ── Variant pills ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {variants.map(v => {
          const isActive = v.id === selected.id;
          const isOOS    = v.stock_status === 'out_of_stock';
          return (
            <button
              key={v.id}
              disabled={isOOS}
              onClick={() => setSelected(v)}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid',
                borderColor: isActive
                  ? '#F97316'
                  : 'rgba(249,115,22,0.18)',
                background: isActive
                  ? 'rgba(249,115,22,0.12)'
                  : 'rgba(11,36,71,0.5)',
                color: isOOS
                  ? '#4A5568'
                  : isActive
                    ? '#F97316'
                    : '#A8BCCC',
                fontFamily: "'Inter',sans-serif",
                fontWeight: 600,
                fontSize: '0.78rem',
                letterSpacing: '.04em',
                cursor: isOOS ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                textDecoration: isOOS ? 'line-through' : 'none',
                position: 'relative',
              }}
            >
              {getPrimaryLabel(v)}
              {v.is_default && !isActive && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  fontSize: 8, background: '#C8884A', color: 'white',
                  borderRadius: 3, padding: '1px 4px', fontWeight: 700,
                  letterSpacing: '.05em',
                }}>
                  DEFAULT
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Selected variant detail card ── */}
      <div style={{
        background: 'rgba(25,55,109,0.4)',
        border: '1px solid rgba(249,115,22,0.2)',
        borderRadius: 10,
        padding: '18px 20px',
      }}>
        {/* Attributes grid */}
        {(() => {
          const attrs: [string, string][] = [];
          if (selected.thickness) attrs.push(['Thickness', selected.thickness]);
          if (selected.size)      attrs.push(['Size',      selected.size]);
          if (selected.grade)     attrs.push(['Grade',     selected.grade]);
          if (selected.finish)    attrs.push(['Finish',    selected.finish]);
          if (selected.color)     attrs.push(['Color',     selected.color]);
          if (selected.pack_size) attrs.push(['Pack',      selected.pack_size]);
          if (attrs.length === 0) return null;
          return (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: 10,
              marginBottom: 16,
            }}>
              {attrs.map(([k, v]) => (
                <div key={k} style={{
                  background: 'rgba(11,36,71,0.5)',
                  border: '1px solid rgba(249,115,22,0.1)',
                  borderRadius: 6, padding: '8px 12px',
                }}>
                  <div style={{
                    fontSize: 10, fontFamily: "'Inter',sans-serif",
                    fontWeight: 700, letterSpacing: '.1em',
                    textTransform: 'uppercase', color: '#7A8EA8', marginBottom: 2,
                  }}>{k}</div>
                  <div style={{ fontSize: 13, color: '#F8F9FB', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          {/* MRP slashed */}
          {displayMrp && displayPrice && displayMrp > displayPrice && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, color: '#7A8EA8', textDecoration: 'line-through' }}>
                ₹{displayMrp.toLocaleString('en-IN')}
              </span>
              {discount && (
                <span style={{
                  fontSize: 11, fontFamily: "'Inter',sans-serif",
                  fontWeight: 700,
                  background: 'rgba(37,211,102,0.15)',
                  color: '#4ADE80',
                  border: '1px solid rgba(37,211,102,0.25)',
                  borderRadius: 3, padding: '2px 7px', letterSpacing: '.05em',
                }}>
                  SAVE {discount}%
                </span>
              )}
            </div>
          )}

          {/* Sale price */}
          {displayPrice ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: '2.2rem',
                color: '#F97316',
                letterSpacing: '.03em', lineHeight: 1,
              }}>
                ₹{displayPrice.toLocaleString('en-IN')}
              </span>
              {unit && (
                <span style={{ fontSize: 13, color: '#7A8EA8', fontFamily: "'Inter',sans-serif" }}>
                  / {unit}
                </span>
              )}
            </div>
          ) : (
            <div style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: '1.4rem', color: '#F97316', letterSpacing: '.04em',
            }}>
              CONTACT FOR PRICE
            </div>
          )}

          {/* Stock badge */}
          <span style={{
            fontSize: 11, fontFamily: "'Inter',sans-serif", fontWeight: 700,
            color: stockInfo.color,
            background: `${stockInfo.color}18`,
            border: `1px solid ${stockInfo.color}40`,
            borderRadius: 4, padding: '4px 10px',
            letterSpacing: '.06em',
          }}>
            {stockInfo.label}
          </span>
        </div>

        {/* Savings line */}
        {displayMrp && displayPrice && displayMrp > displayPrice && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#4ADE80' }}>
            You save ₹{(displayMrp - displayPrice).toLocaleString('en-IN')} on this variant
          </div>
        )}

        {/* Stock quantity hint */}
        {selected.stock_status === 'low_stock' && selected.stock_quantity > 0 && (
          <div style={{ marginTop: 6, fontSize: 11, color: '#FBBF24' }}>
            ⚠️ Only {selected.stock_quantity} left in stock — order soon
          </div>
        )}
      </div>
    </div>
  );
}
