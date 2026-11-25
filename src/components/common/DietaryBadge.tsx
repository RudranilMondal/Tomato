import React from 'react';
import type { DietaryType, VegFilterType } from '../../types';

interface DietaryBadgeProps {
  type: DietaryType | VegFilterType;
  size?: number;
  showLabel?: boolean;
}

export const DietaryBadge: React.FC<DietaryBadgeProps> = ({ type, size = 14, showLabel = false }) => {
  if (type === 'all') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
        <span
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '3px',
            border: '1.5px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent'
          }}
        >
          <span
            style={{
              width: `${Math.round(size * 0.45)}px`,
              height: `${Math.round(size * 0.45)}px`,
              borderRadius: '50%',
              backgroundColor: 'var(--color-text-muted)'
            }}
          />
        </span>
        {showLabel && <span style={{ fontSize: '12px', fontWeight: 700 }}>All</span>}
      </div>
    );
  }

  const isVeg = type === 'veg';
  const color = isVeg ? 'var(--color-veg, #2ECC71)' : 'var(--color-nonveg, #E74C3C)';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <span
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '3px',
          border: `1.5px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent'
        }}
      >
        <span
          style={{
            width: `${Math.round(size * 0.45)}px`,
            height: `${Math.round(size * 0.45)}px`,
            borderRadius: '50%',
            backgroundColor: color
          }}
        />
      </span>
      {showLabel && (
        <span style={{ fontSize: '12px', fontWeight: 700, color }}>
          {isVeg ? 'Veg' : 'Non-Veg'}
        </span>
      )}
    </div>
  );
};
