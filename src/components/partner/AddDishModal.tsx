import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { MenuItem, MenuCategory, DietaryType } from '../../types';
import { X, Plus, Sparkles, Image as ImageIcon } from 'lucide-react';

interface AddDishModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: MenuCategory[];
  restaurantId: string;
}

export const AddDishModal: React.FC<AddDishModalProps> = ({
  isOpen,
  onClose,
  categories,
  restaurantId
}) => {
  const { addMenuItem } = useTomattto();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [dietary, setDietary] = useState<DietaryType>('non_veg');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const sampleImages = [
    { label: 'Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80' },
    { label: 'Kebab', url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=400&auto=format&fit=crop&q=80' },
    { label: 'Curry / Gravy', url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&auto=format&fit=crop&q=80' },
    { label: 'Roti / Bread', url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&auto=format&fit=crop&q=80' },
    { label: 'Dessert', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=80' }
  ];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    addMenuItem(restaurantId, categoryId || categories[0]?.id, {
      name: name.trim(),
      description: description.trim() || 'Freshly prepared specialty dish with authentic seasonings.',
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
      dietary,
      imageUrl: imageUrl.trim() || sampleImages[0].url,
      isInStock: true,
      isBestseller: false
    });

    setName('');
    setPrice('');
    setDiscountPrice('');
    setDescription('');
    setImageUrl('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          overflowY: 'auto',
          animation: 'slideUp 0.25s ease'
        }}
        className="no-scrollbar"
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Add New Dish to Menu</h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Publish an item instantly to your live customer menu
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-muted)',
              color: 'var(--color-text-main)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Dish Name */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Dish Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Royal Nawabi Chicken Dum Biryani"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                fontSize: '13px',
                color: 'var(--color-text-main)'
              }}
            />
          </div>

          {/* Category & Dietary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Menu Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '13px',
                  color: 'var(--color-text-main)'
                }}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Dietary Tag *
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { id: 'veg', label: 'Veg 🌱', color: 'var(--color-veg)' },
                  { id: 'non_veg', label: 'Non-Veg 🍗', color: '#E74C3C' },
                  { id: 'egg', label: 'Egg 🥚', color: '#F39C12' }
                ].map((d) => (
                  <button
                    type="button"
                    key={d.id}
                    onClick={() => setDietary(d.id as DietaryType)}
                    style={{
                      flex: 1,
                      padding: '8px 2px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: dietary === d.id ? 'var(--color-primary-light)' : 'var(--color-surface-muted)',
                      border: dietary === d.id ? `1.5px solid ${d.color}` : '1px solid var(--color-border)',
                      color: dietary === d.id ? d.color : 'var(--color-text-main)'
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Base Price (₹) *
              </label>
              <input
                type="number"
                placeholder="e.g. 349"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="1"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '13px',
                  color: 'var(--color-text-main)'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Offer Price (Optional)
              </label>
              <input
                type="number"
                placeholder="e.g. 299"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                min="1"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '13px',
                  color: 'var(--color-text-main)'
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Description & Ingredients
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Slow-cooked aromatic basmati rice layered with juicy tender chicken and saffron..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                fontSize: '13px',
                color: 'var(--color-text-main)',
                resize: 'none'
              }}
            />
          </div>

          {/* Image Presets */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Dish Photo
            </label>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '8px' }} className="no-scrollbar">
              {sampleImages.map((s, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setImageUrl(s.url)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: imageUrl === s.url ? 'var(--color-primary)' : 'var(--color-surface-muted)',
                    color: imageUrl === s.url ? '#FFFFFF' : 'var(--color-text-main)',
                    border: '1px solid var(--color-border)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <input
              type="url"
              placeholder="Or paste custom image URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                fontSize: '12px',
                color: 'var(--color-text-main)'
              }}
            />
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-muted)',
                color: 'var(--color-text-main)',
                fontWeight: 700,
                fontSize: '13px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 2,
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              <Sparkles size={16} />
              <span>Save & Publish Dish</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
