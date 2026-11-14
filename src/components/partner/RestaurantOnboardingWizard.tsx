import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import {
  Store,
  MapPin,
  User,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  Building2,
  Calendar,
  Sparkles,
  Info,
  FileText,
  FileCheck,
  ShieldCheck,
  Trash2,
  CreditCard,
  Landmark,
  DollarSign,
  Lock,
  Edit2
} from 'lucide-react';

interface RestaurantOnboardingWizardProps {
  onBack: () => void;
}

interface UploadedDoc {
  file: File | null;
  name: string;
  size: string;
  previewUrl?: string | null;
  type: string;
}

const CUISINE_OPTIONS = [
  'North Indian',
  'South Indian',
  'Biryani',
  'Chinese',
  'Italian / Pizza',
  'Burgers & Fast Food',
  'Continental',
  'Mughlai',
  'Street Food / Chaat',
  'Desserts & Ice Cream',
  'Café & Beverages',
  'Bakery',
  'Healthy & Salads',
  'Asian / Momos'
];

const RESTAURANT_TYPES = [
  { id: 'Restaurant', label: 'Dine-In & Delivery', desc: 'Standard restaurant with seating and takeout' },
  { id: 'Café', label: 'Café / Coffee Shop', desc: 'Beverages, light bites, and casual dining' },
  { id: 'Cloud Kitchen', label: 'Cloud Kitchen', desc: 'Delivery-only facility with no dine-in area' },
  { id: 'Bakery', label: 'Bakery & Confectionery', desc: 'Cakes, pastries, breads, and confectionery' },
  { id: 'Other', label: 'Quick Service / Other', desc: 'Kiosks, food courts, and specialized food stalls' }
];

const DAYS_OF_WEEK = [
  { id: 'Mon', label: 'Monday' },
  { id: 'Tue', label: 'Tuesday' },
  { id: 'Wed', label: 'Wednesday' },
  { id: 'Thu', label: 'Thursday' },
  { id: 'Fri', label: 'Friday' },
  { id: 'Sat', label: 'Saturday' },
  { id: 'Sun', label: 'Sunday' }
];

const BUSINESS_TYPES = [
  'Sole Proprietorship',
  'Partnership',
  'Private Limited Company',
  'LLP',
  'Other'
];

const POPULAR_BANKS = [
  'HDFC Bank',
  'State Bank of India',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank'
];

