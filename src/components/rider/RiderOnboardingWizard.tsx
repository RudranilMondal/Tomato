import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import {
  RiderOnboardingApplication,
  RiderKycDocuments,
  RiderBankDetails,
  RiderVehicleType
} from '../../types';
import { supabase } from '../../lib/supabase';
import {
  User,
  Bike,
  FileText,
  CheckCircle2,
  AlertCircle,
  Camera,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock,
  Building2,
  CreditCard,
  RotateCcw,
  ShieldCheck,
  Eye,
  Check,
  Zap,
  Info,
  Search,
  ChevronDown,
  X,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  getStateNames,
  getDistricts,
  getCities,
  getAllCitiesForState
} from '../../data/indiaLocations';
import { lookupPincode } from '../../utils/pincodeLookup';

interface RiderOnboardingWizardProps {
  onBack?: () => void;
  onSuccess?: (applicationRef: string) => void;
  initialStep?: 1 | 2 | 3 | 4;
}

const DEFAULT_SAMPLE_DOCS: RiderKycDocuments = {
  aadhaarFront: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
  aadhaarBack: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
  panFront: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
  panBack: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
  drivingLicenseFront: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
  drivingLicenseBack: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
  vehicleRc: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
  bankProof: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80'
};

// Reusable Searchable Select Component for India Locations
interface SearchableSelectProps {
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  onChange: (val: string) => void;
  badge?: string;
  emptyMessage?: string;
  allowManualFallback?: boolean;
  onSelectManualFallback?: () => void;
  id?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  value,
  options,
  placeholder,
  searchPlaceholder = 'Search...',
  disabled = false,
  error,
  required = false,
  onChange,
  badge,
  emptyMessage = 'No options available',
  allowManualFallback = false,
  onSelectManualFallback,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, search]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }} id={id}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label style={{ fontSize: '11px', fontWeight: 700, color: '#E5E7EB' }}>
          {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
        </label>
        {badge && (
          <span style={{ fontSize: '10px', color: '#9CA3AF', backgroundColor: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
            {badge}
          </span>
        )}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        style={{
          width: '100%',
          padding: '11px 12px',
          borderRadius: '10px',
          backgroundColor: disabled ? '#17171C' : '#1E1E24',
          border: `1px solid ${error ? '#EF4444' : isOpen ? 'var(--color-primary, #FF4B3A)' : 'rgba(255, 255, 255, 0.12)'}`,
          color: value ? '#FFFFFF' : '#9CA3AF',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          textAlign: 'left',
          opacity: disabled ? 0.6 : 1
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={14}
          style={{
            color: '#9CA3AF',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
            flexShrink: 0
          }}
        />
      </button>

      {error && <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{error}</div>}

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 60,
            backgroundColor: '#1E1E24',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '10px',
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.6)',
            overflow: 'hidden'
          }}
        >
          {/* Search Input Bar */}
          <div
            style={{
              padding: '8px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Search size={13} style={{ color: '#9CA3AF', flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '12px',
                outline: 'none'
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', fontSize: '11px', color: '#9CA3AF' }}>
                <div>{emptyMessage}</div>
                {allowManualFallback && onSelectManualFallback && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onSelectManualFallback();
                    }}
                    style={{
                      marginTop: '8px',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255, 75, 58, 0.15)',
                      border: '1px solid rgba(255, 75, 58, 0.3)',
                      color: 'var(--color-primary, #FF4B3A)',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Enter Manually
                  </button>
                )}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt === value;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      textAlign: 'left',
                      backgroundColor: isSelected ? 'rgba(255, 75, 58, 0.15)' : 'transparent',
                      color: isSelected ? 'var(--color-primary, #FF4B3A)' : '#E5E7EB',
                      fontSize: '12px',
                      fontWeight: isSelected ? 700 : 500,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span>{opt}</span>
                    {isSelected && <Check size={12} />}
                  </button>
                );
              })
            )}
          </div>

          {/* Manual Fallback Footer */}
          {allowManualFallback && onSelectManualFallback && (
            <div
              style={{
                padding: '8px 12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Not in list?</span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onSelectManualFallback();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60A5FA',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                + Enter Manually
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const RiderOnboardingWizard: React.FC<RiderOnboardingWizardProps> = ({
  onBack,
  onSuccess,
  initialStep = 1
}) => {
  const {
    submitRiderOnboarding,
    persistedRiderApp,
    supabaseUser,
    activeRiderApplicant
  } = useTomattto();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(initialStep);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);

  // Application Reference
  const [applicationRef] = useState<string>(
    persistedRiderApp?.application_ref || `APP-RDR-${Math.floor(1000 + Math.random() * 9000)}`
  );

  // ==========================================
  // STEP 1: PERSONAL DETAILS STATE
  // ==========================================
  const [fullName, setFullName] = useState(persistedRiderApp?.full_name || '');
  const [profilePhoto, setProfilePhoto] = useState<string>(
    persistedRiderApp?.metadata?.profile_photo ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  );
  const [phone, setPhone] = useState(
    persistedRiderApp?.phone || activeRiderApplicant?.phone || supabaseUser?.phone || ''
  );
  const [email, setEmail] = useState(
    persistedRiderApp?.email || supabaseUser?.email || ''
  );
  const [dob, setDob] = useState(persistedRiderApp?.metadata?.dob || '1998-06-15');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(
    persistedRiderApp?.metadata?.gender || 'Male'
  );
  const [address, setAddress] = useState(
    persistedRiderApp?.metadata?.residential_address || ''
  );
  const [state, setState] = useState(persistedRiderApp?.metadata?.state || '');
  const [district, setDistrict] = useState(persistedRiderApp?.metadata?.district || '');
  const [city, setCity] = useState(persistedRiderApp?.city || '');
  const [isManualCity, setIsManualCity] = useState(false);
  const [pincode, setPincode] = useState(persistedRiderApp?.metadata?.pincode || '');
  const [bloodGroup, setBloodGroup] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-'>(
    persistedRiderApp?.metadata?.blood_group || 'O+'
  );
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [pincodeLookupStatus, setPincodeLookupStatus] = useState<'idle' | 'detecting' | 'success' | 'not_found'>(
    persistedRiderApp?.metadata?.pincode ? 'success' : 'idle'
  );
  const latestPincodeRequestRef = useRef<string>(persistedRiderApp?.metadata?.pincode || '');

  // Dynamic Location Lists based on Official Hierarchy
  const stateNames = useMemo(() => getStateNames(), []);
  const availableDistricts = useMemo(() => getDistricts(state), [state]);
  const availableCities = useMemo(() => {
    if (district) {
      return getCities(state, district);
    }
    return getAllCitiesForState(state);
  }, [state, district]);

  // Handle PIN Code changes with auto-detection of State & District ONLY
  // CRITICAL RULE: City/Town is NEVER auto-populated from PIN code!
  // CRITICAL RULE: Never guess an ambiguous district!
  const handlePincodeChange = async (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setPincode(cleaned);
    latestPincodeRequestRef.current = cleaned;

    if (cleaned.length < 6) {
      setPincodeLookupStatus('idle');
      // If user cleared the PIN code, reset detected location to prevent stale display
      if (cleaned.length === 0) {
        setState('');
        setDistrict('');
        setCity('');
        setIsManualCity(false);
      }
      return;
    }

    setIsPincodeLoading(true);
    setPincodeLookupStatus('detecting');

    try {
      const result = await lookupPincode(cleaned);

      // Prevent race conditions: Ignore response if user typed a newer PIN in the meantime
      if (latestPincodeRequestRef.current !== cleaned) {
        return;
      }

      if (result && result.state) {
        setState(result.state);
        if (result.district) {
          setDistrict(result.district);
        } else {
          // Ambiguous district: Do not guess, leave empty for manual selection
          setDistrict('');
        }
        // CRITICAL REQUIREMENT: Keep City/Town completely independent and empty!
        setCity('');
        setIsManualCity(false);
        setPincodeLookupStatus('success');

        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.pincode;
          delete copy.state;
          if (result.district) delete copy.district;
          return copy;
        });
      } else {
        // PIN not found in database or API - non-blocking! Allow manual selection
        setPincodeLookupStatus('not_found');
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.pincode;
          return copy;
        });
      }
    } catch {
      if (latestPincodeRequestRef.current === cleaned) {
        setPincodeLookupStatus('not_found');
      }
    } finally {
      if (latestPincodeRequestRef.current === cleaned) {
        setIsPincodeLoading(false);
      }
    }
  };

  // Dynamic cascade reset handlers
  const handleStateChange = (selectedState: string) => {
    setState(selectedState);
    setDistrict('');
    setCity('');
    setIsManualCity(false);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.state;
      delete copy.district;
      delete copy.city;
      return copy;
    });
  };

  const handleDistrictChange = (selectedDistrict: string) => {
    setDistrict(selectedDistrict);
    setCity('');
    setIsManualCity(false);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.district;
      delete copy.city;
      return copy;
    });
  };

  const handleCityChange = (selectedCity: string) => {
    setCity(selectedCity);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.city;
      return copy;
    });
  };

  // ==========================================
  // STEP 2: VEHICLE DETAILS STATE
  // ==========================================
  const [vehicleType, setVehicleType] = useState<RiderVehicleType>(
    (persistedRiderApp?.vehicle_type as RiderVehicleType) || 'Motorcycle'
  );
  const [vehicleNumber, setVehicleNumber] = useState(
    persistedRiderApp?.vehicle_number || ''
  );
  const [vehicleModel, setVehicleModel] = useState(
    persistedRiderApp?.metadata?.vehicle_model || 'Hero Splendor Plus'
  );
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState(
    persistedRiderApp?.driving_license_number || ''
  );
  const [emergencyContactName, setEmergencyContactName] = useState(
    persistedRiderApp?.emergency_contact_name || ''
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    persistedRiderApp?.emergency_contact_phone || ''
  );

  // ==========================================
  // STEP 3: KYC & DOCUMENTS STATE
  // ==========================================
  const [documents, setDocuments] = useState<RiderKycDocuments>({
    aadhaarFront: null,
    aadhaarBack: null,
    panFront: null,
    panBack: null,
    drivingLicenseFront: null,
    drivingLicenseBack: null,
    vehicleRc: null,
    bankProof: null
  });

  // ==========================================
  // STEP 4: BANK & CONSENT STATE
  // ==========================================
  const [bankDetails, setBankDetails] = useState<RiderBankDetails>({
    accountHolderName: fullName || 'Delivery Partner',
    bankName: 'HDFC Bank',
    accountNumber: '50100294819283',
    ifscCode: 'HDFC0000140',
    upiId: `${phone.replace(/\D/g, '').slice(-10) || 'rider'}@okhdfcbank`
  });
  const [consentDataAccuracy, setConsentDataAccuracy] = useState(true);
  const [consentTerms, setConsentTerms] = useState(true);

  // Keep Bank Account Holder synced with Full Name
  useEffect(() => {
    if (fullName) {
      setBankDetails((prev) => ({ ...prev, accountHolderName: fullName }));
    }
  }, [fullName]);

  // Autofill with High-Fidelity Verified Sample Data for quick evaluation
  const handleAutofillSample = () => {
    setFullName('Rajesh Kumar');
    setPhone('+91 98765 43210');
    setEmail('rajesh.kumar@example.com');
    setDob('1997-04-12');
    setGender('Male');
    setAddress('Flat 204, Green Glen Layout, Bellandur, Outer Ring Road');
    setState('Karnataka');
    setDistrict('Bengaluru Urban');
    setCity('Bengaluru');
    setIsManualCity(false);
    setPincode('560103');
    setPincodeLookupStatus('success');
    setVehicleType('Motorcycle');
    setVehicleNumber('KA 01 EK 8821');
    setVehicleModel('Honda Shine 125');
    setDrivingLicenseNumber('KA01 20180004921');
    setEmergencyContactName('Sunita Kumar');
    setEmergencyContactPhone('+91 98451 22334');
    setDocuments(DEFAULT_SAMPLE_DOCS);
    setBankDetails({
      accountHolderName: 'Rajesh Kumar',
      bankName: 'State Bank of India',
      accountNumber: '38291049281',
      ifscCode: 'SBIN0004052',
      upiId: 'rajesh.kumar@oksbi'
    });
    setErrors({});
  };

  // Helper to handle document upload / preview
  const handleDocUpload = (key: keyof RiderKycDocuments, file: File) => {
    const url = URL.createObjectURL(file);
    setDocuments((prev) => ({ ...prev, [key]: url }));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  // ==========================================
  // VALIDATION PER STEP
  // ==========================================
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full Name is required';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Valid 10-digit phone number is required';
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!address.trim()) errs.address = 'Complete address is required';
    if (!state.trim()) errs.state = 'State / Union Territory is required';
    if (availableDistricts.length > 0 && !district.trim()) {
      errs.district = 'District is required';
    }
    if (!city.trim()) errs.city = 'City / Town is required';
    if (!pincode.trim() || !/^\d{6}$/.test(pincode.trim())) {
      errs.pincode = 'Valid 6-digit Indian PIN code required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (vehicleType !== 'Bicycle') {
      if (!vehicleNumber.trim()) errs.vehicleNumber = 'Vehicle Registration Number is required';
      if (!drivingLicenseNumber.trim()) {
        errs.drivingLicenseNumber = 'Driving License Number is required for motorized vehicles';
      }
    }
    if (!emergencyContactPhone.trim() || emergencyContactPhone.replace(/\D/g, '').length < 10) {
      errs.emergencyContactPhone = 'Emergency contact number (10-digits) is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!documents.aadhaarFront) errs.aadhaarFront = 'Aadhaar Card Front photo required';
    if (!documents.panFront) errs.panFront = 'PAN Card photo required';
    if (vehicleType !== 'Bicycle') {
      if (!documents.drivingLicenseFront) {
        errs.drivingLicenseFront = 'Driving License Front photo required';
      }
      if (!documents.vehicleRc) {
        errs.vehicleRc = 'Vehicle RC document photo required';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    } else if (step === 3) {
      if (validateStep3()) setStep(4);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentDataAccuracy || !consentTerms) {
      setErrors({ consent: 'You must accept the declaration and terms of service to proceed.' });
      return;
    }

    setIsSubmitting(true);

    const appData = {
      applicationRef,
      fullName: fullName.trim(),
      profilePhoto,
      phone: phone.trim(),
      email: email.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      district: district.trim() || undefined,
      pincode: pincode.trim(),
      vehicleType,
      vehicleNumber: vehicleNumber.trim() || undefined,
      vehicleModel: vehicleModel.trim() || undefined,
      drivingLicenseNumber: drivingLicenseNumber.trim() || undefined,
      emergencyContactName: emergencyContactName.trim() || undefined,
      emergencyContactPhone: emergencyContactPhone.trim() || undefined,
      residentialAddress: address.trim(),
      bloodGroup,
      gender,
      dob,
      documents,
      bankDetails
    };

    // Simulated short network delay for polished UX
    await new Promise((r) => setTimeout(r, 600));

    submitRiderOnboarding(appData);
    setIsSubmitting(false);
    setSubmissionComplete(true);

    try {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch {}

    if (onSuccess) {
      onSuccess(applicationRef);
    }
  };

  // ==========================================
  // CONFIRMATION SCREEN AFTER SUBMISSION
  // ==========================================
  if (submissionComplete) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100%',
          padding: '30px 20px',
          textAlign: 'center',
          backgroundColor: '#121216',
          color: '#FFFFFF'
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'rgba(46, 204, 113, 0.15)',
            border: '2px solid var(--color-veg, #2ECC71)',
            color: 'var(--color-veg, #2ECC71)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '18px',
            boxShadow: '0 0 24px rgba(46, 204, 113, 0.25)'
          }}
        >
          <CheckCircle2 size={40} />
        </div>

        <span
          style={{
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: 'var(--color-veg, #2ECC71)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full, 9999px)',
            backgroundColor: 'rgba(46, 204, 113, 0.12)',
            marginBottom: '10px'
          }}
        >
          Submitted Successfully
        </span>

        <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '8px' }}>
          Application Received!
        </h2>

        <p style={{ fontSize: '13px', color: '#9CA3AF', maxWidth: '320px', lineHeight: 1.5, marginBottom: '20px' }}>
          Thank you for applying to join the Tomattto Delivery Fleet. Our operations team is reviewing your KYC and vehicle documents.
        </p>

        {/* Application Ref Badge */}
        <div
          style={{
            padding: '14px 20px',
            borderRadius: '12px',
            backgroundColor: '#1E1E24',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            marginBottom: '24px',
            width: '100%',
            maxWidth: '320px'
          }}
        >
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>
            Application Reference Number
          </div>
          <div style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'monospace', color: 'var(--color-primary, #FF4B3A)' }}>
            {applicationRef}
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
            Save this reference to track your verification
          </div>
        </div>

        <button
          onClick={() => {
            if (onBack) onBack();
          }}
          style={{
            width: '100%',
            maxWidth: '320px',
            padding: '14px',
            borderRadius: '12px',
            backgroundColor: 'var(--color-primary, #FF4B3A)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Track Application Status
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        backgroundColor: '#121216',
        color: '#FFFFFF',
        padding: '18px 16px',
        overflowY: 'auto'
      }}
    >
      {/* Top Bar Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}
      >
        <button
          onClick={() => {
            if (step > 1) setStep((s) => (s - 1) as any);
            else if (onBack) onBack();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#9CA3AF',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '4px 0'
          }}
        >
          <ArrowLeft size={16} />
          <span>{step > 1 ? 'Previous Step' : 'Cancel'}</span>
        </button>

        <button
          onClick={handleAutofillSample}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 75, 58, 0.1)',
            border: '1px dashed rgba(255, 75, 58, 0.4)',
            color: 'var(--color-primary, #FF4B3A)',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer'
          }}
          title="Autofill form with high-fidelity sample data for rapid testing"
        >
          <Sparkles size={13} />
          <span>Autofill Sample</span>
        </button>
      </div>

      {/* 4-Step Progress Indicator */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          {[
            { num: 1, label: 'Personal' },
            { num: 2, label: 'Vehicle' },
            { num: 3, label: 'KYC Docs' },
            { num: 4, label: 'Review' }
          ].map((s) => {
            const isCurrent = step === s.num;
            const isDone = step > s.num;
            return (
              <div
                key={s.num}
                onClick={() => {
                  if (isDone) setStep(s.num as any);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  cursor: isDone ? 'pointer' : 'default'
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: isDone
                      ? 'var(--color-veg, #2ECC71)'
                      : isCurrent
                      ? 'var(--color-primary, #FF4B3A)'
                      : '#272730',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '4px',
                    border: isCurrent ? '2px solid rgba(255, 75, 58, 0.4)' : 'none'
                  }}
                >
                  {isDone ? <Check size={14} /> : s.num}
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: isCurrent ? 800 : 600,
                    color: isCurrent ? '#FFFFFF' : isDone ? 'var(--color-veg, #2ECC71)' : '#6B7280'
                  }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar Line */}
        <div
          style={{
            height: '4px',
            backgroundColor: '#272730',
            borderRadius: '2px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${(step / 4) * 100}%`,
              backgroundColor: 'var(--color-primary, #FF4B3A)',
              transition: 'width 0.25s ease'
            }}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: PERSONAL DETAILS                                                  */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '4px' }}>
              Step 1: Personal Details
            </h2>
            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
              Enter your legal personal details as they appear on your government ID.
            </p>
          </div>

          {/* Profile Photo Upload / Selector */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: '#1E1E24',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid var(--color-primary, #FF4B3A)',
                flexShrink: 0
              }}
            >
              <img
                src={profilePhoto}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '2px' }}>
                Profile Photograph
              </div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px' }}>
                Clear face shot without sunglasses/mask
              </div>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Camera size={12} />
                <span>Change Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setProfilePhoto(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#E5E7EB', marginBottom: '6px' }}>
              Full Name (as per Aadhaar/PAN) *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Vikram Singh"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: '#1E1E24',
                border: `1px solid ${errors.fullName ? '#EF4444' : 'rgba(255, 255, 255, 0.12)'}`,
                color: '#FFFFFF',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            {errors.fullName && <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.fullName}</div>}
          </div>

          {/* Phone & Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#E5E7EB', marginBottom: '6px' }}>
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98451 92831"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#1E1E24',
                  border: `1px solid ${errors.phone ? '#EF4444' : 'rgba(255, 255, 255, 0.12)'}`,
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              {errors.phone && <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.phone}</div>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#E5E7EB', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rider@example.com"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#1E1E24',
                  border: `1px solid ${errors.email ? '#EF4444' : 'rgba(255, 255, 255, 0.12)'}`,
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              {errors.email && <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.email}</div>}
            </div>
          </div>

          {/* DOB & Gender */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#E5E7EB', marginBottom: '6px' }}>
                Date of Birth *
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#1E1E24',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#E5E7EB', marginBottom: '6px' }}>
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#1E1E24',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Complete Address */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#E5E7EB', marginBottom: '6px' }}>
              Complete Residential Address *
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House/Flat number, Street, Landmark"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: '#1E1E24',
                border: `1px solid ${errors.address ? '#EF4444' : 'rgba(255, 255, 255, 0.12)'}`,
                color: '#FFFFFF',
                fontSize: '13px',
                outline: 'none',
                resize: 'none'
              }}
            />
            {errors.address && <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.address}</div>}
          </div>

          {/* PIN Code with Auto-Detection of State & District */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#E5E7EB' }}>
                PIN Code <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isPincodeLoading && (
                  <span style={{ fontSize: '11px', color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Loader2 size={12} className="animate-spin" /> Detecting State & District...
                  </span>
                )}
                {!isPincodeLoading && pincodeLookupStatus === 'success' && (
                  <span style={{ fontSize: '11px', color: 'var(--color-veg, #2ECC71)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <CheckCircle2 size={12} /> {district ? `Auto-detected: ${district}, ${state}` : `Auto-detected State: ${state} (Select District below)`}
                  </span>
                )}
                {!isPincodeLoading && pincodeLookupStatus === 'not_found' && pincode.length === 6 && (
                  <span style={{ fontSize: '11px', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Info size={12} /> Select State & District manually
                  </span>
                )}
                <span style={{ fontSize: '10px', color: '#9CA3AF' }}>6 Digits</span>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                placeholder="Enter 6-digit Indian PIN (e.g. 560038, 110001, 700001)"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#1E1E24',
                  border: `1px solid ${errors.pincode ? '#EF4444' : pincodeLookupStatus === 'success' ? 'rgba(46, 204, 113, 0.5)' : 'rgba(255, 255, 255, 0.12)'}`,
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              {isPincodeLoading && (
                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                  <Loader2 size={16} color="#60A5FA" className="animate-spin" />
                </div>
              )}
            </div>
            {errors.pincode && <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.pincode}</div>}
            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
              Entering a valid PIN automatically populates State and District. City/Town remains independent for manual entry.
            </div>
          </div>

          {/* Location Hierarchy: State/UT -> District (Auto-detected from PIN or Manually Selectable) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <SearchableSelect
              label="State / Union Territory"
              value={state}
              options={stateNames}
              placeholder="Select State or UT"
              searchPlaceholder="Search 28 States & 8 UTs..."
              badge="28 States & 8 UTs"
              required
              error={errors.state}
              onChange={handleStateChange}
            />

            <SearchableSelect
              label="District"
              value={district}
              options={availableDistricts}
              placeholder={state ? "Select District" : "Enter PIN or select State"}
              searchPlaceholder={`Search districts in ${state || 'state'}...`}
              badge={availableDistricts.length > 0 ? `${availableDistricts.length} districts` : undefined}
              disabled={!state || availableDistricts.length === 0}
              required={availableDistricts.length > 0}
              error={errors.district}
              emptyMessage={state ? "No districts found for this state" : "Please select a State first"}
              onChange={handleDistrictChange}
            />
          </div>

          {/* City / Town (Independent, Empty by Default, Searchable + Manual Entry) & Blood Group */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {isManualCity || (district && availableCities.length === 0) ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#E5E7EB' }}>
                    City / Town <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  {availableCities.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsManualCity(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#60A5FA',
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      ← Choose from list
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  placeholder={district ? `Enter city/town in ${district}` : "Enter city or town name"}
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#1E1E24',
                    border: `1px solid ${errors.city ? '#EF4444' : 'rgba(255, 255, 255, 0.12)'}`,
                    color: '#FFFFFF',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
                {errors.city && <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.city}</div>}
              </div>
            ) : (
              <SearchableSelect
                label="City / Town"
                value={city}
                options={availableCities}
                placeholder={district ? "Select City / Town" : state ? "Select City or District" : "Enter PIN / Select State first"}
                searchPlaceholder={`Search cities/towns in ${district || state || ''}...`}
                badge={availableCities.length > 0 ? `${availableCities.length} locations` : undefined}
                disabled={!state}
                required
                error={errors.city}
                emptyMessage={district ? `No cities mapped for ${district}` : "Select State & District"}
                allowManualFallback
                onSelectManualFallback={() => setIsManualCity(true)}
                onChange={handleCityChange}
              />
            )}

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#E5E7EB', marginBottom: '6px' }}>
                Blood Group *
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: '10px',
                  backgroundColor: '#1E1E24',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  outline: 'none'
                }}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          {/* Continue CTA */}
          <button
            onClick={handleNext}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-primary, #FF4B3A)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '10px'
            }}
          >
            <span>Continue to Vehicle Details</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: VEHICLE DETAILS                                                   */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '4px' }}>
              Step 2: Vehicle Information
            </h2>
            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
              Choose your delivery vehicle type and provide registration details.
            </p>
          </div>

          {/* Vehicle Type Card Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#E5E7EB', marginBottom: '8px' }}>
              Select Vehicle Type *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {(
                [
                  { type: 'Motorcycle', label: 'Motorcycle', desc: 'Bike / Geared' },
                  { type: 'Scooter', label: 'Scooter', desc: 'Activa / Non-gear' },
                  { type: 'Electric Vehicle', label: 'Electric EV', desc: 'EV Bike/Scooter' },
                  { type: 'Bicycle', label: 'Bicycle', desc: 'Pedal / Non-motor' }
                ] as const
              ).map((v) => {
                const isSel = vehicleType === v.type;
                return (
                  <div
                    key={v.type}
                    onClick={() => setVehicleType(v.type)}
                    style={{
                      padding: '14px 12px',
                      borderRadius: '12px',
                      backgroundColor: isSel ? 'rgba(255, 75, 58, 0.12)' : '#1E1E24',
                      border: `2px solid ${isSel ? 'var(--color-primary, #FF4B3A)' : 'rgba(255, 255, 255, 0.08)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 800, color: isSel ? '#FFFFFF' : '#D1D5DB' }}>
                      {v.label}
                    </div>
                    <div style={{ fontSize: '11px', color: isSel ? 'var(--color-primary, #FF4B3A)' : '#9CA3AF', marginTop: '2px' }}>
                      {v.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vehicle Reg & Model (Required if motorized) */}
          {vehicleType !== 'Bicycle' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#E5E7EB', marginBottom: '6px' }}>
                  Vehicle Registration Number (RC Plate) *
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. KA 03 EN 4592"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#1E1E24',
                    border: `1px solid ${errors.vehicleNumber ? '#EF4444' : 'rgba(255, 255, 255, 0.12)'}`,
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    outline: 'none'
                  }}
                />
                {errors.vehicleNumber && <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.vehicleNumber}</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#E5E7EB', marginBottom: '6px' }}>
                  Vehicle Make & Model
                </label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="e.g. Honda Activa 6G / Hero Splendor"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#1E1E24',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#E5E7EB', marginBottom: '6px' }}>
                  Driving Licence Number *
                </label>
                <input
                  type="text"
                  value={drivingLicenseNumber}
                  onChange={(e) => setDrivingLicenseNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. KA03 20190001234"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#1E1E24',
                    border: `1px solid ${errors.drivingLicenseNumber ? '#EF4444' : 'rgba(255, 255, 255, 0.12)'}`,
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    outline: 'none'
                  }}
                />
                {errors.drivingLicenseNumber && <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.drivingLicenseNumber}</div>}
              </div>
            </>
          )}

          {/* Emergency Contact */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#E5E7EB', marginBottom: '6px' }}>
                Emergency Contact Name
              </label>
              <input
                type="text"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="Parent / Spouse Name"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#1E1E24',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#E5E7EB', marginBottom: '6px' }}>
                Emergency Phone *
              </label>
              <input
                type="tel"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                placeholder="+91 98450 11223"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#1E1E24',
                  border: `1px solid ${errors.emergencyContactPhone ? '#EF4444' : 'rgba(255, 255, 255, 0.12)'}`,
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              {errors.emergencyContactPhone && <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.emergencyContactPhone}</div>}
            </div>
          </div>

          {/* Action Navigation */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
              onClick={() => setStep(1)}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              style={{
                flex: 2,
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-primary, #FF4B3A)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>Continue to KYC Documents</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: KYC & DOCUMENTS                                                   */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '4px' }}>
              Step 3: KYC Documents & Uploads
            </h2>
            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
              Upload clear photos of government verification documents for compliance.
            </p>
          </div>

          {/* Document Upload Item Helper */}
          {[
            {
              key: 'aadhaarFront' as const,
              title: 'Government ID / Aadhaar Front *',
              desc: 'Front page showing your photograph and address'
            },
            {
              key: 'panFront' as const,
              title: 'PAN Card *',
              desc: 'PAN card photo for mandatory tax TDS compliance'
            },
            ...(vehicleType !== 'Bicycle'
              ? [
                  {
                    key: 'drivingLicenseFront' as const,
                    title: 'Driving Licence Front *',
                    desc: 'Valid non-expired commercial or private 2-wheeler licence'
                  },
                  {
                    key: 'vehicleRc' as const,
                    title: 'Vehicle Registration (RC) *',
                    desc: 'RC book or smart card photo'
                  }
                ]
              : [])
          ].map((doc) => {
            const hasUploaded = Boolean(documents[doc.key]);
            const isErr = Boolean(errors[doc.key]);

            return (
              <div
                key={doc.key}
                style={{
                  borderRadius: '12px',
                  backgroundColor: '#1E1E24',
                  border: `1px solid ${isErr ? '#EF4444' : hasUploaded ? 'rgba(46, 204, 113, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                  padding: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{doc.title}</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{doc.desc}</div>
                  </div>
                  {hasUploaded && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-veg, #2ECC71)', fontWeight: 700 }}>
                      <CheckCircle2 size={13} />
                      Attached
                    </span>
                  )}
                </div>

                {hasUploaded ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <div
                      style={{
                        width: '60px',
                        height: '42px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        backgroundColor: '#000000'
                      }}
                    >
                      <img
                        src={documents[doc.key]!}
                        alt={doc.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <label
                      style={{
                        fontSize: '11px',
                        color: 'var(--color-primary, #FF4B3A)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255, 75, 58, 0.1)'
                      }}
                    >
                      Re-upload
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleDocUpload(doc.key, file);
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px dashed rgba(255, 255, 255, 0.2)',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      color: '#D1D5DB',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginTop: '8px'
                    }}
                  >
                    <UploadCloud size={16} />
                    <span>Upload photo or scan</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDocUpload(doc.key, file);
                      }}
                    />
                  </label>
                )}

                {isErr && <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '6px' }}>{errors[doc.key]}</div>}
              </div>
            );
          })}

          {/* Action Navigation */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
              onClick={() => setStep(2)}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              style={{
                flex: 2,
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-primary, #FF4B3A)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>Review Application</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: REVIEW & SUBMIT                                                   */}
      {/* ========================================================================= */}
      {step === 4 && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '4px' }}>
              Step 4: Review & Submit
            </h2>
            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
              Confirm all details before submitting for fleet administrator approval.
            </p>
          </div>

          {/* Section 1 Review: Personal */}
          <div
            style={{
              borderRadius: '12px',
              backgroundColor: '#1E1E24',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-primary, #FF4B3A)' }}>
                1. Personal Details
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60A5FA',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
              <img
                src={profilePhoto}
                alt="Profile"
                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800 }}>{fullName}</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{phone} • {email || 'No email'}</div>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: '#D1D5DB', lineHeight: 1.4 }}>
              <strong>Address:</strong> {address}, {city}, {district ? `${district}, ` : ''}{state} - {pincode}
            </div>
          </div>

          {/* Section 2 Review: Vehicle */}
          <div
            style={{
              borderRadius: '12px',
              backgroundColor: '#1E1E24',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-primary, #FF4B3A)' }}>
                2. Vehicle Details
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60A5FA',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
              <div>
                <span style={{ color: '#9CA3AF' }}>Type:</span> <strong>{vehicleType}</strong>
              </div>
              <div>
                <span style={{ color: '#9CA3AF' }}>Model:</span> <strong>{vehicleModel}</strong>
              </div>
              {vehicleNumber && (
                <div>
                  <span style={{ color: '#9CA3AF' }}>Plate:</span> <strong>{vehicleNumber}</strong>
                </div>
              )}
              {drivingLicenseNumber && (
                <div>
                  <span style={{ color: '#9CA3AF' }}>Licence:</span> <strong>{drivingLicenseNumber}</strong>
                </div>
              )}
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#9CA3AF' }}>Emergency Contact:</span>{' '}
                <strong>{emergencyContactName ? `${emergencyContactName} (${emergencyContactPhone})` : emergencyContactPhone}</strong>
              </div>
            </div>
          </div>

          {/* Section 3 Review: KYC Documents */}
          <div
            style={{
              borderRadius: '12px',
              backgroundColor: '#1E1E24',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-primary, #FF4B3A)' }}>
                3. KYC Documents Attached
              </div>
              <button
                type="button"
                onClick={() => setStep(3)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60A5FA',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {documents.aadhaarFront && (
                <div style={{ textAlign: 'center', fontSize: '10px', color: '#9CA3AF' }}>
                  <img src={documents.aadhaarFront} alt="Aadhaar" style={{ width: '48px', height: '34px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div>Aadhaar</div>
                </div>
              )}
              {documents.panFront && (
                <div style={{ textAlign: 'center', fontSize: '10px', color: '#9CA3AF' }}>
                  <img src={documents.panFront} alt="PAN" style={{ width: '48px', height: '34px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div>PAN</div>
                </div>
              )}
              {documents.drivingLicenseFront && (
                <div style={{ textAlign: 'center', fontSize: '10px', color: '#9CA3AF' }}>
                  <img src={documents.drivingLicenseFront} alt="DL" style={{ width: '48px', height: '34px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div>Licence</div>
                </div>
              )}
              {documents.vehicleRc && (
                <div style={{ textAlign: 'center', fontSize: '10px', color: '#9CA3AF' }}>
                  <img src={documents.vehicleRc} alt="RC" style={{ width: '48px', height: '34px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div>RC Book</div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4 Review: Payout UPI */}
          <div
            style={{
              borderRadius: '12px',
              backgroundColor: '#1E1E24',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '14px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-primary, #FF4B3A)', marginBottom: '8px' }}>
              4. Daily Earnings Payout
            </div>
            <div style={{ fontSize: '12px', color: '#D1D5DB' }}>
              Daily delivery earnings & incentives will be deposited via UPI to:{' '}
              <strong style={{ color: 'var(--color-veg, #2ECC71)' }}>{bankDetails.upiId}</strong>
            </div>
          </div>

          {/* Consent & Declarations */}
          <div
            style={{
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '11px', color: '#D1D5DB', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={consentDataAccuracy}
                onChange={(e) => setConsentDataAccuracy(e.target.checked)}
                style={{ marginTop: '2px', accentColor: 'var(--color-primary, #FF4B3A)' }}
              />
              <span>
                I hereby declare that all information and uploaded documents provided by me are genuine, accurate, and belong to me.
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '11px', color: '#D1D5DB', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={consentTerms}
                onChange={(e) => setConsentTerms(e.target.checked)}
                style={{ marginTop: '2px', accentColor: 'var(--color-primary, #FF4B3A)' }}
              />
              <span>
                I agree to the Tomattto Fleet Partner Code of Conduct, safety policies, and background verification terms.
              </span>
            </label>
          </div>

          {errors.consent && (
            <div style={{ fontSize: '11px', color: '#EF4444', textAlign: 'center' }}>
              {errors.consent}
            </div>
          )}

          {/* Submit Action Controls */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => setStep(3)}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 2,
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-primary, #FF4B3A)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '14px',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isSubmitting ? (
                <span>Submitting Application...</span>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Submit Rider Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
