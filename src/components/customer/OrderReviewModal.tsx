import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { X, Star, Camera, Check, Heart, Sparkles } from 'lucide-react';

interface OrderReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
}

export const OrderReviewModal: React.FC<OrderReviewModalProps> = ({ isOpen, onClose, orderId }) => {
  const { currentOrder, allOrders, submitOrderReview, getOrderReview } = useTomattto();

  const targetOrder = (orderId ? allOrders.find((o) => o.id === orderId) : null) || currentOrder;
  const existingReview = targetOrder ? getOrderReview(targetOrder.id) : undefined;

  const [restaurantRating, setRestaurantRating] = useState<number>(existingReview?.restaurantRating || 5);
  const [riderRating, setRiderRating] = useState<number>(existingReview?.riderRating || 5);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    existingReview?.tags || ['♨️ Steaming Hot', '⚡ Fast Delivery']
  );
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isPhotoUploaded, setIsPhotoUploaded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const availableTags = [
    '♨️ Steaming Hot',
    '⚡ Fast Delivery',
    '🍱 Spill-proof Packaging',
    '😋 Delicious Taste',
    '🛵 Courteous Rider',
    '🥬 Super Fresh Veg',
    '🌶️ Perfectly Spiced'
  ];

  if (!isOpen || !targetOrder) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitOrderReview(targetOrder.id, restaurantRating, riderRating, selectedTags, comment);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)',
          maxHeight: '90%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.25s ease',
          overflowY: 'auto'
        }}
        className="no-scrollbar"
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Rate Your Feast</h3>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Order {targetOrder.id} • {targetOrder.restaurant.name}
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

        {isSubmitted ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-veg-bg)',
                color: 'var(--color-veg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '28px'
              }}
            >
              🎉
            </div>
            <h4 style={{ fontSize: '17px', fontWeight: 800 }}>Thank You for Your Feedback!</h4>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
              Your review helps {targetOrder.restaurant.name} and delivery partners improve quality.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Food & Restaurant Rating */}
            <div
              style={{
                backgroundColor: 'var(--color-bg)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                Food & Restaurant Quality
              </span>
              <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '4px 0 10px' }}>
                {targetOrder.restaurant.name}
              </h4>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRestaurantRating(star)}
                    style={{
                      padding: '4px',
                      color: star <= restaurantRating ? '#FFB400' : 'var(--color-border)',
                      transition: 'transform 0.15s ease',
                      transform: star <= restaurantRating ? 'scale(1.15)' : 'scale(1)'
                    }}
                  >
                    <Star size={28} fill={star <= restaurantRating ? '#FFB400' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Partner Rating */}
            <div
              style={{
                backgroundColor: 'var(--color-bg)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Delivery Partner</span>
                <h4 style={{ fontSize: '14px', fontWeight: 800 }}>
                  {targetOrder.rider?.name || 'Vikram Singh'}
                </h4>
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRiderRating(star)}
                    style={{
                      padding: '2px',
                      color: star <= riderRating ? '#FFB400' : 'var(--color-border)'
                    }}
                  >
                    <Star size={20} fill={star <= riderRating ? '#FFB400' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            {/* Compliment Tags */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                What did you love the most?
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface-muted)',
                        color: isSelected ? 'var(--color-primary)' : 'var(--color-text-main)',
                        border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Review Comment Input */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Write your review (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Tell others how was the taste, portion size, and presentation..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
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

            {/* Simulated Photo Attachment */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setIsPhotoUploaded(!isPhotoUploaded)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isPhotoUploaded ? 'var(--color-veg-bg)' : 'var(--color-surface-muted)',
                  color: isPhotoUploaded ? 'var(--color-veg)' : 'var(--color-text-main)',
                  border: '1px dashed var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 700
                }}
              >
                <Camera size={16} />
                <span>{isPhotoUploaded ? 'Photo Attached (1)' : 'Add Food Photo'}</span>
              </button>

              {isPhotoUploaded && (
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: '1.5px solid var(--color-veg)'
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100&auto=format&fit=crop&q=80"
                    alt="Review attachment"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                marginTop: '6px',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '14px',
                boxShadow: 'var(--shadow-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={16} />
              <span>Submit Rating & Review</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