export const RestaurantOnboardingWizard: React.FC<RestaurantOnboardingWizardProps> = ({ onBack }) => {
  // Step Navigation State (1: Restaurant Details, 2: Business Verification, 3: Bank & Payouts, 4: Review & Submit)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // ==========================================
  // STEP 1 STATE: Restaurant Details
  // ==========================================
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantLogo, setRestaurantLogo] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [restaurantType, setRestaurantType] = useState('Restaurant');

  // Contact Information
  const [ownerName, setOwnerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  // Location
  const [fullAddress, setFullAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [landmark, setLandmark] = useState('');

  // Operating Hours
  const [openingTime, setOpeningTime] = useState('10:00');
  const [closingTime, setClosingTime] = useState('23:00');
  const [operatingDays, setOperatingDays] = useState<string[]>([
    'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
  ]);

  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});
  const [isStep1Complete, setIsStep1Complete] = useState(false);

  // ==========================================
  // STEP 2 STATE: Business Verification
  // ==========================================
  const [legalBusinessName, setLegalBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Sole Proprietorship');
  const [panNumber, setPanNumber] = useState('');
  const [gstRegistered, setGstRegistered] = useState<'yes' | 'no'>('no');
  const [gstin, setGstin] = useState('');

  // FSSAI License State
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [fssaiExpiryDate, setFssaiExpiryDate] = useState('');

  // Step 2 Document Uploads State
  const [panDoc, setPanDoc] = useState<UploadedDoc | null>(null);
  const [fssaiDoc, setFssaiDoc] = useState<UploadedDoc | null>(null);
  const [gstDoc, setGstDoc] = useState<UploadedDoc | null>(null);

  // Feature 3: Mandatory Personal KYC Documents (Front & Back)
  const [aadhaarFrontDoc, setAadhaarFrontDoc] = useState<UploadedDoc | null>(null);
  const [aadhaarBackDoc, setAadhaarBackDoc] = useState<UploadedDoc | null>(null);
  const [personalPanFrontDoc, setPersonalPanFrontDoc] = useState<UploadedDoc | null>(null);
  const [personalPanBackDoc, setPersonalPanBackDoc] = useState<UploadedDoc | null>(null);

  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});
  const [isStep2Complete, setIsStep2Complete] = useState(false);

  // ==========================================
  // STEP 3 STATE: Bank & Payouts
  // ==========================================
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountType, setAccountType] = useState<'Current' | 'Savings'>('Current');

  // Payout Details
  const [payoutFrequency, setPayoutFrequency] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [payoutEmail, setPayoutEmail] = useState('');

  // Optional Supporting Document (Cancelled Cheque / Bank Passbook)
  const [chequeDoc, setChequeDoc] = useState<UploadedDoc | null>(null);

  const [step3Errors, setStep3Errors] = useState<Record<string, string>>({});
  const [isStep3Complete, setIsStep3Complete] = useState(false);

  // ==========================================
  // STEP 4 STATE: Review & Submit
  // ==========================================
  const { submitRestaurantApplication } = useTomattto();
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [applicationRef, setApplicationRef] = useState<string>('');
  const [submissionTimestamp, setSubmissionTimestamp] = useState<string | null>(null);

  // ==========================================
  // MASKING HELPERS
  // ==========================================
  const maskAccountNumber = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.length <= 4) return clean;
    return `•••• •••• •••• ${clean.slice(-4)}`;
  };

  const maskPanNumber = (pan: string) => {
    const clean = pan.trim().toUpperCase();
    if (clean.length !== 10) return clean;
    return `${clean.slice(0, 2)}••••••${clean.slice(-2)}`;
  };

  const maskGstin = (gst: string) => {
    const clean = gst.trim().toUpperCase();
    if (clean.length !== 15) return clean;
    return `${clean.slice(0, 2)}••••••••••${clean.slice(-3)}`;
  };

  // ==========================================
  // STEP 1 HANDLERS
  // ==========================================
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setStep1Errors((prev) => ({ ...prev, logo: 'Please upload a valid image file (PNG, JPG, or WEBP)' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setStep1Errors((prev) => ({ ...prev, logo: 'Logo file size must be under 5 MB' }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setRestaurantLogo(event.target.result as string);
          setStep1Errors((prev) => {
            const next = { ...prev };
            delete next.logo;
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) => {
      const next = prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine];
      if (next.length > 0) {
        setStep1Errors((errs) => {
          const updated = { ...errs };
          delete updated.cuisines;
          return updated;
        });
      }
      return next;
    });
  };

  const toggleDay = (dayId: string) => {
    setOperatingDays((prev) => {
      const next = prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId];
      if (next.length > 0) {
        setStep1Errors((errs) => {
          const updated = { ...errs };
          delete updated.operatingDays;
          return updated;
        });
      }
      return next;
    });
  };

  const selectAllDays = () => {
    setOperatingDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    setStep1Errors((errs) => {
      const updated = { ...errs };
      delete updated.operatingDays;
      return updated;
    });
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!restaurantName.trim()) {
      newErrors.restaurantName = 'Restaurant Name is required';
    }
    if (selectedCuisines.length === 0) {
      newErrors.cuisines = 'Please select at least one cuisine';
    }
    if (!restaurantType) {
      newErrors.restaurantType = 'Please select a restaurant type';
    }
    if (!ownerName.trim()) {
      newErrors.ownerName = 'Owner / Primary Contact Name is required';
    }
    if (!contactNumber.trim()) {
      newErrors.contactNumber = 'Contact Phone Number is required';
    } else if (!/^\+?[0-9]{10,12}$/.test(contactNumber.replace(/[\s-]/g, ''))) {
      newErrors.contactNumber = 'Enter a valid 10-digit mobile number';
    }
    if (!emailAddress.trim()) {
      newErrors.emailAddress = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
      newErrors.emailAddress = 'Please enter a valid email address';
    }
    if (!fullAddress.trim()) {
      newErrors.fullAddress = 'Complete street address is required';
    }
    if (!city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!stateName.trim()) {
      newErrors.stateName = 'State is required';
    }
    if (!pinCode.trim()) {
      newErrors.pinCode = 'PIN Code is required';
    } else if (!/^[0-9]{6}$/.test(pinCode.trim())) {
      newErrors.pinCode = 'PIN Code must be 6 digits';
    }
    if (operatingDays.length === 0) {
      newErrors.operatingDays = 'Please select at least one operating day';
    }

    setStep1Errors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setIsStep1Complete(true);
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsStep1Complete(false);
      const firstErrorKey = Object.keys(step1Errors)[0];
      const element = document.getElementById(`field-${firstErrorKey}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // ==========================================
  // STEP 2 HANDLERS
  // ==========================================
  const handleDocUpload = (
    field: 'pan' | 'fssai' | 'gst' | 'cheque' | 'aadhaarFront' | 'aadhaarBack' | 'personalPanFront' | 'personalPanBack',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      if (field === 'cheque') {
        setStep3Errors((prev) => ({ ...prev, cheque: 'Please upload a PDF, JPG, or PNG file' }));
      } else {
        setStep2Errors((prev) => ({ ...prev, [field]: 'Please upload a PDF, JPG, or PNG file' }));
      }
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      if (field === 'cheque') {
        setStep3Errors((prev) => ({ ...prev, cheque: 'File size must be under 10 MB' }));
      } else {
        setStep2Errors((prev) => ({ ...prev, [field]: 'File size must be under 10 MB' }));
      }
      return;
    }

    const formatSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    let previewUrl: string | null = null;
    if (file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file);
    }

    const docData: UploadedDoc = {
      file,
      name: file.name,
      size: formatSize(file.size),
      previewUrl,
      type: file.type
    };

    if (field === 'pan') setPanDoc(docData);
    else if (field === 'fssai') setFssaiDoc(docData);
    else if (field === 'gst') setGstDoc(docData);
    else if (field === 'cheque') setChequeDoc(docData);
    else if (field === 'aadhaarFront') setAadhaarFrontDoc(docData);
    else if (field === 'aadhaarBack') setAadhaarBackDoc(docData);
    else if (field === 'personalPanFront') setPersonalPanFrontDoc(docData);
    else if (field === 'personalPanBack') setPersonalPanBackDoc(docData);

    if (field === 'cheque') {
      setStep3Errors((prev) => {
        const updated = { ...prev };
        delete updated.cheque;
        return updated;
      });
    } else {
      setStep2Errors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const removeDoc = (field: 'pan' | 'fssai' | 'gst' | 'cheque' | 'aadhaarFront' | 'aadhaarBack' | 'personalPanFront' | 'personalPanBack') => {
    if (field === 'pan') setPanDoc(null);
    else if (field === 'fssai') setFssaiDoc(null);
    else if (field === 'gst') setGstDoc(null);
    else if (field === 'cheque') setChequeDoc(null);
    else if (field === 'aadhaarFront') setAadhaarFrontDoc(null);
    else if (field === 'aadhaarBack') setAadhaarBackDoc(null);
    else if (field === 'personalPanFront') setPersonalPanFrontDoc(null);
    else if (field === 'personalPanBack') setPersonalPanBackDoc(null);
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!legalBusinessName.trim()) {
      newErrors.legalBusinessName = 'Legal Business Name is required';
    }
    if (!businessType) {
      newErrors.businessType = 'Please select a business constitution type';
    }
    if (!panNumber.trim()) {
      newErrors.panNumber = 'Business / Proprietor PAN Number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(panNumber.trim())) {
      newErrors.panNumber = 'Enter a valid 10-character PAN (e.g. ABCDE1234F)';
    }

    if (gstRegistered === 'yes') {
      if (!gstin.trim()) {
        newErrors.gstin = 'GSTIN Number is required for registered businesses';
      } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(gstin.trim())) {
        newErrors.gstin = 'Enter a valid 15-character GSTIN (e.g. 29ABCDE1234F1Z5)';
      }
    }

    if (!fssaiNumber.trim()) {
      newErrors.fssaiNumber = '14-digit FSSAI License Number is required';
    } else if (!/^[0-9]{14}$/.test(fssaiNumber.trim())) {
      newErrors.fssaiNumber = 'FSSAI License must be exactly 14 digits';
    }

    if (!fssaiExpiryDate) {
      newErrors.fssaiExpiryDate = 'License expiry date is required';
    }

    if (!panDoc) {
      newErrors.pan = 'Business PAN card document is required';
    }
    if (!fssaiDoc) {
      newErrors.fssai = 'FSSAI License certificate document is required';
    }
    if (gstRegistered === 'yes' && !gstDoc) {
      newErrors.gst = 'GST Registration Certificate is required';
    }

    // Feature 3: Mandatory Personal KYC Documents Validation
    if (!aadhaarFrontDoc) {
      newErrors.aadhaarFront = 'Aadhaar Card Front photo is required';
    }
    if (!aadhaarBackDoc) {
      newErrors.aadhaarBack = 'Aadhaar Card Back photo is required';
    }
    if (!personalPanFrontDoc) {
      newErrors.personalPanFront = 'Personal PAN Card Front photo is required';
    }
    if (!personalPanBackDoc) {
      newErrors.personalPanBack = 'Personal PAN Card Back photo is required';
    }

    setStep2Errors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      setIsStep2Complete(true);
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsStep2Complete(false);
      const firstErrorKey = Object.keys(step2Errors)[0];
      const element = document.getElementById(`field-step2-${firstErrorKey}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // ==========================================
  // STEP 3 HANDLERS: Bank & Payouts
  // ==========================================
  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};

    if (!accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account Holder Name is required';
    }
    if (!bankName.trim()) {
      newErrors.bankName = 'Bank Name is required';
    }
    if (!accountNumber.trim()) {
      newErrors.accountNumber = 'Bank Account Number is required';
    } else if (!/^[0-9]{9,18}$/.test(accountNumber.trim())) {
      newErrors.accountNumber = 'Enter a valid bank account number (9 to 18 digits)';
    }

    if (!confirmAccountNumber.trim()) {
      newErrors.confirmAccountNumber = 'Please re-enter account number to confirm';
    } else if (confirmAccountNumber.trim() !== accountNumber.trim()) {
      newErrors.confirmAccountNumber = 'Account numbers do not match';
    }

    if (!ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC Code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifscCode.trim())) {
      newErrors.ifscCode = 'Enter a valid 11-character Indian IFSC code (e.g. HDFC0001234)';
    }

    if (!accountType) {
      newErrors.accountType = 'Please select your bank account type';
    }
    if (!payoutFrequency) {
      newErrors.payoutFrequency = 'Please choose a payout frequency';
    }

    if (!payoutEmail.trim()) {
      newErrors.payoutEmail = 'Settlement & Payout Notification Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payoutEmail.trim())) {
      newErrors.payoutEmail = 'Please enter a valid payout notification email address';
    }

    setStep3Errors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep3()) {
      setIsStep3Complete(true);
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsStep3Complete(false);
      const firstErrorKey = Object.keys(step3Errors)[0];
      const element = document.getElementById(`field-step3-${firstErrorKey}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // ==========================================
  // STEP 4 HANDLERS: Review & Submit
  // ==========================================
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConsentChecked || isSubmitting) return;

    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      const res = await submitRestaurantApplication(
        {
          restaurantName,
          restaurantType,
          cuisineTypes: selectedCuisines,
          description,
          ownerName,
          phone: contactNumber,
          email: emailAddress,
          address: fullAddress,
          city,
          state: stateName,
          pincode: pinCode,
          landmark,
          openingTime,
          closingTime,
          operatingDays,
          legalBusinessName,
          businessType,
          panNumber,
          gstRegistered: gstRegistered === 'yes',
          gstin: gstRegistered === 'yes' ? gstin : undefined,
          fssaiNumber,
          fssaiExpiryDate,
          bankDetails: {
            accountHolderName,
            bankName,
            accountNumber,
            ifscCode,
            accountType
          },
          payoutFrequency,
          payoutEmail: payoutEmail || emailAddress,
          documents: {
            panDoc: panDoc?.previewUrl || undefined,
            panDocName: panDoc?.name,
            fssaiDoc: fssaiDoc?.previewUrl || undefined,
            fssaiDocName: fssaiDoc?.name,
            gstDoc: gstDoc?.previewUrl || undefined,
            gstDocName: gstDoc?.name,
            chequeDoc: chequeDoc?.previewUrl || undefined,
            chequeDocName: chequeDoc?.name,
            aadhaarFront: aadhaarFrontDoc?.previewUrl || undefined,
            aadhaarFrontName: aadhaarFrontDoc?.name,
            aadhaarBack: aadhaarBackDoc?.previewUrl || undefined,
            aadhaarBackName: aadhaarBackDoc?.name,
            personalPanFront: personalPanFrontDoc?.previewUrl || undefined,
            personalPanFrontName: personalPanFrontDoc?.name,
            personalPanBack: personalPanBackDoc?.previewUrl || undefined,
            personalPanBackName: personalPanBackDoc?.name
          }
        },
        {
          panDocFile: panDoc?.file || undefined,
          fssaiDocFile: fssaiDoc?.file || undefined,
          gstDocFile: gstDoc?.file || undefined,
          chequeDocFile: chequeDoc?.file || undefined,
          aadhaarFrontFile: aadhaarFrontDoc?.file || undefined,
          aadhaarBackFile: aadhaarBackDoc?.file || undefined,
          personalPanFrontFile: personalPanFrontDoc?.file || undefined,
          personalPanBackFile: personalPanBackDoc?.file || undefined
        }
      );

      if (!res.success) {
        setSubmissionError(res.error || 'Failed to submit application. Please check your credentials and try again.');
        setIsSubmitting(false);
        return;
      }

      setApplicationRef(res.applicationRef || '');
      setIsSubmitted(true);
      setSubmissionTimestamp(
        new Date().toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short'
        })
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error submitting restaurant application:', err);
      setSubmissionError(err?.message || 'A network error occurred while submitting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Steps indicator configuration
  const steps = [
    {
      number: 1,
      title: 'Restaurant Details',
      desc: 'Basic info & location',
      completed: isStep1Complete || currentStep > 1,
      active: currentStep === 1
    },
    {
      number: 2,
      title: 'Business Verification',
      desc: 'FSSAI & GST documents',
      completed: isStep2Complete || currentStep > 2,
      active: currentStep === 2
    },
    {
      number: 3,
      title: 'Bank & Payouts',
      desc: 'Account details',
      completed: isStep3Complete || currentStep > 3,
      active: currentStep === 3
    },
    {
      number: 4,
      title: 'Review & Submit',
      desc: 'Final application',
      completed: isSubmitted,
      active: currentStep === 4
    }
  ];

  return (
    <div
      style={{
        backgroundColor: '#F8F9FA',
        minHeight: '100vh',
        color: '#1E1E24',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Top Sticky Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: '#F3F4F6',
              color: '#374151',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Partner Dashboard</span>
          </button>

          <div style={{ height: '20px', width: '1px', backgroundColor: '#E5E7EB' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🍅</span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>
              Tomattto <span style={{ color: 'var(--color-primary)' }}>Partner Portal</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '9999px',
              backgroundColor:
                currentStep === 1
                  ? '#EFF6FF'
                  : currentStep === 2
                  ? '#FEF3C7'
                  : currentStep === 3
                  ? '#ECFDF5'
                  : isSubmitted
                  ? '#ECFDF5'
                  : '#F5F3FF',
              color:
                currentStep === 1
                  ? '#1D4ED8'
                  : currentStep === 2
                  ? '#B45309'
                  : currentStep === 3
                  ? '#047857'
                  : isSubmitted
                  ? '#047857'
                  : '#6D28D9'
            }}
          >
            {isSubmitted ? 'Application Submitted' : `Step ${currentStep} of 4`}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '960px', width: '100%', margin: '0 auto', padding: '24px 20px 60px' }}>
        {/* Page Hero Title */}
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: '#FEE2E2',
              color: '#B91C1C',
              fontSize: '12px',
              fontWeight: 800,
              marginBottom: '10px'
            }}
          >
            <Sparkles size={13} />
            <span>GROW WITH TOMATTTO</span>
          </div>

          {currentStep === 1 && (
            <>
              <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#111827', margin: '0 0 6px' }}>
                Become a Restaurant Partner
              </h1>
              <p style={{ fontSize: '15px', color: '#6B7280', margin: 0, maxWidth: '580px', marginInline: 'auto' }}>
                Join Tomattto and grow your restaurant business with more customers.
              </p>
            </>
          )}

          {currentStep === 2 && (
            <>
              <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#111827', margin: '0 0 6px' }}>
                Business Verification
              </h1>
              <p style={{ fontSize: '15px', color: '#6B7280', margin: 0, maxWidth: '580px', marginInline: 'auto' }}>
                Provide your business and regulatory details to help us verify your restaurant.
              </p>
            </>
          )}

          {currentStep === 3 && (
            <>
              <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#111827', margin: '0 0 6px' }}>
                Bank & Payouts
              </h1>
              <p style={{ fontSize: '15px', color: '#6B7280', margin: 0, maxWidth: '580px', marginInline: 'auto' }}>
                Add your bank account details to receive restaurant payouts.
              </p>
            </>
          )}

          {currentStep === 4 && !isSubmitted && (
            <>
              <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#111827', margin: '0 0 6px' }}>
                Review & Submit Application
              </h1>
              <p style={{ fontSize: '15px', color: '#6B7280', margin: 0, maxWidth: '580px', marginInline: 'auto' }}>
                Review your restaurant, regulatory, and payout details before final submission.
              </p>
            </>
          )}

          {currentStep === 4 && isSubmitted && (
            <>
              <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#065F46', margin: '0 0 6px' }}>
                Application Details Submitted
              </h1>
              <p style={{ fontSize: '15px', color: '#6B7280', margin: 0, maxWidth: '580px', marginInline: 'auto' }}>
                Your restaurant partner application has been recorded and submitted for compliance review.
              </p>
            </>
          )}
        </div>

        {/* Multi-Step Progress Tracker */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            padding: '20px 24px',
            marginBottom: '28px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              position: 'relative'
            }}
          >
            {steps.map((s) => {
              const isClickable =
                s.completed ||
                (s.number === 1 && currentStep > 1) ||
                (s.number === 2 && currentStep > 2) ||
                (s.number === 3 && currentStep > 3) ||
                (s.number === 4 && isStep1Complete && isStep2Complete && isStep3Complete);
              return (
                <div
                  key={s.number}
                  onClick={() => {
                    if (s.number === 1 && currentStep !== 1) {
                      setCurrentStep(1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else if (s.number === 2 && currentStep !== 2 && isStep1Complete) {
                      setCurrentStep(2);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else if (s.number === 3 && currentStep !== 3 && isStep2Complete) {
                      setCurrentStep(3);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else if (
                      s.number === 4 &&
                      currentStep !== 4 &&
                      isStep1Complete &&
                      isStep2Complete &&
                      isStep3Complete
                    ) {
                      setCurrentStep(4);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: s.active ? '#FFF5F4' : s.completed ? '#F0FDF4' : '#FAFAFA',
                    border: s.active
                      ? '1.5px solid var(--color-primary)'
                      : s.completed
                      ? '1.5px solid #10B981'
                      : '1px solid #F3F4F6',
                    cursor: isClickable ? 'pointer' : 'default',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: s.completed
                        ? '#10B981'
                        : s.active
                        ? 'var(--color-primary)'
                        : '#E5E7EB',
                      color: s.active || s.completed ? '#FFFFFF' : '#6B7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 800,
                      flexShrink: 0
                    }}
                  >
                    {s.completed ? <CheckCircle2 size={18} color="#FFFFFF" /> : s.number}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 800,
                        color: s.completed ? '#065F46' : s.active ? 'var(--color-primary)' : '#4B5563',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {s.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                      {s.completed ? 'Completed' : s.active ? 'In Progress' : s.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: RESTAURANT DETAILS VIEW                                           */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <form onSubmit={handleSaveStep1} noValidate>
            {/* SECTION 1: Restaurant Information */}
            <div
              id="field-restaurantName"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#FFF5F4',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Store size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Restaurant Information
                  </h2>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0' }}>
                    Brand identity and categories displayed to customers on the Tomattto app.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Restaurant Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={(e) => {
                      setRestaurantName(e.target.value);
                      if (step1Errors.restaurantName) {
                        setStep1Errors((prev) => {
                          const n = { ...prev };
                          delete n.restaurantName;
                          return n;
                        });
                      }
                    }}
                    placeholder="e.g. Royal Biryani & Kebabs"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: step1Errors.restaurantName ? '1.5px solid #EF4444' : '1px solid #D1D5DB',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#111827',
                      outline: 'none'
                    }}
                  />
                  {step1Errors.restaurantName && (
                    <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={13} />
                      <span>{step1Errors.restaurantName}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                    Restaurant Logo <span style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280' }}>(Optional)</span>
                  </label>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 10px' }}>
                    Recommended: Square PNG/JPG, at least 500x500px. Appears on your store header and search listings.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div
                      style={{
                        width: '76px',
                        height: '76px',
                        borderRadius: '16px',
                        border: '2px dashed #D1D5DB',
                        backgroundColor: '#F9FAFB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      {restaurantLogo ? (
                        <img
                          src={restaurantLogo}
                          alt="Restaurant Logo"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Store size={28} color="#9CA3AF" />
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          backgroundColor: '#F3F4F6',
                          color: '#374151',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: '1px solid #D1D5DB'
                        }}
                      >
                        <Upload size={14} />
                        <span>{restaurantLogo ? 'Replace Logo' : 'Upload Logo'}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleLogoUpload}
                          style={{ display: 'none' }}
                        />
                      </label>

                      {restaurantLogo && (
                        <button
                          type="button"
                          onClick={() => setRestaurantLogo(null)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'none',
                            border: 'none',
                            color: '#EF4444',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          <X size={12} />
                          <span>Remove logo</span>
                        </button>
                      )}
                    </div>
                  </div>
                  {step1Errors.logo && (
                    <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={13} />
                      <span>{step1Errors.logo}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Restaurant Description <span style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280' }}>(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe your food concept, specialties, or brand heritage..."
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1px solid #D1D5DB',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#111827',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div id="field-restaurantType">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                    Restaurant Type <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                    {RESTAURANT_TYPES.map((type) => {
                      const isSelected = restaurantType === type.id;
                      return (
                        <div
                          key={type.id}
                          onClick={() => {
                            setRestaurantType(type.id);
                            if (step1Errors.restaurantType) {
                              setStep1Errors((errs) => {
                                const updated = { ...errs };
                                delete updated.restaurantType;
                                return updated;
                              });
                            }
                          }}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '12px',
                            border: isSelected ? '2px solid var(--color-primary)' : '1px solid #E5E7EB',
                            backgroundColor: isSelected ? '#FFF5F4' : '#FFFFFF',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: isSelected ? 'var(--color-primary)' : '#111827' }}>
                              {type.label}
                            </span>
                            <div
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                border: isSelected ? '5px solid var(--color-primary)' : '1.5px solid #D1D5DB',
                                backgroundColor: '#FFFFFF'
                              }}
                            />
                          </div>
                          <p style={{ fontSize: '11px', color: '#6B7280', margin: 0, lineHeight: 1.3 }}>
                            {type.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  {step1Errors.restaurantType && (
                    <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={13} />
                      <span>{step1Errors.restaurantType}</span>
                    </p>
                  )}
                </div>

                <div id="field-cuisines">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                      Cuisine Types <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <span style={{ fontSize: '11px', color: '#6B7280' }}>
                      Select all that apply ({selectedCuisines.length} selected)
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {CUISINE_OPTIONS.map((cuisine) => {
                      const isSelected = selectedCuisines.includes(cuisine);
                      return (
                        <button
                          type="button"
                          key={cuisine}
                          onClick={() => toggleCuisine(cuisine)}
                          style={{
                            padding: '7px 14px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: 700,
                            backgroundColor: isSelected ? 'var(--color-primary)' : '#F3F4F6',
                            color: isSelected ? '#FFFFFF' : '#374151',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSelected && <CheckCircle2 size={13} />}
                          <span>{cuisine}</span>
                        </button>
                      );
                    })}
                  </div>
                  {step1Errors.cuisines && (
                    <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={13} />
                      <span>{step1Errors.cuisines}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: Contact Information */}
            <div
              id="field-ownerName"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <User size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Primary Contact Information
                  </h2>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0' }}>
                    Owner or authorized general manager details for official onboarding communication.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Owner / Manager Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => {
                        setOwnerName(e.target.value);
                        if (step1Errors.ownerName) {
                          setStep1Errors((prev) => {
                            const n = { ...prev };
                            delete n.ownerName;
                            return n;
                          });
                        }
                      }}
                      placeholder="e.g. Ramesh Kumar"
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 38px',
                        borderRadius: '10px',
                        border: step1Errors.ownerName ? '1.5px solid #EF4444' : '1px solid #D1D5DB',
                        fontSize: '14px',
                        backgroundColor: '#FFFFFF',
                        color: '#111827',
                        outline: 'none'
                      }}
                    />
                    <User size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                  {step1Errors.ownerName && (
                    <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={13} />
                      <span>{step1Errors.ownerName}</span>
                    </p>
                  )}
                </div>

                <div id="field-contactNumber">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Contact Phone Number <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => {
                        setContactNumber(e.target.value);
                        if (step1Errors.contactNumber) {
                          setStep1Errors((prev) => {
                            const n = { ...prev };
                            delete n.contactNumber;
                            return n;
                          });
                        }
                      }}
                      placeholder="e.g. 9876543210"
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 38px',
                        borderRadius: '10px',
                        border: step1Errors.contactNumber ? '1.5px solid #EF4444' : '1px solid #D1D5DB',
                        fontSize: '14px',
                        backgroundColor: '#FFFFFF',
                        color: '#111827',
                        outline: 'none'
                      }}
                    />
                    <Phone size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                  {step1Errors.contactNumber && (
                    <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={13} />
                      <span>{step1Errors.contactNumber}</span>
                    </p>
                  )}
                </div>

                <div id="field-emailAddress" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Email Address <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => {
                        setEmailAddress(e.target.value);
                        if (step1Errors.emailAddress) {
                          setStep1Errors((prev) => {
                            const n = { ...prev };
                            delete n.emailAddress;
                            return n;
                          });
                        }
                      }}
                      placeholder="e.g. partner@restaurant.com"
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 38px',
                        borderRadius: '10px',
                        border: step1Errors.emailAddress ? '1.5px solid #EF4444' : '1px solid #D1D5DB',
                        fontSize: '14px',
                        backgroundColor: '#FFFFFF',
                        color: '#111827',
                        outline: 'none'
                      }}
                    />
                    <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                  {step1Errors.emailAddress && (
                    <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={13} />
                      <span>{step1Errors.emailAddress}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 3: Restaurant Location */}
            <div
              id="field-fullAddress"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <MapPin size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Restaurant Physical Location
                  </h2>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0' }}>
                    Delivery riders and local customers will be directed to this kitchen / outlet address.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Full Address (Shop No, Building, Street) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={fullAddress}
                    onChange={(e) => {
                      setFullAddress(e.target.value);
                      if (step1Errors.fullAddress) {
                        setStep1Errors((prev) => {
                          const n = { ...prev };
                          delete n.fullAddress;
                          return n;
                        });
                      }
                    }}
                    placeholder="e.g. Shop 12, Ground Floor, Sai Plaza, 100ft Road, Indiranagar"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: step1Errors.fullAddress ? '1.5px solid #EF4444' : '1px solid #D1D5DB',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#111827',
                      outline: 'none'
                    }}
                  />
                  {step1Errors.fullAddress && (
                    <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={13} />
                      <span>{step1Errors.fullAddress}</span>
                    </p>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div id="field-city">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      City <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (step1Errors.city) {
                          setStep1Errors((prev) => {
                            const n = { ...prev };
                            delete n.city;
                            return n;
                          });
                        }
                      }}
                      placeholder="e.g. Bengaluru"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: step1Errors.city ? '1.5px solid #EF4444' : '1px solid #D1D5DB',
                        fontSize: '14px',
                        backgroundColor: '#FFFFFF',
                        color: '#111827',
                        outline: 'none'
                      }}
                    />
                    {step1Errors.city && (
                      <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={13} />
                        <span>{step1Errors.city}</span>
                      </p>
                    )}
                  </div>

                  <div id="field-stateName">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      State <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => {
                        setStateName(e.target.value);
                        if (step1Errors.stateName) {
                          setStep1Errors((prev) => {
                            const n = { ...prev };
                            delete n.stateName;
                            return n;
                          });
                        }
                      }}
                      placeholder="e.g. Karnataka"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: step1Errors.stateName ? '1.5px solid #EF4444' : '1px solid #D1D5DB',
                        fontSize: '14px',
                        backgroundColor: '#FFFFFF',
                        color: '#111827',
                        outline: 'none'
                      }}
                    />
                    {step1Errors.stateName && (
                      <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={13} />
                        <span>{step1Errors.stateName}</span>
                      </p>
                    )}
                  </div>

                  <div id="field-pinCode">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      PIN Code <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pinCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setPinCode(val);
                        if (step1Errors.pinCode) {
                          setStep1Errors((prev) => {
                            const n = { ...prev };
                            delete n.pinCode;
                            return n;
                          });
                        }
                      }}
                      placeholder="e.g. 560038"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: step1Errors.pinCode ? '1.5px solid #EF4444' : '1px solid #D1D5DB',
                        fontSize: '14px',
                        backgroundColor: '#FFFFFF',
                        color: '#111827',
                        outline: 'none'
                      }}
                    />
                    {step1Errors.pinCode && (
                      <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={13} />
                        <span>{step1Errors.pinCode}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Landmark <span style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280' }}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Opposite Sony Center / Near Metro Station"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1px solid #D1D5DB',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#111827',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: Operating Hours */}
            <div
              id="field-operatingDays"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                padding: '24px',
                marginBottom: '32px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#FEF3C7',
                    color: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Clock size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Operating Hours & Schedule
                  </h2>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0' }}>
                    Set when your kitchen is open to accept online orders.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      Opening Time
                    </label>
                    <input
                      type="time"
                      value={openingTime}
                      onChange={(e) => setOpeningTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: '1px solid #D1D5DB',
                        fontSize: '14px',
                        backgroundColor: '#FFFFFF',
                        color: '#111827',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      Closing Time
                    </label>
                    <input
                      type="time"
                      value={closingTime}
                      onChange={(e) => setClosingTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: '1px solid #D1D5DB',
                        fontSize: '14px',
                        backgroundColor: '#FFFFFF',
                        color: '#111827',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                      Days of Operation <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <button
                      type="button"
                      onClick={selectAllDays}
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Select All 7 Days
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = operatingDays.includes(day.id);
                      return (
                        <button
                          type="button"
                          key={day.id}
                          onClick={() => toggleDay(day.id)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: 700,
                            backgroundColor: isSelected ? '#111827' : '#F3F4F6',
                            color: isSelected ? '#FFFFFF' : '#4B5563',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                  {step1Errors.operatingDays && (
                    <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={13} />
                      <span>{step1Errors.operatingDays}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Footer Controls */}
            <div
              style={{
                position: 'sticky',
                bottom: 0,
                backgroundColor: '#FFFFFF',
                borderTop: '1px solid #E5E7EB',
                borderRadius: '16px',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
                zIndex: 90
              }}
            >
              <button
                type="button"
                onClick={onBack}
                style={{
                  padding: '12px 20px',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  color: '#6B7280',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: '1px solid #D1D5DB',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={{
                  padding: '12px 28px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, #D82618 100%)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px var(--color-primary-glow)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>Save & Continue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: BUSINESS VERIFICATION VIEW                                        */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <form onSubmit={handleSaveStep2} noValidate>
            {/* SECTION 1: Business Information */}
            <div
              id="field-step2-legalBusinessName"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#FEF3C7',
                    color: '#B45309',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Business Entity & Tax Information
                  </h2>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0' }}>
                    Enter registered business and tax identification as per government documents.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Legal Business Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={legalBusinessName}
                    onChange={(e) => {
                      setLegalBusinessName(e.target.value);
                      if (step2Errors.legalBusinessName) {
                        setStep2Errors((prev) => {
                          const n = { ...prev };
                          delete n.legalBusinessName;
                          return n;
                        });
                      }
                    }}
                    placeholder="e.g. Royal Foods Private Limited or Ramesh Kumar (Proprietor)"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: step2Errors.legalBusinessName ? '1.5px solid #EF4444' : '1px solid #D1D5DB',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#111827',
                      outline: 'none'
                    }}
                  />
                  {step2Errors.legalBusinessName && (
                    <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={13} />
                      <span>{step2Errors.legalBusinessName}</span>
                    </p>
                  )}
                </div>

                <div id="field-step2-businessType">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                    Business Constitution Type <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                    {BUSINESS_TYPES.map((type) => {
                      const isSelected = businessType === type;
                      return (
                        <div
                          key={type}
                          onClick={() => {
                            setBusinessType(type);
                            if (step2Errors.businessType) {
                              setStep2Errors((prev) => {
                                const n = { ...prev };
                                delete n.businessType;
                                return n;
                              });
                            }
                          }}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '10px',
                            border: isSelected ? '2px solid var(--color-primary)' : '1px solid #E5E7EB',
                            backgroundColor: isSelected ? '#FFF5F4' : '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? 'var(--color-primary)' : '#111827' }}>
                            {type}
                          </span>
                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              border: isSelected ? '5px solid var(--color-primary)' : '1.5px solid #D1D5DB',
                              backgroundColor: '#FFFFFF'
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* PAN Number */}
                <div id="field-step2-panNumber">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Business / Proprietor PAN Number <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={panNumber}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      setPanNumber(val);
                      if (step2Errors.panNumber) {
                        setStep2Errors((prev) => {
                          const n = { ...prev };
                          delete n.panNumber;
                          return n;
                        });
                      }
                    }}
                    placeholder="e.g. ABCDE1234F"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: step2Errors.panNumber ? '1.5px solid #EF4444' : '1px solid #D1D5DB',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                      backgroundColor: '#FFFFFF',
                      color: '#111827',
                      outline: 'none'
                    }}
                  />
                  {step2Errors.panNumber && (
                    <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={13} />
                      <span>{step2Errors.panNumber}</span>
                    </p>
                  )}
                </div>

                {/* GST Registration Options */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                    GST Registration Status <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                      <input
                        type="radio"
                        name="gstRegistered"
                        value="yes"
                        checked={gstRegistered === 'yes'}
                        onChange={() => setGstRegistered('yes')}
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      <span>Registered under GST</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                      <input
                        type="radio"
                        name="gstRegistered"
                        value="no"
                        checked={gstRegistered === 'no'}
                        onChange={() => {
                          setGstRegistered('no');
                          setGstin('');
                          setGstDoc(null);
                          setStep2Errors((prev) => {
                            const n = { ...prev };
                            delete n.gstin;
                            delete n.gst;
                            return n;
                          });
                        }}
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      <span>Not Registered / Composition Scheme</span>
                    </label>
                  </div>
                </div>

                {/* GSTIN (If registered) */}
                {gstRegistered === 'yes' && (
                  <div id="field-step2-gstin">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      GSTIN (15-Character Tax Identification Number) <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      value={gstin}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                        setGstin(val);
                        if (step2Errors.gstin) {
                          setStep2Errors((prev) => {
                            const n = { ...prev };
                            delete n.gstin;
                            return n;
                          });
                        }
                      }}
                      placeholder="e.g. 29ABCDE1234F1Z5"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: step2Errors.gstin ? '1.5px solid #EF4444' : '1px solid #D1D5DB',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em',
                        backgroundColor: '#FFFFFF',
                        color: '#111827',
                        outline: 'none'
                      }}
                    />
                    {step2Errors.gstin && (
                      <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={13} />
                        <span>{step2Errors.gstin}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 2: FSSAI License */}
            <div
              id="field-step2-fssaiNumber"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Food Safety & Standards Authority (FSSAI) License
                  </h2>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0' }}>
                    Mandatory food safety license as per the Food Safety and Standards Act.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    14-Digit FSSAI License Number <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={14}
                    value={fssaiNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setFssaiNumber(val);
                      if (step2Errors.fssaiNumber) {
                        setStep2Errors((prev) => {
                          const n = { ...prev };
                          delete n.fssaiNumber;
                          return n;
                        });
                      }
                    }}
                    placeholder="e.g. 11223344556677"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: step2Errors.fssaiNumber ? '1.5px solid #EF4444' : '1px solid #D1D5DB',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                      backgroundColor: '#FFFFFF',
                      color: '#111827',
                      outline: 'none'
                    }}
                  />
                  {step2Errors.fssaiNumber && (
                    <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={13} />
                      <span>{step2Errors.fssaiNumber}</span>
                    </p>
                  )}
                </div>

                <div id="field-step2-fssaiExpiryDate">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    License Valid Until <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={fssaiExpiryDate}
                    onChange={(e) => {
                      setFssaiExpiryDate(e.target.value);
                      if (step2Errors.fssaiExpiryDate) {
                        setStep2Errors((prev) => {
                          const n = { ...prev };
                          delete n.fssaiExpiryDate;
                          return n;
                        });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: step2Errors.fssaiExpiryDate ? '1.5px solid #EF4444' : '1px solid #D1D5DB',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#111827',
                      outline: 'none'
                    }}
                  />
                  {step2Errors.fssaiExpiryDate && (
                    <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={13} />
                      <span>{step2Errors.fssaiExpiryDate}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 3: Document Uploads */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                padding: '24px',
                marginBottom: '32px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FileText size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Regulatory Document Uploads
                  </h2>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0' }}>
                    Upload clear scanned copies or photos (PDF, JPG, or PNG up to 10 MB).
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 1. PAN Document */}
                <div id="field-step2-pan">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    PAN Card Document <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  {panDoc ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        backgroundColor: '#F9FAFB',
                        border: '1px solid #D1D5DB'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: '#EFF6FF',
                            color: '#2563EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {panDoc.previewUrl ? (
                            <img src={panDoc.previewUrl} alt="PAN preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                          ) : (
                            <FileCheck size={20} />
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {panDoc.name}
                          </p>
                          <p style={{ fontSize: '11px', color: '#6B7280', margin: '2px 0 0' }}>
                            {panDoc.size} • Ready for verification
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <label
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#FFFFFF',
                            color: '#374151',
                            fontSize: '12px',
                            fontWeight: 700,
                            border: '1px solid #D1D5DB',
                            cursor: 'pointer'
                          }}
                        >
                          Replace
                          <input
                            type="file"
                            accept=".pdf,image/png,image/jpeg,image/jpg"
                            onChange={(e) => handleDocUpload('pan', e)}
                            style={{ display: 'none' }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeDoc('pan')}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            backgroundColor: '#FEE2E2',
                            color: '#DC2626',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          title="Remove document"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px 16px',
                        borderRadius: '12px',
                        border: step2Errors.pan ? '1.5px dashed #EF4444' : '2px dashed #D1D5DB',
                        backgroundColor: '#FAFAFA',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Upload size={24} color="#6B7280" style={{ marginBottom: '8px' }} />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                        Click to upload PAN Card
                      </span>
                      <span style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                        PDF, JPG, JPEG, or PNG (Max 10 MB)
                      </span>
                      <input
                        type="file"
                        accept=".pdf,image/png,image/jpeg,image/jpg"
                        onChange={(e) => handleDocUpload('pan', e)}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                  {step2Errors.pan && (
                    <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={13} />
                      <span>{step2Errors.pan}</span>
                    </p>
                  )}
                </div>

                {/* 2. FSSAI Document */}
                <div id="field-step2-fssai">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    FSSAI License Certificate <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  {fssaiDoc ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        backgroundColor: '#F9FAFB',
                        border: '1px solid #D1D5DB'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: '#ECFDF5',
                            color: '#059669',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {fssaiDoc.previewUrl ? (
                            <img src={fssaiDoc.previewUrl} alt="FSSAI preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                          ) : (
                            <FileCheck size={20} />
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {fssaiDoc.name}
                          </p>
                          <p style={{ fontSize: '11px', color: '#6B7280', margin: '2px 0 0' }}>
                            {fssaiDoc.size} • Ready for verification
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <label
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#FFFFFF',
                            color: '#374151',
                            fontSize: '12px',
                            fontWeight: 700,
                            border: '1px solid #D1D5DB',
                            cursor: 'pointer'
                          }}
                        >
                          Replace
                          <input
                            type="file"
                            accept=".pdf,image/png,image/jpeg,image/jpg"
                            onChange={(e) => handleDocUpload('fssai', e)}
                            style={{ display: 'none' }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeDoc('fssai')}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            backgroundColor: '#FEE2E2',
                            color: '#DC2626',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          title="Remove document"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px 16px',
                        borderRadius: '12px',
                        border: step2Errors.fssai ? '1.5px dashed #EF4444' : '2px dashed #D1D5DB',
                        backgroundColor: '#FAFAFA',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Upload size={24} color="#6B7280" style={{ marginBottom: '8px' }} />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                        Click to upload FSSAI License Document
                      </span>
                      <span style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                        PDF, JPG, JPEG, or PNG (Max 10 MB)
                      </span>
                      <input
                        type="file"
                        accept=".pdf,image/png,image/jpeg,image/jpg"
                        onChange={(e) => handleDocUpload('fssai', e)}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                  {step2Errors.fssai && (
                    <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={13} />
                      <span>{step2Errors.fssai}</span>
                    </p>
                  )}
                </div>

                {/* 3. GST Document (If registered) */}
                {gstRegistered === 'yes' && (
                  <div id="field-step2-gst">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      GST Registration Certificate <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    {gstDoc ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          backgroundColor: '#F9FAFB',
                          border: '1px solid #D1D5DB'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              backgroundColor: '#FEF3C7',
                              color: '#B45309',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            {gstDoc.previewUrl ? (
                              <img src={gstDoc.previewUrl} alt="GST preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                            ) : (
                              <FileCheck size={20} />
                            )}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {gstDoc.name}
                            </p>
                            <p style={{ fontSize: '11px', color: '#6B7280', margin: '2px 0 0' }}>
                              {gstDoc.size} • Ready for verification
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <label
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              backgroundColor: '#FFFFFF',
                              color: '#374151',
                              fontSize: '12px',
                              fontWeight: 700,
                              border: '1px solid #D1D5DB',
                              cursor: 'pointer'
                            }}
                          >
                            Replace
                            <input
                              type="file"
                              accept=".pdf,image/png,image/jpeg,image/jpg"
                              onChange={(e) => handleDocUpload('gst', e)}
                              style={{ display: 'none' }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => removeDoc('gst')}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#FEE2E2',
                              color: '#DC2626',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                            title="Remove document"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '24px 16px',
                          borderRadius: '12px',
                          border: step2Errors.gst ? '1.5px dashed #EF4444' : '2px dashed #D1D5DB',
                          backgroundColor: '#FAFAFA',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Upload size={24} color="#6B7280" style={{ marginBottom: '8px' }} />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                          Click to upload GST Registration Certificate
                        </span>
                        <span style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                          PDF, JPG, JPEG, or PNG (Max 10 MB)
                        </span>
                        <input
                          type="file"
                          accept=".pdf,image/png,image/jpeg,image/jpg"
                          onChange={(e) => handleDocUpload('gst', e)}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                    {step2Errors.gst && (
                      <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={13} />
                        <span>{step2Errors.gst}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Feature 3: Mandatory Personal KYC Verification Section */}
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 75, 58, 0.1)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>
                        Personal KYC & Identity Verification <span style={{ color: '#EF4444' }}>*</span>
                      </h3>
                      <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0' }}>
                        Statutory compliance requires both Front and Back photos for Aadhaar and Personal PAN verification.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '16px' }}>
                    {/* 1. Aadhaar Card Front */}
                    <div id="field-step2-aadhaarFront">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                          Aadhaar Card — Front Side <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: aadhaarFrontDoc ? 'rgba(46, 204, 113, 0.15)' : 'rgba(243, 156, 18, 0.15)',
                            color: aadhaarFrontDoc ? 'var(--color-veg)' : '#D97706'
                          }}
                        >
                          {aadhaarFrontDoc ? '✓ Uploaded' : 'Missing'}
                        </span>
                      </div>
                      {aadhaarFrontDoc ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#F9FAFB', border: '1px solid #D1D5DB' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#EFF6FF', flexShrink: 0 }}>
                              {aadhaarFrontDoc.previewUrl ? (
                                <img src={aadhaarFrontDoc.previewUrl} alt="Aadhaar Front" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <FileCheck size={18} />
                              )}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: '12px', fontWeight: 700, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{aadhaarFrontDoc.name}</p>
                              <p style={{ fontSize: '10px', color: '#6B7280', margin: '2px 0 0' }}>{aadhaarFrontDoc.size}</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => removeDoc('aadhaarFront')} style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', cursor: 'pointer' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ) : (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '18px 12px', borderRadius: '10px', border: step2Errors.aadhaarFront ? '1.5px dashed #EF4444' : '2px dashed #D1D5DB', backgroundColor: '#FAFAFA', cursor: 'pointer' }}>
                          <Upload size={20} color="#6B7280" style={{ marginBottom: '6px' }} />
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>Upload Aadhaar Front</span>
                          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Photo with portrait & number (Max 5MB)</span>
                          <input type="file" accept=".pdf,image/png,image/jpeg,image/jpg" onChange={(e) => handleDocUpload('aadhaarFront', e)} style={{ display: 'none' }} />
                        </label>
                      )}
                      {step2Errors.aadhaarFront && (
                        <p style={{ fontSize: '11px', color: '#EF4444', margin: '4px 0 0' }}>{step2Errors.aadhaarFront}</p>
                      )}
                    </div>

                    {/* 2. Aadhaar Card Back */}
                    <div id="field-step2-aadhaarBack">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                          Aadhaar Card — Back Side <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: aadhaarBackDoc ? 'rgba(46, 204, 113, 0.15)' : 'rgba(243, 156, 18, 0.15)',
                            color: aadhaarBackDoc ? 'var(--color-veg)' : '#D97706'
                          }}
                        >
                          {aadhaarBackDoc ? '✓ Uploaded' : 'Missing'}
                        </span>
                      </div>
                      {aadhaarBackDoc ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#F9FAFB', border: '1px solid #D1D5DB' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#EFF6FF', flexShrink: 0 }}>
                              {aadhaarBackDoc.previewUrl ? (
                                <img src={aadhaarBackDoc.previewUrl} alt="Aadhaar Back" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <FileCheck size={18} />
                              )}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: '12px', fontWeight: 700, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{aadhaarBackDoc.name}</p>
                              <p style={{ fontSize: '10px', color: '#6B7280', margin: '2px 0 0' }}>{aadhaarBackDoc.size}</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => removeDoc('aadhaarBack')} style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', cursor: 'pointer' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ) : (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '18px 12px', borderRadius: '10px', border: step2Errors.aadhaarBack ? '1.5px dashed #EF4444' : '2px dashed #D1D5DB', backgroundColor: '#FAFAFA', cursor: 'pointer' }}>
                          <Upload size={20} color="#6B7280" style={{ marginBottom: '6px' }} />
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>Upload Aadhaar Back</span>
                          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Address & QR code side (Max 5MB)</span>
                          <input type="file" accept=".pdf,image/png,image/jpeg,image/jpg" onChange={(e) => handleDocUpload('aadhaarBack', e)} style={{ display: 'none' }} />
                        </label>
                      )}
                      {step2Errors.aadhaarBack && (
                        <p style={{ fontSize: '11px', color: '#EF4444', margin: '4px 0 0' }}>{step2Errors.aadhaarBack}</p>
                      )}
                    </div>

                    {/* 3. Personal PAN Front */}
                    <div id="field-step2-personalPanFront">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                          Personal PAN Card — Front Side <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: personalPanFrontDoc ? 'rgba(46, 204, 113, 0.15)' : 'rgba(243, 156, 18, 0.15)',
                            color: personalPanFrontDoc ? 'var(--color-veg)' : '#D97706'
                          }}
                        >
                          {personalPanFrontDoc ? '✓ Uploaded' : 'Missing'}
                        </span>
                      </div>
                      {personalPanFrontDoc ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#F9FAFB', border: '1px solid #D1D5DB' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#EFF6FF', flexShrink: 0 }}>
                              {personalPanFrontDoc.previewUrl ? (
                                <img src={personalPanFrontDoc.previewUrl} alt="PAN Front" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <FileCheck size={18} />
                              )}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: '12px', fontWeight: 700, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{personalPanFrontDoc.name}</p>
                              <p style={{ fontSize: '10px', color: '#6B7280', margin: '2px 0 0' }}>{personalPanFrontDoc.size}</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => removeDoc('personalPanFront')} style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', cursor: 'pointer' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ) : (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '18px 12px', borderRadius: '10px', border: step2Errors.personalPanFront ? '1.5px dashed #EF4444' : '2px dashed #D1D5DB', backgroundColor: '#FAFAFA', cursor: 'pointer' }}>
                          <Upload size={20} color="#6B7280" style={{ marginBottom: '6px' }} />
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>Upload Personal PAN Front</span>
                          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Photo, Name & Signature side (Max 5MB)</span>
                          <input type="file" accept=".pdf,image/png,image/jpeg,image/jpg" onChange={(e) => handleDocUpload('personalPanFront', e)} style={{ display: 'none' }} />
                        </label>
                      )}
                      {step2Errors.personalPanFront && (
                        <p style={{ fontSize: '11px', color: '#EF4444', margin: '4px 0 0' }}>{step2Errors.personalPanFront}</p>
                      )}
                    </div>

                    {/* 4. Personal PAN Back */}
                    <div id="field-step2-personalPanBack">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                          Personal PAN Card — Back Side <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: personalPanBackDoc ? 'rgba(46, 204, 113, 0.15)' : 'rgba(243, 156, 18, 0.15)',
                            color: personalPanBackDoc ? 'var(--color-veg)' : '#D97706'
                          }}
                        >
                          {personalPanBackDoc ? '✓ Uploaded' : 'Missing'}
                        </span>
                      </div>
                      {personalPanBackDoc ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#F9FAFB', border: '1px solid #D1D5DB' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#EFF6FF', flexShrink: 0 }}>
                              {personalPanBackDoc.previewUrl ? (
                                <img src={personalPanBackDoc.previewUrl} alt="PAN Back" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <FileCheck size={18} />
                              )}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: '12px', fontWeight: 700, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{personalPanBackDoc.name}</p>
                              <p style={{ fontSize: '10px', color: '#6B7280', margin: '2px 0 0' }}>{personalPanBackDoc.size}</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => removeDoc('personalPanBack')} style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', cursor: 'pointer' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ) : (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '18px 12px', borderRadius: '10px', border: step2Errors.personalPanBack ? '1.5px dashed #EF4444' : '2px dashed #D1D5DB', backgroundColor: '#FAFAFA', cursor: 'pointer' }}>
                          <Upload size={20} color="#6B7280" style={{ marginBottom: '6px' }} />
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>Upload Personal PAN Back</span>
                          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Back or QR verification side (Max 5MB)</span>
                          <input type="file" accept=".pdf,image/png,image/jpeg,image/jpg" onChange={(e) => handleDocUpload('personalPanBack', e)} style={{ display: 'none' }} />
                        </label>
                      )}
                      {step2Errors.personalPanBack && (
                        <p style={{ fontSize: '11px', color: '#EF4444', margin: '4px 0 0' }}>{step2Errors.personalPanBack}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Footer Controls */}
            <div
              style={{
                position: 'sticky',
                bottom: 0,
                backgroundColor: '#FFFFFF',
                borderTop: '1px solid #E5E7EB',
                borderRadius: '16px',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
                zIndex: 90
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  backgroundColor: '#F3F4F6',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to Restaurant Details</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={onBack}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '10px',
                    backgroundColor: 'transparent',
                    color: '#6B7280',
                    fontSize: '14px',
                    fontWeight: 700,
                    border: '1px solid #D1D5DB',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    padding: '12px 28px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, #D82618 100%)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px var(--color-primary-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>Save & Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: BANK & PAYOUTS VIEW                                               */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <form onSubmit={handleSaveStep3} noValidate>
            {/* Temporary Confirmation Banner upon validating Step 3 */}
            {isStep3Complete && (
              <div
                style={{
                  backgroundColor: '#ECFDF5',
                  border: '1.5px solid #10B981',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
                  animation: 'fadeIn 0.25s ease'
                }}
              >
                <CheckCircle2 size={24} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#065F46', margin: '0 0 4px' }}>
                    Bank & Payout Details Completed
                  </h4>
                  <p style={{ fontSize: '13px', color: '#047857', margin: '0 0 12px', lineHeight: 1.4 }}>
                    Bank and payout information for <b>{accountHolderName}</b> ({bankName} • {accountType} Account) has been validated and recorded.
                    Your application details are now complete and ready for the final Review & Submit step (Step 4).
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(4);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        backgroundColor: '#059669',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Proceed to Review & Submit (Step 4) →
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(2);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#FFFFFF',
                        color: '#374151',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: '1px solid #D1D5DB',
                        cursor: 'pointer'
                      }}
                    >
                      Review Step 2 (Business Verification)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#FFFFFF',
                        color: '#374151',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: '1px solid #D1D5DB',
                        cursor: 'pointer'
                      }}
                    >
                      Review Step 1 (Restaurant Details)
                    </button>
                    <button
                      type="button"
                      onClick={onBack}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#FFFFFF',
                        color: '#6B7280',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: '1px solid #D1D5DB',
                        cursor: 'pointer'
                      }}
                    >
                      Return to Dashboard
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 1: Bank Account Details */}
            <div
              id="field-step3-accountHolderName"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Landmark size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Bank Account Details
                  </h2>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0' }}>
                    Enter the bank account where online order earnings and customer payouts will be deposited.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Account Holder Name */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                      Account Holder Name <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {legalBusinessName && !accountHolderName && (
                        <button
                          type="button"
                          onClick={() => {
                            setAccountHolderName(legalBusinessName);
                            if (step3Errors.accountHolderName) {
                              setStep3Errors((prev) => {
                                const n = { ...prev };
                                delete n.accountHolderName;
                                return n;
                              });
                            }
                          }}
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#2563EB',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          Use "{legalBusinessName}"
                        </button>
                      )}
                      {ownerName && !accountHolderName && !legalBusinessName && (
                        <button
                          type="button"
                          onClick={() => {
                            setAccountHolderName(ownerName);
                            if (step3Errors.accountHolderName) {
                              setStep3Errors((prev) => {
                                const n = { ...prev };
                                delete n.accountHolderName;
                                return n;
                              });
                            }
                          }}
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#2563EB',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          Use "{ownerName}"
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => {
                      setAccountHolderName(e.target.value);
                      if (step3Errors.accountHolderName) {
                        setStep3Errors((prev) => {
                          const n = { ...prev };
                          delete n.accountHolderName;
                          return n;
                        });
                      }
                    }}
                    placeholder="Full name as printed in passbook / bank statement"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: step3Errors.accountHolderName ? '1.5px solid #EF4444' : '1px solid #D1D5DB',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#111827',
                      outline: 'none'
                    }}
                  />
                  {step3Errors.accountHolderName && (
                    <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={13} />
                      <span>{step3Errors.accountHolderName}</span>
                    </p>
                  )}
                </div>

                {/* Bank Name */}
                <div id="field-step3-bankName">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Bank Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => {
                      setBankName(e.target.value);
                      if (step3Errors.bankName) {
                        setStep3Errors((prev) => {
                          const n = { ...prev };
                          delete n.bankName;
                          return n;
                        });
                      }
                    }}
                    placeholder="e.g. HDFC Bank, ICICI Bank, State Bank of India"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: step3Errors.bankName ? '1.5px solid #EF4444' : '1px solid #D1D5DB',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#111827',
                      outline: 'none'
                    }}
                  />

                  {/* Quick Select Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#6B7280', alignSelf: 'center', marginRight: '2px' }}>
                      Popular:
                    </span>
                    {POPULAR_BANKS.map((b) => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => {
                          setBankName(b);
                          if (step3Errors.bankName) {
                            setStep3Errors((prev) => {
                              const n = { ...prev };
                              delete n.bankName;
                              return n;
                            });
                          }
                        }}
                        style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: bankName === b ? '#EFF6FF' : '#F3F4F6',
                          color: bankName === b ? '#1D4ED8' : '#4B5563',
                          border: bankName === b ? '1px solid #93C5FD' : '1px solid #E5E7EB',
                          cursor: 'pointer'
                        }}
                      >
                        {b}
                      </button>
                    ))}
                  </div>

                  {step3Errors.bankName && (
                    <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={13} />
                      <span>{step3Errors.bankName}</span>
                    </p>
                  )}
                </div>

                {/* Account Number & Confirm Account Number */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div id="field-step3-accountNumber">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      Bank Account Number <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      maxLength={18}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setAccountNumber(val);
                        if (step3Errors.accountNumber) {
                          setStep3Errors((prev) => {
                            const n = { ...prev };
                            delete n.accountNumber;
                            return n;
                          });
                        }
                      }}
                      placeholder="9 to 18 digit account number"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: step3Errors.accountNumber ? '1.5px solid #EF4444' : '1px solid #D1D5DB',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em',
                        backgroundColor: '#FFFFFF',
                        color: '#111827',
                        outline: 'none'
                      }}
                    />
                    {step3Errors.accountNumber && (
                      <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={13} />
                        <span>{step3Errors.accountNumber}</span>
                      </p>
                    )}
                  </div>

                  <div id="field-step3-confirmAccountNumber">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      Confirm Bank Account Number <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={confirmAccountNumber}
                      maxLength={18}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setConfirmAccountNumber(val);
                        if (step3Errors.confirmAccountNumber) {
                          setStep3Errors((prev) => {
                            const n = { ...prev };
                            delete n.confirmAccountNumber;
                            return n;
                          });
                        }
                      }}
                      placeholder="Re-enter bank account number"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: step3Errors.confirmAccountNumber ? '1.5px solid #EF4444' : '1px solid #D1D5DB',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em',
                        backgroundColor: '#FFFFFF',
                        color: '#111827',
                        outline: 'none'
                      }}
                    />
                    {step3Errors.confirmAccountNumber && (
                      <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={13} />
                        <span>{step3Errors.confirmAccountNumber}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* IFSC Code */}
                <div id="field-step3-ifscCode">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    11-Character IFSC Code <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={ifscCode}
                    maxLength={11}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      setIfscCode(val);
                      if (step3Errors.ifscCode) {
                        setStep3Errors((prev) => {
                          const n = { ...prev };
                          delete n.ifscCode;
                          return n;
                        });
                      }
                    }}
                    placeholder="e.g. HDFC0001234"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: step3Errors.ifscCode ? '1.5px solid #EF4444' : '1px solid #D1D5DB',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                      backgroundColor: '#FFFFFF',
                      color: '#111827',
                      outline: 'none'
                    }}
                  />
                  <p style={{ fontSize: '11px', color: '#6B7280', margin: '4px 0 0' }}>
                    Format: 4 letters, followed by 0, followed by 6 alphanumeric branch characters.
                  </p>
                  {step3Errors.ifscCode && (
                    <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={13} />
                      <span>{step3Errors.ifscCode}</span>
                    </p>
                  )}
                </div>

                {/* Account Type Selection */}
                <div id="field-step3-accountType">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                    Account Type <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    <div
                      onClick={() => setAccountType('Current')}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: accountType === 'Current' ? '2px solid #059669' : '1px solid #E5E7EB',
                        backgroundColor: accountType === 'Current' ? '#ECFDF5' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: accountType === 'Current' ? '#065F46' : '#111827' }}>
                          Current Account
                        </div>
                        <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                          Recommended for registered commercial & business entities
                        </div>
                      </div>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: accountType === 'Current' ? '5px solid #059669' : '1.5px solid #D1D5DB',
                          backgroundColor: '#FFFFFF',
                          flexShrink: 0
                        }}
                      />
                    </div>

                    <div
                      onClick={() => setAccountType('Savings')}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: accountType === 'Savings' ? '2px solid #059669' : '1px solid #E5E7EB',
                        backgroundColor: accountType === 'Savings' ? '#ECFDF5' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: accountType === 'Savings' ? '#065F46' : '#111827' }}>
                          Savings Account
                        </div>
                        <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                          For sole proprietorships or individual home chefs
                        </div>
                      </div>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: accountType === 'Savings' ? '5px solid #059669' : '1.5px solid #D1D5DB',
                          backgroundColor: '#FFFFFF',
                          flexShrink: 0
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Payout Information */}
            <div
              id="field-step3-payoutFrequency"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#FEF3C7',
                    color: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <DollarSign size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Payout Information & Schedule
                  </h2>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0' }}>
                    Choose settlement cycles and specify the destination email for remittance invoices.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Payout Frequency Options */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                    Preferred Payout Frequency <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {[
                      { id: 'Daily', title: 'Daily Settlement', desc: 'Direct NEFT transfer every working morning' },
                      { id: 'Weekly', title: 'Weekly Settlement', desc: 'Consolidated settlement every Monday' },
                      { id: 'Monthly', title: 'Monthly Settlement', desc: 'Single payout on the 1st of every month' }
                    ].map((freq) => {
                      const isSelected = payoutFrequency === freq.id;
                      return (
                        <div
                          key={freq.id}
                          onClick={() => setPayoutFrequency(freq.id as any)}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            border: isSelected ? '2px solid #D97706' : '1px solid #E5E7EB',
                            backgroundColor: isSelected ? '#FFFBEB' : '#FFFFFF',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: isSelected ? '#B45309' : '#111827' }}>
                              {freq.title}
                            </span>
                            <div
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                border: isSelected ? '5px solid #D97706' : '1.5px solid #D1D5DB',
                                backgroundColor: '#FFFFFF'
                              }}
                            />
                          </div>
                          <p style={{ fontSize: '11px', color: '#6B7280', margin: 0, lineHeight: 1.3 }}>
                            {freq.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Payout Email Address */}
                <div id="field-step3-payoutEmail">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                      Payout & Remittance Email Address <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    {emailAddress && !payoutEmail && (
                      <button
                        type="button"
                        onClick={() => {
                          setPayoutEmail(emailAddress);
                          if (step3Errors.payoutEmail) {
                            setStep3Errors((prev) => {
                              const n = { ...prev };
                              delete n.payoutEmail;
                              return n;
                            });
                          }
                        }}
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#2563EB',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        Use "{emailAddress}"
                      </button>
                    )}
                  </div>
                  <input
                    type="email"
                    value={payoutEmail}
                    onChange={(e) => {
                      setPayoutEmail(e.target.value);
                      if (step3Errors.payoutEmail) {
                        setStep3Errors((prev) => {
                          const n = { ...prev };
                          delete n.payoutEmail;
                          return n;
                        });
                      }
                    }}
                    placeholder="accounts@restaurant.com"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: step3Errors.payoutEmail ? '1.5px solid #EF4444' : '1px solid #D1D5DB',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#111827',
                      outline: 'none'
                    }}
                  />
                  <p style={{ fontSize: '11px', color: '#6B7280', margin: '4px 0 0' }}>
                    Daily transfer UTR receipts, GST tax invoices, and commission breakdowns will be emailed here.
                  </p>
                  {step3Errors.payoutEmail && (
                    <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={13} />
                      <span>{step3Errors.payoutEmail}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 3: Optional Supporting Document */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                padding: '24px',
                marginBottom: '32px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CreditCard size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Supporting Bank Document <span style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280' }}>(Optional)</span>
                  </h2>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0' }}>
                    Upload a Cancelled Cheque, Bank Passbook front page, or Bank Statement to expedite settlement clearance.
                  </p>
                </div>
              </div>

              <div id="field-step3-cheque">
                {chequeDoc ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #D1D5DB'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {chequeDoc.previewUrl ? (
                          <img src={chequeDoc.previewUrl} alt="Cheque preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                        ) : (
                          <FileCheck size={20} />
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {chequeDoc.name}
                        </p>
                        <p style={{ fontSize: '11px', color: '#6B7280', margin: '2px 0 0' }}>
                          {chequeDoc.size} • Attached as bank verification proof
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <label
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: '#FFFFFF',
                          color: '#374151',
                          fontSize: '12px',
                          fontWeight: 700,
                          border: '1px solid #D1D5DB',
                          cursor: 'pointer'
                        }}
                      >
                        Replace
                        <input
                          type="file"
                          accept=".pdf,image/png,image/jpeg,image/jpg"
                          onChange={(e) => handleDocUpload('cheque', e)}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeDoc('cheque')}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          backgroundColor: '#FEE2E2',
                          color: '#DC2626',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        title="Remove document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '24px 16px',
                      borderRadius: '12px',
                      border: '2px dashed #D1D5DB',
                      backgroundColor: '#FAFAFA',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Upload size={24} color="#6B7280" style={{ marginBottom: '8px' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                      Click to upload Cancelled Cheque or Bank Passbook
                    </span>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                      PDF, JPG, JPEG, or PNG (Max 10 MB) • Optional
                    </span>
                    <input
                      type="file"
                      accept=".pdf,image/png,image/jpeg,image/jpg"
                      onChange={(e) => handleDocUpload('cheque', e)}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
                {step3Errors.cheque && (
                  <p style={{ fontSize: '12px', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={13} />
                    <span>{step3Errors.cheque}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Form Footer Controls */}
            <div
              style={{
                position: 'sticky',
                bottom: 0,
                backgroundColor: '#FFFFFF',
                borderTop: '1px solid #E5E7EB',
                borderRadius: '16px',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
                zIndex: 90
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(2);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  backgroundColor: '#F3F4F6',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to Business Verification</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={onBack}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '10px',
                    backgroundColor: 'transparent',
                    color: '#6B7280',
                    fontSize: '14px',
                    fontWeight: 700,
                    border: '1px solid #D1D5DB',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    padding: '12px 28px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, #D82618 100%)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px var(--color-primary-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>Save & Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: REVIEW & SUBMIT VIEW                                              */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div>
            {!isSubmitted ? (
              <form onSubmit={handleSubmitApplication} noValidate>
                {/* Info Callout */}
                <div
                  style={{
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <Info size={20} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1E40AF', margin: '0 0 2px' }}>
                      Final Application Review
                    </h4>
                    <p style={{ fontSize: '13px', color: '#1D4ED8', margin: 0, lineHeight: 1.4 }}>
                      Please carefully inspect the information below before submitting. Sensitive business and banking identifiers are masked for security. Click <b>Edit</b> on any section to modify entered details.
                    </p>
                  </div>
                </div>

                {/* 1. RESTAURANT DETAILS SUMMARY CARD */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E5E7EB',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '18px',
                      paddingBottom: '14px',
                      borderBottom: '1px solid #F3F4F6'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          backgroundColor: '#FFF5F4',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Store size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>
                          1. Restaurant Details
                        </h3>
                        <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                          Public brand profile, categories & primary contact
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#FFF5F4',
                        color: 'var(--color-primary)',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: '1px solid #FEE2E2',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={13} />
                      <span>Edit Details</span>
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Restaurant Name
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: '3px 0 0' }}>
                        {restaurantName || '—'}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Restaurant Type
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#374151', margin: '3px 0 0' }}>
                        {restaurantType || '—'}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Restaurant Logo
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        {restaurantLogo ? (
                          <>
                            <img
                              src={restaurantLogo}
                              alt="Logo preview"
                              style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #E5E7EB' }}
                            />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669' }}>Logo Attached</span>
                          </>
                        ) : (
                          <span style={{ fontSize: '13px', color: '#6B7280' }}>Not provided</span>
                        )}
                      </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Cuisine Types
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                        {selectedCuisines.length > 0 ? (
                          selectedCuisines.map((c) => (
                            <span
                              key={c}
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '3px 9px',
                                borderRadius: '6px',
                                backgroundColor: '#F3F4F6',
                                color: '#374151'
                              }}
                            >
                              {c}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '13px', color: '#6B7280' }}>—</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Owner / Manager Name
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '3px 0 0' }}>
                        {ownerName || '—'}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Contact Phone
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151', margin: '3px 0 0' }}>
                        {contactNumber || '—'}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Contact Email
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151', margin: '3px 0 0' }}>
                        {emailAddress || '—'}
                      </p>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Physical Outlet Location
                      </span>
                      <p style={{ fontSize: '13px', color: '#374151', margin: '3px 0 0', lineHeight: 1.4 }}>
                        {fullAddress ? `${fullAddress}, ${landmark ? `${landmark}, ` : ''}${city}, ${stateName} - ${pinCode}` : '—'}
                      </p>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Operating Schedule
                      </span>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: '3px 0 0' }}>
                        {openingTime} to {closingTime} • Operating Days: {operatingDays.join(', ')}
                      </p>
                    </div>

                    {description && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Description
                        </span>
                        <p style={{ fontSize: '13px', color: '#4B5563', margin: '3px 0 0', fontStyle: 'italic' }}>
                          "{description}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. BUSINESS VERIFICATION SUMMARY CARD */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E5E7EB',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '18px',
                      paddingBottom: '14px',
                      borderBottom: '1px solid #F3F4F6'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          backgroundColor: '#FEF3C7',
                          color: '#B45309',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>
                          2. Business Verification
                        </h3>
                        <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                          Entity constitution, tax information & regulatory licenses
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(2);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#FEF3C7',
                        color: '#B45309',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: '1px solid #FDE68A',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={13} />
                      <span>Edit Verification</span>
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Legal Business Name
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: '3px 0 0' }}>
                        {legalBusinessName || '—'}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Business Type
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#374151', margin: '3px 0 0' }}>
                        {businessType || '—'}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        PAN Number (Masked)
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: '3px 0 0', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                        {panNumber ? maskPanNumber(panNumber) : '—'}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        PAN Document Upload
                      </span>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: panDoc ? '#059669' : '#EF4444', margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileCheck size={14} />
                        <span>{panDoc ? `${panDoc.name} (${panDoc.size})` : 'Not uploaded'}</span>
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        GST Status
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#374151', margin: '3px 0 0' }}>
                        {gstRegistered === 'yes' ? 'Registered' : 'Not Registered'}
                      </p>
                    </div>

                    {gstRegistered === 'yes' && (
                      <>
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            GSTIN (Masked)
                          </span>
                          <p style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: '3px 0 0', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                            {gstin ? maskGstin(gstin) : '—'}
                          </p>
                        </div>

                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            GST Certificate Upload
                          </span>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: gstDoc ? '#059669' : '#EF4444', margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FileCheck size={14} />
                            <span>{gstDoc ? `${gstDoc.name} (${gstDoc.size})` : 'Not uploaded'}</span>
                          </p>
                        </div>
                      </>
                    )}

                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        FSSAI License Number
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: '3px 0 0', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                        {fssaiNumber || '—'}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        FSSAI Valid Until
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151', margin: '3px 0 0' }}>
                        {fssaiExpiryDate || '—'}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        FSSAI License Certificate
                      </span>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: fssaiDoc ? '#059669' : '#EF4444', margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileCheck size={14} />
                        <span>{fssaiDoc ? `${fssaiDoc.name} (${fssaiDoc.size})` : 'Not uploaded'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2B. MANDATORY PERSONAL IDENTITY (KYC) SUMMARY CARD */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E5E7EB',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '18px',
                      paddingBottom: '14px',
                      borderBottom: '1px solid #F3F4F6'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FileCheck size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>
                          2B. Owner Identity Verification (Aadhaar & PAN)
                        </h3>
                        <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                          4 mandatory personal KYC document sides (Government ID verification)
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(2);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#EFF6FF',
                        color: '#2563EB',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: '1px solid #BFDBFE',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={13} />
                      <span>Edit KYC Docs</span>
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div style={{ padding: '12px', borderRadius: '10px', border: '1px solid #E5E7EB', backgroundColor: aadhaarFrontDoc ? '#F0FDF4' : '#FEF2F2' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Aadhaar Card (Front Side) *</span>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: aadhaarFrontDoc ? '#059669' : '#DC2626', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileCheck size={14} />
                        <span>{aadhaarFrontDoc ? `${aadhaarFrontDoc.name} (${aadhaarFrontDoc.size})` : 'Missing — Required'}</span>
                      </p>
                    </div>

                    <div style={{ padding: '12px', borderRadius: '10px', border: '1px solid #E5E7EB', backgroundColor: aadhaarBackDoc ? '#F0FDF4' : '#FEF2F2' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Aadhaar Card (Back Side) *</span>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: aadhaarBackDoc ? '#059669' : '#DC2626', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileCheck size={14} />
                        <span>{aadhaarBackDoc ? `${aadhaarBackDoc.name} (${aadhaarBackDoc.size})` : 'Missing — Required'}</span>
                      </p>
                    </div>

                    <div style={{ padding: '12px', borderRadius: '10px', border: '1px solid #E5E7EB', backgroundColor: personalPanFrontDoc ? '#F0FDF4' : '#FEF2F2' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Personal PAN (Front Side) *</span>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: personalPanFrontDoc ? '#059669' : '#DC2626', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileCheck size={14} />
                        <span>{personalPanFrontDoc ? `${personalPanFrontDoc.name} (${personalPanFrontDoc.size})` : 'Missing — Required'}</span>
                      </p>
                    </div>

                    <div style={{ padding: '12px', borderRadius: '10px', border: '1px solid #E5E7EB', backgroundColor: personalPanBackDoc ? '#F0FDF4' : '#FEF2F2' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Personal PAN (Back Side) *</span>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: personalPanBackDoc ? '#059669' : '#DC2626', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileCheck size={14} />
                        <span>{personalPanBackDoc ? `${personalPanBackDoc.name} (${personalPanBackDoc.size})` : 'Missing — Required'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. BANK & PAYOUTS SUMMARY CARD */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E5E7EB',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '18px',
                      paddingBottom: '14px',
                      borderBottom: '1px solid #F3F4F6'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          backgroundColor: '#ECFDF5',
                          color: '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Landmark size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>
                          3. Bank & Payouts
                        </h3>
                        <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                          Settlement destination & schedule configuration
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(3);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#ECFDF5',
                        color: '#059669',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: '1px solid #A7F3D0',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={13} />
                      <span>Edit Bank Info</span>
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Account Holder Name
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: '3px 0 0' }}>
                        {accountHolderName || '—'}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Bank Name
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#374151', margin: '3px 0 0' }}>
                        {bankName || '—'}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Account Number (Masked)
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: '3px 0 0', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                        {accountNumber ? maskAccountNumber(accountNumber) : '—'}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        IFSC Code
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: '3px 0 0', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                        {ifscCode || '—'}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Account Type
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#374151', margin: '3px 0 0' }}>
                        {accountType} Account
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Preferred Settlement Frequency
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#374151', margin: '3px 0 0' }}>
                        {payoutFrequency} Settlement
                      </p>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Payout & Invoicing Email
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151', margin: '3px 0 0' }}>
                        {payoutEmail || '—'}
                      </p>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Supporting Bank Document
                      </span>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: chequeDoc ? '#059669' : '#6B7280', margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {chequeDoc ? (
                          <>
                            <FileCheck size={14} />
                            <span>{chequeDoc.name} ({chequeDoc.size})</span>
                          </>
                        ) : (
                          <span>None uploaded (Optional)</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. DECLARATION & CONSENT CARD */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: isConsentChecked ? '1.5px solid #10B981' : '1.5px solid #E5E7EB',
                    padding: '20px 24px',
                    marginBottom: '32px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    transition: 'border 0.2s ease'
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isConsentChecked}
                      onChange={(e) => setIsConsentChecked(e.target.checked)}
                      style={{
                        marginTop: '3px',
                        width: '18px',
                        height: '18px',
                        accentColor: 'var(--color-primary)',
                        cursor: 'pointer'
                      }}
                    />
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827', lineHeight: 1.4 }}>
                        I confirm that the information and documents provided are accurate and belong to my restaurant/business.
                      </span>
                      <p style={{ fontSize: '11px', color: '#6B7280', margin: '4px 0 0', lineHeight: 1.35 }}>
                        By submitting this application, you agree to Tomattto's Partner Terms of Service and Merchant Code of Conduct. Submitting fraudulent licenses or false bank details will result in rejection.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Step 4 Footer Controls */}
                <div
                  style={{
                    position: 'sticky',
                    bottom: 0,
                    backgroundColor: '#FFFFFF',
                    borderTop: '1px solid #E5E7EB',
                    borderRadius: '16px',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
                    zIndex: 90
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(3);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '12px 20px',
                      borderRadius: '10px',
                      backgroundColor: '#F3F4F6',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Bank & Payouts</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {submissionError && (
                      <span style={{ fontSize: '12px', color: '#DC2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={14} />
                        {submissionError}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={onBack}
                      style={{
                        padding: '12px 18px',
                        borderRadius: '10px',
                        backgroundColor: 'transparent',
                        color: '#6B7280',
                        fontSize: '14px',
                        fontWeight: 700,
                        border: '1px solid #D1D5DB',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={!isConsentChecked || isSubmitting}
                      style={{
                        padding: '12px 30px',
                        borderRadius: '10px',
                        background: isConsentChecked && !isSubmitting
                          ? 'linear-gradient(135deg, var(--color-primary) 0%, #D82618 100%)'
                          : '#E5E7EB',
                        color: isConsentChecked && !isSubmitting ? '#FFFFFF' : '#9CA3AF',
                        fontSize: '14px',
                        fontWeight: 800,
                        border: 'none',
                        cursor: isConsentChecked && !isSubmitting ? 'pointer' : 'not-allowed',
                        boxShadow: isConsentChecked && !isSubmitting ? '0 4px 14px var(--color-primary-glow)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{isSubmitting ? 'Submitting Application...' : 'Submit Application'}</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* SUBMITTED CONFIRMATION VIEW */
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1.5px solid #10B981',
                  padding: '36px 32px',
                  textAlign: 'center',
                  boxShadow: '0 8px 30px rgba(16, 185, 129, 0.12)',
                  animation: 'fadeIn 0.3s ease'
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <ShieldCheck size={36} color="#059669" />
                </div>

                <div
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    backgroundColor: '#ECFDF5',
                    color: '#065F46',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    marginBottom: '8px'
                  }}
                >
                  APPLICATION RECORDED
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#111827', margin: '0 0 8px' }}>
                  Application details submitted for review.
                </h2>
                <p style={{ fontSize: '14px', color: '#4B5563', margin: '0 auto 24px', maxWidth: '540px', lineHeight: 1.5 }}>
                  Thank you for applying to partner with Tomattto. Your application details and compliance documents have been logged and queued for review by the Partner Onboarding & Compliance team.
                </p>

                {/* Application Reference Summary Box */}
                <div
                  style={{
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    maxWidth: '560px',
                    margin: '0 auto 28px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>
                        Application Reference
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 900, color: 'var(--color-primary, #FF4B3A)', fontFamily: 'monospace', margin: '2px 0 0' }}>
                        {applicationRef || 'TOM-BLR-PENDING'}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>
                        Restaurant
                      </span>
                      <p style={{ fontSize: '13px', fontWeight: 800, color: '#111827', margin: '2px 0 0' }}>
                        {restaurantName}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>
                        Submission Timestamp
                      </span>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: '2px 0 0' }}>
                        {submissionTimestamp}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>
                        Notification Email
                      </span>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: '2px 0 0' }}>
                        {payoutEmail || emailAddress}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>
                        Review Status
                      </span>
                      <p style={{ fontSize: '13px', fontWeight: 800, color: '#D97706', margin: '2px 0 0' }}>
                        Pending Document Review
                      </p>
                    </div>
                  </div>
                </div>

                {/* What Happens Next Section */}
                <div
                  style={{
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    maxWidth: '560px',
                    margin: '0 auto 28px',
                    textAlign: 'left'
                  }}
                >
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#92400E', margin: '0 0 6px' }}>
                    What Happens Next?
                  </h4>
                  <ul style={{ fontSize: '12px', color: '#78350F', margin: 0, paddingLeft: '18px', lineHeight: 1.5 }}>
                    <li>Our compliance team will verify your FSSAI license and regulatory documents (typically 24–48 business hours).</li>
                    <li>You will receive an onboarding call from your dedicated Tomattto Merchant Partner Manager.</li>
                    <li>Digital merchant agreement and order management terminal login credentials will be emailed to you upon clearance.</li>
                  </ul>
                </div>

                {/* Final Actions */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setCurrentStep(4);
                    }}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      color: '#374151',
                      fontSize: '13px',
                      fontWeight: 700,
                      border: '1px solid #D1D5DB',
                      cursor: 'pointer'
                    }}
                  >
                    View Application Summary
                  </button>

                  <button
                    type="button"
                    onClick={onBack}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '8px',
                      backgroundColor: '#059669',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                    }}
                  >
                    Return to Partner Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
