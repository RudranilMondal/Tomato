import React, { useState } from 'react';
import { Restaurant, MenuItem, DietaryType } from '../../types';
import { useTomattto } from '../../context/TomatttoContext';
import {
  X,
  Store,
  Percent,
  Power,
  Check,
  Star,
  MapPin,
  Utensils,
  Plus,
  Trash2,
  Edit3,
  Clock,
  DollarSign,
  Leaf,
  Flame,
  Image as ImageIcon,
  Tag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShieldCheck,
  Save,
  Search,
  ChevronRight,
  Filter
} from 'lucide-react';

interface RestaurantManageModalProps {
  restaurant: Restaurant | null;
  onClose: () => void;
  onUpdateCommission: (id: string, rate: number) => void;
  onToggleStatus: (id: string) => void;
}

export const RestaurantManageModal: React.FC<RestaurantManageModalProps> = ({
  restaurant,
  onClose,
  onUpdateCommission,
  onToggleStatus
}) => {
  const {
    updateRestaurantDetails,
    updateMenuItem,
    addMenuItem,
    deleteMenuItem,
    menuStockMap,
    toggleItemStock
  } = useTomattto();

  const [activeTab, setActiveTab] = useState<'profile' | 'menu' | 'operations'>('profile');

  // Restaurant Profile Editable State
  const [name, setName] = useState(restaurant?.name || '');
  const [tagline, setTagline] = useState(restaurant?.tagline || '');
  const [description, setDescription] = useState(restaurant?.description || '');
  const [coverImage, setCoverImage] = useState(restaurant?.coverImage || '');
  const [address, setAddress] = useState(restaurant?.address || '');
  const [cuisines, setCuisines] = useState(restaurant?.cuisines.join(', ') || '');
  const [prepTime, setPrepTime] = useState(restaurant?.prepTimeMinutes || 25);
  const [costForTwo, setCostForTwo] = useState(restaurant?.costForTwo || 400);
  const [isPureVeg, setIsPureVeg] = useState(restaurant?.isPureVeg || false);
  const [commission, setCommission] = useState(restaurant?.commissionRate || 18);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Menu Search & Category Filter
  const [searchMenuQuery, setSearchMenuQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Edit Menu Item State
  const [editingItem, setEditingItem] = useState<{
    categoryId: string;
    item: MenuItem;
  } | null>(null);

  // Add New Menu Item Modal State
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemCategory, setNewItemCategory] = useState(restaurant?.categories[0]?.id || '');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState<number>(220);
  const [newItemDiscountPrice, setNewItemDiscountPrice] = useState<number | undefined>(undefined);
  const [newItemDietary, setNewItemDietary] = useState<DietaryType>('veg');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemImage, setNewItemImage] = useState(
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80'
  );

  if (!restaurant) return null;

  const isSuspended = restaurant.status === 'suspended';

  // Save Restaurant Profile Updates
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateRestaurantDetails(restaurant.id, {
      name: name.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      coverImage: coverImage.trim(),
      address: address.trim(),
      cuisines: cuisines.split(',').map((c) => c.trim()).filter(Boolean),
      prepTimeMinutes: Number(prepTime),
      costForTwo: Number(costForTwo),
      isPureVeg,
      commissionRate: Number(commission)
    });
    onUpdateCommission(restaurant.id, Number(commission));
    setSaveSuccessMsg('Restaurant profile details updated successfully!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Save Edited Menu Item
  const handleSaveItemEdit = () => {
    if (!editingItem) return;
    updateMenuItem(restaurant.id, editingItem.categoryId, editingItem.item.id, {
      name: editingItem.item.name,
      price: Number(editingItem.item.price),
      discountPrice: editingItem.item.discountPrice ? Number(editingItem.item.discountPrice) : undefined,
      description: editingItem.item.description,
      dietary: editingItem.item.dietary,
      imageUrl: editingItem.item.imageUrl
    });
    setEditingItem(null);
    setSaveSuccessMsg('Menu dish updated successfully!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Add New Menu Item Submit
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemCategory) return;

    addMenuItem(restaurant.id, newItemCategory, {
      name: newItemName.trim(),
      price: Number(newItemPrice),
      discountPrice: newItemDiscountPrice ? Number(newItemDiscountPrice) : undefined,
      dietary: newItemDietary,
      description: newItemDesc.trim() || `${newItemName} cooked fresh with premium ingredients.`,
      imageUrl: newItemImage.trim(),
      isInStock: true
    });

    setIsAddingItem(false);
    setNewItemName('');
    setNewItemDesc('');
    setSaveSuccessMsg(`Added "${newItemName}" to the menu!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Filter menu items across categories
  const allCategories = restaurant.categories || [];
  const filteredCategories = allCategories
    .filter((c) => selectedCategoryFilter === 'all' || c.id === selectedCategoryFilter)
    .map((c) => ({
      ...c,
      items: c.items.filter((item) =>
        item.name.toLowerCase().includes(searchMenuQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchMenuQuery.toLowerCase())
      )
    }));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#1E1E24',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #262630 0%, #17171C 100%)',
            padding: '18px 22px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '2px solid var(--color-primary)',
                flexShrink: 0
              }}
            >
              <img src={coverImage || restaurant.coverImage} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>{restaurant.name}</h2>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    backgroundColor: isSuspended ? 'rgba(231, 76, 60, 0.2)' : 'rgba(46, 204, 113, 0.2)',
                    color: isSuspended ? '#E74C3C' : 'var(--color-veg)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    border: `1px solid ${isSuspended ? '#E74C3C' : 'var(--color-veg)'}`
                  }}
                >
                  {isSuspended ? 'OUTLET SUSPENDED' : 'LIVE & ACTIVE'}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    backgroundColor: 'rgba(255, 75, 58, 0.15)',
                    color: 'var(--color-primary)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  {commission}% Take-Rate
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#A5A5B2', margin: '3px 0 0' }}>
                ID: {restaurant.id} • {restaurant.cuisines.join(', ')} • {restaurant.address}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#A5A5B2',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: '#17171C',
            padding: '0 20px'
          }}
        >
          {[
            { id: 'profile', label: 'Store Overview & Details', icon: Store },
            { id: 'menu', label: `Menu Catalog & Dishes (${allCategories.reduce((s, c) => s + c.items.length, 0)})`, icon: Utensils },
            { id: 'operations', label: 'Commercials & Compliance', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 16px',
                  borderBottom: `2.5px solid ${isActive ? 'var(--color-primary)' : 'transparent'}`,
                  backgroundColor: 'transparent',
                  color: isActive ? '#FFFFFF' : '#A5A5B2',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Icon size={14} color={isActive ? 'var(--color-primary)' : '#A5A5B2'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Success Alert Banner */}
        {saveSuccessMsg && (
          <div
            style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(46, 204, 113, 0.15)',
              borderBottom: '1px solid rgba(46, 204, 113, 0.3)',
              color: 'var(--color-veg)',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle2 size={16} />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Modal Body Container */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px'
          }}
          className="no-scrollbar"
        >
          {/* =========================================
              TAB 1: STORE OVERVIEW & EDITABLE PROFILE
              ========================================= */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                {/* Store Name */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      fontSize: '13px'
                    }}
                  />
                </div>

                {/* Tagline */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                    Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Authentic Andhra Spice & Hyderabadi Dum"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      fontSize: '13px'
                    }}
                  />
                </div>

                {/* Cuisines */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                    Cuisines (Comma separated) *
                  </label>
                  <input
                    type="text"
                    value={cuisines}
                    onChange={(e) => setCuisines(e.target.value)}
                    placeholder="e.g. Biryani, North Indian, Andhra"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      fontSize: '13px'
                    }}
                  />
                </div>

                {/* Cover Image URL */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                    Cover Image Photo URL
                  </label>
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      fontSize: '13px'
                    }}
                  />
                </div>

                {/* Prep Time (Minutes) */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                    Average Prep Time (Minutes)
                  </label>
                  <input
                    type="number"
                    value={prepTime}
                    onChange={(e) => setPrepTime(Number(e.target.value))}
                    min={5}
                    max={90}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      fontSize: '13px'
                    }}
                  />
                </div>

                {/* Cost for Two */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                    Cost for Two (₹)
                  </label>
                  <input
                    type="number"
                    value={costForTwo}
                    onChange={(e) => setCostForTwo(Number(e.target.value))}
                    min={50}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Outlet Physical Address & Landmark *
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  About the Outlet & Story
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers about kitchen specialties, history, and awards..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Pure Veg Toggle & Active Status Strip */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isPureVeg}
                    onChange={(e) => setIsPureVeg(e.target.checked)}
                    style={{ accentColor: 'var(--color-veg)', width: '16px', height: '16px' }}
                  />
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>Pure Vegetarian Outlet</span>
                    <span style={{ fontSize: '11px', color: '#A5A5B2', display: 'block' }}>
                      Marks green leaf badge across customer app.
                    </span>
                  </div>
                </label>

                <button
                  type="button"
                  onClick={() => onToggleStatus(restaurant.id)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSuspended ? 'var(--color-veg)' : 'rgba(231, 76, 60, 0.2)',
                    color: isSuspended ? '#FFFFFF' : '#FF6B6B',
                    border: `1px solid ${isSuspended ? 'var(--color-veg)' : '#E74C3C'}`,
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {isSuspended ? 'Reactivate Store' : 'Suspend Outlet'}
                </button>
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: 'var(--shadow-glow)',
                    cursor: 'pointer'
                  }}
                >
                  <Save size={15} />
                  <span>Save Restaurant Details</span>
                </button>
              </div>
            </form>
          )}

          {/* =========================================
              TAB 2: MENU CATALOG & DISH MANAGEMENT
              ========================================= */}
          {activeTab === 'menu' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Menu Search and Add Dish Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
                  <div
                    style={{
                      position: 'relative',
                      flex: 1
                    }}
                  >
                    <Search
                      size={14}
                      color="#A5A5B2"
                      style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <input
                      type="text"
                      placeholder="Search dishes by name or ingredients..."
                      value={searchMenuQuery}
                      onChange={(e) => setSearchMenuQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 30px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#FFFFFF',
                        fontSize: '12px'
                      }}
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#17171C',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      fontSize: '12px'
                    }}
                  >
                    <option value="all">All Categories</option>
                    {allCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.items.length})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingItem(true)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: 'var(--shadow-glow)',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={15} />
                  <span>Add New Dish</span>
                </button>
              </div>

              {/* Categories & Dishes List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {filteredCategories.map((cat) => (
                  <div
                    key={cat.id}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                        {cat.name} ({cat.items.length})
                      </h4>
                      <span style={{ fontSize: '10px', color: '#A5A5B2' }}>Category ID: {cat.id}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {cat.items.map((item) => {
                        const inStock = menuStockMap[item.id] !== undefined ? menuStockMap[item.id] : item.isInStock;

                        return (
                          <div
                            key={item.id}
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.03)',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              padding: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                              opacity: inStock ? 1 : 0.65
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  borderRadius: '6px',
                                  overflow: 'hidden',
                                  backgroundColor: '#000',
                                  flexShrink: 0
                                }}
                              >
                                <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span
                                    style={{
                                      width: '10px',
                                      height: '10px',
                                      borderRadius: '2px',
                                      border: `1.5px solid ${item.dietary === 'veg' ? 'var(--color-veg)' : '#E74C3C'}`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <span
                                      style={{
                                        width: '4px',
                                        height: '4px',
                                        borderRadius: '50%',
                                        backgroundColor: item.dietary === 'veg' ? 'var(--color-veg)' : '#E74C3C'
                                      }}
                                    />
                                  </span>

                                  <h5 style={{ fontSize: '13px', fontWeight: 800, margin: 0, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.name}
                                  </h5>

                                  {item.isBestseller && (
                                    <span style={{ fontSize: '9px', fontWeight: 800, backgroundColor: 'rgba(243, 156, 18, 0.2)', color: '#F39C12', padding: '1px 5px', borderRadius: '3px' }}>
                                      BESTSELLER
                                    </span>
                                  )}
                                </div>

                                <p style={{ fontSize: '11px', color: '#A5A5B2', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {item.description}
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', fontSize: '12px' }}>
                                  <span style={{ fontWeight: 800, color: 'var(--color-veg)' }}>₹{item.price}</span>
                                  {item.discountPrice && (
                                    <span style={{ fontSize: '10px', textDecoration: 'line-through', color: '#8E8E93' }}>
                                      ₹{item.discountPrice}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons: Stock Toggle, Edit, Delete */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => toggleItemStock(item.id)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: inStock ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                                  color: inStock ? 'var(--color-veg)' : '#E74C3C',
                                  border: `1px solid ${inStock ? 'var(--color-veg)' : '#E74C3C'}`,
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  cursor: 'pointer'
                                }}
                              >
                                {inStock ? 'In Stock' : 'Out of Stock'}
                              </button>

                              <button
                                type="button"
                                onClick={() => setEditingItem({ categoryId: cat.id, item })}
                                style={{
                                  padding: '6px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'rgba(255,255,255,0.06)',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                                title="Edit Dish Details"
                              >
                                <Edit3 size={14} />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete "${item.name}" from the menu?`)) {
                                    deleteMenuItem(restaurant.id, cat.id, item.id);
                                  }
                                }}
                                style={{
                                  padding: '6px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'rgba(231, 76, 60, 0.15)',
                                  color: '#E74C3C',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                                title="Delete Dish"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================
              TAB 3: COMMERCIALS & COMPLIANCE
              ========================================= */}
          {activeTab === 'operations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Platform Commission Take-Rate */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
                  Platform Commission Take-Rate
                </h4>
                <p style={{ fontSize: '11px', color: '#A5A5B2', marginBottom: '14px' }}>
                  Percentage fee charged on the net food billing prior to customer taxes and delivery fees.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {[15, 18, 20, 25].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => {
                        setCommission(rate);
                        onUpdateCommission(restaurant.id, rate);
                      }}
                      style={{
                        padding: '12px 6px',
                        borderRadius: 'var(--radius-sm)',
                        border: commission === rate ? '1.5px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: commission === rate ? 'rgba(255, 75, 58, 0.15)' : 'rgba(255,255,255,0.03)',
                        color: commission === rate ? 'var(--color-primary)' : '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Legal & Regulatory Compliance */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <ShieldCheck size={18} color="var(--color-veg)" />
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                    FSSAI & Statutory Food Safety Certification
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#A5A5B2', fontSize: '11px' }}>FSSAI License Number:</span>
                    <div style={{ fontWeight: 700, fontFamily: 'monospace', color: '#FFFFFF', marginTop: '2px' }}>
                      11220334001928 (Verified ✓)
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#A5A5B2', fontSize: '11px' }}>GSTIN Registration:</span>
                    <div style={{ fontWeight: 700, fontFamily: 'monospace', color: '#FFFFFF', marginTop: '2px' }}>
                      29AAAAA0000A1Z5
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#A5A5B2', fontSize: '11px' }}>Kitchen Hygiene Audit:</span>
                    <div style={{ fontWeight: 700, color: 'var(--color-veg)', marginTop: '2px' }}>
                      Grade A+ (Last Inspected: Oct 2026)
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#A5A5B2', fontSize: '11px' }}>Daily Order Cap:</span>
                    <div style={{ fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                      Unlimited (Auto Kitchen Dispatch)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 22px',
            backgroundColor: '#17171C',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '11px', color: '#A5A5B2' }}>
            Outlet Management Console • Tomattto HQ Ops
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '8px 22px',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 800,
              fontSize: '12px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Close Console
          </button>
        </div>
      </div>

      {/* ===================================================
          SUB-MODAL 1: EDIT MENU ITEM MODAL
          =================================================== */}
      {editingItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setEditingItem(null)}
        >
          <div
            style={{
              backgroundColor: '#1E1E24',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              maxWidth: '460px',
              width: '100%',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: 'var(--shadow-xl)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Edit Dish Details</h3>
              <button
                onClick={() => setEditingItem(null)}
                style={{ background: 'transparent', border: 'none', color: '#A5A5B2', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#A5A5B2', display: 'block', marginBottom: '4px' }}>
                  Dish Title
                </label>
                <input
                  type="text"
                  value={editingItem.item.name}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      item: { ...editingItem.item, name: e.target.value }
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '12px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#A5A5B2', display: 'block', marginBottom: '4px' }}>
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editingItem.item.price}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        item: { ...editingItem.item, price: Number(e.target.value) }
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      fontSize: '12px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#A5A5B2', display: 'block', marginBottom: '4px' }}>
                    Discount / Original Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editingItem.item.discountPrice || ''}
                    placeholder="Optional"
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        item: {
                          ...editingItem.item,
                          discountPrice: e.target.value ? Number(e.target.value) : undefined
                        }
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      fontSize: '12px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#A5A5B2', display: 'block', marginBottom: '4px' }}>
                  Dietary Classification
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['veg', 'non_veg', 'egg'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() =>
                        setEditingItem({
                          ...editingItem,
                          item: { ...editingItem.item, dietary: d }
                        })
                      }
                      style={{
                        flex: 1,
                        padding: '6px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: editingItem.item.dietary === d ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      {d.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#A5A5B2', display: 'block', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingItem.item.description}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      item: { ...editingItem.item, description: e.target.value }
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '12px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#A5A5B2', display: 'block', marginBottom: '4px' }}>
                  Dish Photo URL
                </label>
                <input
                  type="text"
                  value={editingItem.item.imageUrl}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      item: { ...editingItem.item, imageUrl: e.target.value }
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '12px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveItemEdit}
                style={{
                  padding: '7px 18px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-veg)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          SUB-MODAL 2: ADD NEW DISH MODAL
          =================================================== */}
      {isAddingItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setIsAddingItem(false)}
        >
          <form
            onSubmit={handleAddNewItem}
            style={{
              backgroundColor: '#1E1E24',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              maxWidth: '460px',
              width: '100%',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: 'var(--shadow-xl)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Add New Menu Item</h3>
              <button
                type="button"
                onClick={() => setIsAddingItem(false)}
                style={{ background: 'transparent', border: 'none', color: '#A5A5B2', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#A5A5B2', display: 'block', marginBottom: '4px' }}>
                  Target Menu Category *
                </label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#17171C',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '12px'
                  }}
                >
                  {allCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#A5A5B2', display: 'block', marginBottom: '4px' }}>
                  Dish Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Special Hyderabadi Dum Biryani"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '12px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#A5A5B2', display: 'block', marginBottom: '4px' }}>
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(Number(e.target.value))}
                    min={10}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      fontSize: '12px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#A5A5B2', display: 'block', marginBottom: '4px' }}>
                    Discount Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Optional"
                    value={newItemDiscountPrice || ''}
                    onChange={(e) => setNewItemDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      fontSize: '12px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#A5A5B2', display: 'block', marginBottom: '4px' }}>
                  Dietary Classification
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['veg', 'non_veg', 'egg'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setNewItemDietary(d)}
                      style={{
                        flex: 1,
                        padding: '6px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: newItemDietary === d ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      {d.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#A5A5B2', display: 'block', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, preparation style, portion size..."
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '12px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#A5A5B2', display: 'block', marginBottom: '4px' }}>
                  Dish Photo Image URL
                </label>
                <input
                  type="text"
                  value={newItemImage}
                  onChange={(e) => setNewItemImage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '12px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setIsAddingItem(false)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '7px 18px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Add Dish to Menu
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
