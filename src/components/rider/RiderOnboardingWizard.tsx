import React, { useState, useEffect } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { RiderOnboardingApplication, RiderKycDocuments, RiderBankDetails } from '../../types';
import { supabase } from '../../lib/supabase';
import {
  ShieldCheck,
  User,
  FileText,
  CreditCard,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  Camera,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar,
  HeartPulse,
  Building2,
  Lock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Info,
  ArrowLeft,
  Bike,
  Loader2,
  FileCheck
} from 'lucide-react';

interface RiderOnboardingWizardProps {
  onSwitchToAdmin?: () => void;
  onBack?: () => void;
  isPreviewMode?: boolean;
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

const CITY_OPTIONS = [
  'Bengaluru',
  'Delhi NCR',
  'Mumbai',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Chandigarh'
];

export const RiderOnboardingWizard: React.FC<RiderOnboardingWizardProps> = ({
  onSwitchToAdmin,
  onBack,
  isPreviewMode = false
}) => {
  const {
    riderOnboardingStatus,
    setRiderOnboardingStatus,
    persistedRiderApp,
    fetchUserRiderApplication,
    submitRiderOnboarding,
    resetRiderOnboarding,
    allRiderApplications,
    supabaseUser,
    activeRiderApplicant,
    setIsRiderOnline
  } = useTomattto();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  // Persisted Database Identifiers
  const [applicationId, setApplicationId] = useState<string | null>(
    persistedRiderApp?.id || (isPreviewMode ? 'PREVIEW-APP-DEMO-001' : null)
  );
  const [applicationRef, setApplicationRef] = useState<string>(
    persistedRiderApp?.application_ref ||
      (isPreviewMode ? 'APP-RDR-PREVIEW-7721' : `APP-RDR-${Math.floor(1000 + Math.random() * 9000)}`)
  );

  // Step 1: Personal KYC & Operating Details State
  const [fullName, setFullName] = useState(persistedRiderApp?.full_name || '');
  const [profilePhoto, setProfilePhoto] = useState(
    persistedRiderApp?.metadata?.profile_photo ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  );
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>(
    persistedRiderApp?.metadata?.profile_photo &&
      (persistedRiderApp.metadata.profile_photo.startsWith('http://') ||
        persistedRiderApp.metadata.profile_photo.startsWith('https://') ||
        persistedRiderApp.metadata.profile_photo.startsWith('blob:'))
      ? persistedRiderApp.metadata.profile_photo
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  );

  const [phone, setPhone] = useState(persistedRiderApp?.phone || supabaseUser?.phone || '');
  const [email, setEmail] = useState(persistedRiderApp?.email || supabaseUser?.email || '');
  const [city, setCity] = useState(persistedRiderApp?.city || 'Bengaluru');
  const [vehicleType, setVehicleType] = useState<'Bike' | 'Bicycle'>(
    (persistedRiderApp?.vehicle_type as 'Bike' | 'Bicycle') || 'Bike'
  );
  const [vehicleNumber, setVehicleNumber] = useState(persistedRiderApp?.vehicle_number || '');
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState(
    persistedRiderApp?.driving_license_number || ''
  );
  const [emergencyContactName, setEmergencyContactName] = useState(
    persistedRiderApp?.emergency_contact_name || ''
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    persistedRiderApp?.emergency_contact_phone || ''
  );
  const [address, setAddress] = useState(persistedRiderApp?.metadata?.residential_address || '');
  const [bloodGroup, setBloodGroup] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-'>(
    persistedRiderApp?.metadata?.blood_group || 'B+'
  );
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(
    persistedRiderApp?.metadata?.gender || 'Male'
  );
  const [dob, setDob] = useState(persistedRiderApp?.metadata?.dob || '1999-08-15');

  // Step 2: KYC Documents State (Aadhaar, PAN, DL, RC, Bank Proof)
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

  // Step 3: Financial Details State
  const [bankDetails, setBankDetails] = useState<RiderBankDetails>({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });
  const [confirmAccNumber, setConfirmAccNumber] = useState('');

  // Synchronize persisted draft state when loaded or updated
  useEffect(() => {
    if (persistedRiderApp) {
      if (persistedRiderApp.id) setApplicationId(persistedRiderApp.id);
      if (persistedRiderApp.application_ref) setApplicationRef(persistedRiderApp.application_ref);
      if (persistedRiderApp.full_name && !fullName) setFullName(persistedRiderApp.full_name);
      if (persistedRiderApp.phone && !phone) setPhone(persistedRiderApp.phone);
      if (persistedRiderApp.email && !email) setEmail(persistedRiderApp.email);
      if (persistedRiderApp.city) setCity(persistedRiderApp.city);
      if (persistedRiderApp.vehicle_type) setVehicleType(persistedRiderApp.vehicle_type as 'Bike' | 'Bicycle');
      if (persistedRiderApp.vehicle_number && !vehicleNumber) setVehicleNumber(persistedRiderApp.vehicle_number);
      if (persistedRiderApp.driving_license_number && !drivingLicenseNumber) {
        setDrivingLicenseNumber(persistedRiderApp.driving_license_number);
      }
      if (persistedRiderApp.emergency_contact_name && !emergencyContactName) {
        setEmergencyContactName(persistedRiderApp.emergency_contact_name);
      }
      if (persistedRiderApp.emergency_contact_phone && !emergencyContactPhone) {
        setEmergencyContactPhone(persistedRiderApp.emergency_contact_phone);
      }

      // Restore metadata details
      if (persistedRiderApp.metadata) {
        if (persistedRiderApp.metadata.residential_address && !address) {
          setAddress(persistedRiderApp.metadata.residential_address);
        }
        if (persistedRiderApp.metadata.blood_group) {
          setBloodGroup(persistedRiderApp.metadata.blood_group);
        }
        if (persistedRiderApp.metadata.gender) {
          setGender(persistedRiderApp.metadata.gender);
        }
        if (persistedRiderApp.metadata.dob) {
          setDob(persistedRiderApp.metadata.dob);
        }
        if (persistedRiderApp.metadata.profile_photo) {
          const photo = persistedRiderApp.metadata.profile_photo;
          setProfilePhoto(photo);
          if (photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('blob:')) {
            setProfilePhotoPreview(photo);
          } else if (supabase) {
            supabase.storage.from('rider-kyc-documents').createSignedUrl(photo, 3600).then(({ data }) => {
              if (data?.signedUrl) {
                setProfilePhotoPreview(data.signedUrl);
              }
            });
          }
        }
      }

      // Restore uploaded KYC documents from database records
      if (persistedRiderApp.rider_documents && Array.isArray(persistedRiderApp.rider_documents)) {
        persistedRiderApp.rider_documents.forEach((doc: any) => {
          const path = doc.storage_path || '';
          let docKey: keyof RiderKycDocuments | null = null;
          if (path.includes('aadhaarFront')) docKey = 'aadhaarFront';
          else if (path.includes('aadhaarBack')) docKey = 'aadhaarBack';
          else if (path.includes('panFront')) docKey = 'panFront';
          else if (path.includes('panBack')) docKey = 'panBack';
          else if (path.includes('drivingLicenseFront')) docKey = 'drivingLicenseFront';
          else if (path.includes('drivingLicenseBack')) docKey = 'drivingLicenseBack';
          else if (path.includes('vehicleRc')) docKey = 'vehicleRc';
          else if (path.includes('bankProof')) docKey = 'bankProof';

          if (docKey) {
            if (supabase) {
              supabase.storage.from('rider-kyc-documents').createSignedUrl(path, 3600).then(({ data }) => {
                if (data?.signedUrl) {
                  setDocuments((prev) => ({ ...prev, [docKey!]: data.signedUrl }));
                } else {
                  setDocuments((prev) => ({ ...prev, [docKey!]: path }));
                }
              });
            } else {
              setDocuments((prev) => ({ ...prev, [docKey!]: path }));
            }
          }
        });
      }

      // Restore payout details if present
      const payout = Array.isArray(persistedRiderApp.rider_payout_details)
        ? persistedRiderApp.rider_payout_details[0]
        : persistedRiderApp.rider_payout_details;

      if (payout) {
        setBankDetails({
          accountHolderName: payout.account_holder_name || '',
          bankName: payout.bank_name || '',
          accountNumber: payout.account_number_masked || '',
          ifscCode: payout.ifsc_code || '',
          upiId: payout.upi_id || ''
        });
        if (payout.account_number_masked) {
          setConfirmAccNumber(payout.account_number_masked);
        }
      }
    }
  }, [persistedRiderApp]);

  // Pre-fill phone & email if authenticated via Supabase OTP or Demo Auth
  useEffect(() => {
    if (activeRiderApplicant?.phone && !phone) {
      setPhone(activeRiderApplicant.phone);
    }
    if (activeRiderApplicant?.fullName && !fullName) {
      setFullName(activeRiderApplicant.fullName);
    }
    if (supabaseUser?.email && !email) {
      setEmail(supabaseUser.email);
    }
  }, [activeRiderApplicant, supabaseUser]);

  // Auto-fill sample data for rapid testing
  const handleAutoFill = () => {
    setFullName('Arjun Sharma');
    setPhone(supabaseUser?.phone || '+91 98765 43210');
    setEmail(supabaseUser?.email || 'arjun.sharma.delivery@gmail.com');
    setCity('Bengaluru');
    setVehicleType('Bike');
    setVehicleNumber('KA 03 HP 8812');
    setDrivingLicenseNumber('KA03 20180029102');
    setEmergencyContactName('Sunita Sharma');
    setEmergencyContactPhone('+91 98450 11223');
    setAddress('Flat 304, Green Glen Layout, Bellandur, Bengaluru 560103');
    setBloodGroup('O+');
    setGender('Male');
    setDob('1997-11-20');
    setProfilePhoto('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80');
    setProfilePhotoPreview('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80');
    setProfilePhotoFile(null);

    setDocuments(DEFAULT_SAMPLE_DOCS);

    setBankDetails({
      accountHolderName: 'Arjun Sharma',
      bankName: 'State Bank of India (Bellandur Branch)',
      accountNumber: '39482019482',
      ifscCode: 'SBIN0014283',
      upiId: 'arjun.sharma@oksbi'
    });
    setConfirmAccNumber('39482019482');
    setFormErrors({});
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = 'Full Name as per Government ID is required';
    if (!phone.trim()) errors.phone = 'Active 10-digit mobile number is required';
    if (!city.trim()) errors.city = 'Operating city is required';
    if (!address.trim()) errors.address = 'Current residential address is required';
    if (!dob) errors.dob = 'Date of birth is required';

    if (vehicleType === 'Bike') {
      if (!vehicleNumber.trim()) errors.vehicleNumber = 'Vehicle registration number is required for Bike';
      if (!drivingLicenseNumber.trim()) errors.drivingLicenseNumber = 'Driving License number is required for Bike';
    }

    if (emergencyContactPhone.trim() && emergencyContactPhone.trim().replace(/\D/g, '').length < 10) {
      errors.emergencyContactPhone = 'Emergency contact should be a valid 10-digit number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 2 Validation (DL & RC required for Bike, exempted for Bicycle; Bank Proof required for all)
  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!documents.aadhaarFront) errors.aadhaarFront = 'Aadhaar Front photo is required';
    if (!documents.aadhaarBack) errors.aadhaarBack = 'Aadhaar Back photo is required';
    if (!documents.panFront) errors.panFront = 'PAN Card Front photo is required';
    if (!documents.panBack) errors.panBack = 'PAN Card Back photo is required';

    if (vehicleType === 'Bike') {
      if (!documents.drivingLicenseFront) errors.drivingLicenseFront = 'Driving License Front photo is required';
      if (!documents.drivingLicenseBack) errors.drivingLicenseBack = 'Driving License Back photo is required';
      if (!documents.vehicleRc) errors.vehicleRc = 'Vehicle Registration Certificate (RC) is required for Bike';
    }

    if (!documents.bankProof) errors.bankProof = 'Bank Proof (Cancelled Cheque or Passbook) is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    if (!bankDetails.accountHolderName.trim()) errors.accountHolderName = 'Account Holder Name is required';
    if (!bankDetails.bankName.trim()) errors.bankName = 'Bank Name is required';
    if (!bankDetails.accountNumber.trim()) errors.accountNumber = 'Account Number is required';
    if (confirmAccNumber.trim() !== bankDetails.accountNumber.trim()) {
      errors.confirmAccNumber = 'Account Numbers do not match';
    }
    if (!bankDetails.ifscCode.trim()) errors.ifscCode = 'IFSC Code is required';
    if (!bankDetails.upiId.trim()) errors.upiId = 'UPI ID is required for daily payouts';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Profile Photo Selection with Strict File Size & MIME Validation
  const handleProfilePhotoUpload = (file: File) => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      setFormErrors((prev) => ({ ...prev, profilePhoto: 'Profile photo exceeds 10MB limit.' }));
      return;
    }

    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED.includes(file.type)) {
      setFormErrors((prev) => ({ ...prev, profilePhoto: 'Only JPG, PNG, or WebP images are permitted.' }));
      return;
    }

    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.profilePhoto;
      return next;
    });

    const previewUrl = URL.createObjectURL(file);
    setProfilePhotoPreview(previewUrl);
    setProfilePhotoFile(file);
  };

  // Persist Draft Application to Supabase with Profile Photo Storage Vaulting
  const handleSaveDraft = async (advanceToStep2: boolean = false) => {
    if (!validateStep1()) return false;
    setIsSavingDraft(true);

    try {
      if (isPreviewMode || activeRiderApplicant?.isDemo) {
        if (!applicationId) {
          setApplicationId(`APP-RDR-${Math.floor(1000 + Math.random() * 9000)}`);
        }
        await new Promise((r) => setTimeout(r, 350));
        if (advanceToStep2) {
          setStep(2);
        }
        return true;
      }

      if (supabase && supabaseUser) {
        let activeAppId = applicationId;
        let activeAppRef = applicationRef;

        // 1. If not yet created, create draft application row first to get application UUID
        if (!activeAppId) {
          const generatedRef = `APP-RDR-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
          const initialPayload: Record<string, any> = {
            user_id: supabaseUser.id,
            application_ref: generatedRef,
            full_name: fullName.trim(),
            phone: phone.trim(),
            email: email.trim() || null,
            city: city.trim(),
            vehicle_type: vehicleType,
            vehicle_number: vehicleType === 'Bike' ? vehicleNumber.trim() : 'N/A',
            driving_license_number: vehicleType === 'Bike' ? drivingLicenseNumber.trim() : null,
            emergency_contact_name: emergencyContactName.trim() || null,
            emergency_contact_phone: emergencyContactPhone.trim() || null,
            status: 'draft',
            metadata: {
              residential_address: address.trim(),
              blood_group: bloodGroup,
              gender,
              dob,
              profile_photo: profilePhoto.startsWith('http') ? profilePhoto : null
            }
          };

          let { data, error } = await supabase
            .from('rider_applications')
            .insert(initialPayload)
            .select()
            .single();

          if (error && error.message?.includes('metadata')) {
            delete initialPayload.metadata;
            const retry = await supabase.from('rider_applications').insert(initialPayload).select().single();
            data = retry.data;
            error = retry.error;
          }

          if (error) {
            console.error('Failed to create rider application draft:', error);
            setIsSavingDraft(false);
            return false;
          }

          if (data) {
            activeAppId = data.id;
            activeAppRef = data.application_ref;
            setApplicationId(data.id);
            setApplicationRef(data.application_ref);
          }
        }

        // 2. Upload Profile Photo to private storage bucket if user provided a new file
        let savedPhotoPath = profilePhoto;
        if (profilePhotoFile && activeAppId) {
          const fileExt = profilePhotoFile.name.split('.').pop() || 'jpg';
          const photoStoragePath = `${activeAppId}/profile_photo.${fileExt}`;

          const { error: photoUpErr } = await supabase.storage
            .from('rider-kyc-documents')
            .upload(photoStoragePath, profilePhotoFile, {
              upsert: true,
              contentType: profilePhotoFile.type
            });

          if (!photoUpErr) {
            savedPhotoPath = photoStoragePath;
            setProfilePhoto(photoStoragePath);
          } else {
            console.warn('Profile photo storage upload warning:', photoUpErr);
          }
        }

        // 3. Update existing draft application
        if (activeAppId) {
          const updatePayload: Record<string, any> = {
            full_name: fullName.trim(),
            phone: phone.trim(),
            email: email.trim() || null,
            city: city.trim(),
            vehicle_type: vehicleType,
            vehicle_number: vehicleType === 'Bike' ? vehicleNumber.trim() : 'N/A',
            driving_license_number: vehicleType === 'Bike' ? drivingLicenseNumber.trim() : null,
            emergency_contact_name: emergencyContactName.trim() || null,
            emergency_contact_phone: emergencyContactPhone.trim() || null,
            metadata: {
              residential_address: address.trim(),
              blood_group: bloodGroup,
              gender,
              dob,
              profile_photo: savedPhotoPath
            }
          };

          let { error } = await supabase
            .from('rider_applications')
            .update(updatePayload)
            .eq('id', activeAppId);

          if (error && error.message?.includes('metadata')) {
            delete updatePayload.metadata;
            await supabase.from('rider_applications').update(updatePayload).eq('id', activeAppId);
          }
        }

        await fetchUserRiderApplication(supabaseUser.id);
      }

      if (advanceToStep2) {
        setStep(2);
      }
      return true;
    } catch (err) {
      console.error('Unexpected error persisting rider draft:', err);
      if (advanceToStep2) setStep(2);
      return false;
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Secure KYC File Upload with Safe Replacement (Zero Duplicates)
  const handleFileUpload = async (key: keyof RiderKycDocuments, file: File) => {
    // 1. Client-side Validation: File size limit 10 MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      setUploadErrors((prev) => ({ ...prev, [key]: 'File size exceeds maximum 10MB limit.' }));
      return;
    }

    // 2. MIME Type Validation
    const ALLOWED_MIME = ['image/jpeg', 'image/png', 'application/pdf', 'image/webp'];
    if (!ALLOWED_MIME.includes(file.type)) {
      setUploadErrors((prev) => ({ ...prev, [key]: 'Only JPG, PNG, WebP, or PDF formats are permitted.' }));
      return;
    }

    setUploadErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    // 3. Local data URL preview for instant feedback
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setDocuments((prev) => ({
          ...prev,
          [key]: e.target?.result as string
        }));
        setFormErrors((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    };
    reader.readAsDataURL(file);

    // 4. Remote Supabase Storage Upload & Metadata Upsert
    if (!isPreviewMode && !activeRiderApplicant?.isDemo && supabase && supabaseUser && applicationId) {
      setUploadingDocs((prev) => ({ ...prev, [key]: true }));

      try {
        const fileExt = file.name.split('.').pop() || (file.type === 'application/pdf' ? 'pdf' : 'jpg');
        // Deterministic path per document slot avoids orphan accumulation
        const storagePath = `${applicationId}/${key}.${fileExt}`;

        // Upload to private rider-kyc-documents bucket (upsert: true replaces old binary file)
        const { error: uploadErr } = await supabase.storage
          .from('rider-kyc-documents')
          .upload(storagePath, file, {
            upsert: true,
            contentType: file.type
          });

        if (uploadErr) {
          console.error('Storage upload error:', uploadErr);
          setUploadErrors((prev) => ({ ...prev, [key]: 'File upload failed. Please try again.' }));
          return;
        }

        // Map key to database kyc_doc_type enum
        const docTypeMap: Record<string, string> = {
          aadhaarFront: 'aadhaar_card',
          aadhaarBack: 'aadhaar_card',
          panFront: 'pan_card',
          panBack: 'pan_card',
          drivingLicenseFront: 'driving_license',
          drivingLicenseBack: 'driving_license',
          vehicleRc: 'vehicle_rc',
          bankProof: 'bank_proof'
        };

        const docType = docTypeMap[key] || 'aadhaar_card';

        // Check if a document record already exists for this slot to prevent duplicate rows
        const { data: existingDoc } = await supabase
          .from('rider_documents')
          .select('id, status')
          .eq('rider_application_id', applicationId)
          .eq('storage_path', storagePath)
          .maybeSingle();

        if (existingDoc && existingDoc.id && existingDoc.status === 'pending') {
          // Safe Update: Update existing pending row
          await supabase
            .from('rider_documents')
            .update({
              file_name: file.name,
              file_size: file.size,
              mime_type: file.type,
              status: 'pending'
            })
            .eq('id', existingDoc.id);
        } else {
          // Safe Insert: Insert new document row with strict status='pending'
          await supabase.from('rider_documents').insert({
            rider_application_id: applicationId,
            doc_type: docType,
            storage_bucket: 'rider-kyc-documents',
            storage_path: storagePath,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            status: 'pending'
          });
        }
      } catch (err) {
        console.error(`Error uploading KYC document [${key}]:`, err);
      } finally {
        setUploadingDocs((prev) => ({ ...prev, [key]: false }));
      }
    }
  };

  // Submit Final Application with Payout Upsert & Status Resubmission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setIsSubmitting(true);

    try {
      if (!isPreviewMode && !activeRiderApplicant?.isDemo && supabase && applicationId) {
        // Compute masked account number (e.g. XXXXXXXXX4821)
        // Plaintext bank account numbers are never persisted on client side.
        const maskedAccount =
          bankDetails.accountNumber.length > 4
            ? 'X'.repeat(bankDetails.accountNumber.length - 4) + bankDetails.accountNumber.slice(-4)
            : bankDetails.accountNumber;

        const payoutPayload = {
          rider_application_id: applicationId,
          account_holder_name: bankDetails.accountHolderName.trim(),
          bank_name: bankDetails.bankName.trim(),
          account_number_masked: maskedAccount,
          account_number_encrypted: null, // Left null: sensitive plaintext unpersisted on frontend
          ifsc_code: bankDetails.ifscCode.trim().toUpperCase(),
          upi_id: bankDetails.upiId.trim()
        };

        // 1. Safe Payout Details Upsert: Check if row exists for this application
        try {
          const { data: existingPayout } = await supabase
            .from('rider_payout_details')
            .select('id')
            .eq('rider_application_id', applicationId)
            .maybeSingle();

          if (existingPayout && existingPayout.id) {
            await supabase
              .from('rider_payout_details')
              .update(payoutPayload)
              .eq('id', existingPayout.id);
          } else {
            const { error: pInsertErr } = await supabase
              .from('rider_payout_details')
              .insert(payoutPayload);

            // Fallback to update if unique constraint race occurred
            if (pInsertErr && pInsertErr.code === '23505') {
              await supabase
                .from('rider_payout_details')
                .update(payoutPayload)
                .eq('rider_application_id', applicationId);
            }
          }
        } catch (payoutErr) {
          console.warn('Payout details persistence note (handled gracefully):', payoutErr);
        }

        // 2. Transition public.rider_applications status from 'draft' or 'action_required' to 'submitted'
        const { error: submitErr } = await supabase
          .from('rider_applications')
          .update({
            status: 'submitted',
            submitted_at: new Date().toISOString()
          })
          .eq('id', applicationId);

        if (submitErr) {
          console.error('Error updating application status to submitted:', submitErr);
        }

        if (supabaseUser) {
          await fetchUserRiderApplication(supabaseUser.id);
        }
      }

      // 3. Update in-memory context state so the live UI reacts immediately
      submitRiderOnboarding({
        applicationRef: applicationRef || `APP-RDR-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: fullName.trim(),
        profilePhoto: profilePhotoPreview,
        phone: phone.trim(),
        email: email.trim() || undefined,
        city: city.trim(),
        vehicleType,
        vehicleNumber: vehicleType === 'Bike' ? vehicleNumber.trim() : 'N/A',
        drivingLicenseNumber: vehicleType === 'Bike' ? drivingLicenseNumber.trim() : undefined,
        emergencyContactName: emergencyContactName.trim() || undefined,
        emergencyContactPhone: emergencyContactPhone.trim() || undefined,
        residentialAddress: address.trim(),
        bloodGroup,
        gender,
        dob,
        documents,
        bankDetails
      });

      setRiderOnboardingStatus('under_review');
    } catch (err) {
      console.error('Unexpected error during final application submission:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find most recent application for details display
  const recentApp = allRiderApplications[0];

  // ==========================================
  // VIEW 0: APPROVED & ACTIVATED RIDER SCREEN
  // ==========================================
  if (riderOnboardingStatus === 'approved') {
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: '#131317',
          color: '#FFFFFF',
          overflowY: 'auto',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100%'
        }}
        className="no-scrollbar"
      >
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: '#1E1E24',
            borderRadius: 'var(--radius-lg, 16px)',
            border: '1px solid rgba(46, 204, 113, 0.4)',
            padding: '32px 24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(46, 204, 113, 0.15)',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          {/* Pulsing Success Badge */}
          <div
            style={{
              position: 'relative',
              width: '80px',
              height: '80px',
              margin: '0 auto 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                backgroundColor: 'rgba(46, 204, 113, 0.25)',
                animation: 'pulse 2s infinite'
              }}
            />
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-veg, #2ECC71)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 2,
                boxShadow: '0 0 20px rgba(46, 204, 113, 0.4)'
              }}
            >
              <CheckCircle2 size={36} />
            </div>
          </div>

          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              backgroundColor: 'rgba(46, 204, 113, 0.15)',
              color: 'var(--color-veg, #2ECC71)',
              padding: '4px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(46, 204, 113, 0.4)',
              display: 'inline-block',
              marginBottom: '12px'
            }}
          >
            ✓ FLEET VERIFICATION APPROVED & ACTIVE
          </span>

          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', color: '#FFFFFF' }}>
            Welcome to the Tomattto Fleet! 🎉
          </h2>

          <p style={{ fontSize: '13px', color: '#A5A5B2', lineHeight: 1.6, marginBottom: '22px' }}>
            Congratulations, <strong>{fullName || activeRiderApplicant?.fullName || 'Delivery Partner'}</strong>! Fleet Operations has approved your government KYC, vehicle credentials, and bank account for instant daily payouts.
          </p>

          {/* Partner Credential Card */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-md, 10px)',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'left',
              fontSize: '12px',
              marginBottom: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#A5A5B2' }}>Partner Fleet ID:</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--color-primary, #FF4B3A)', fontWeight: 800 }}>
                {applicationRef || recentApp?.id || 'APP-RDR-FLEET-101'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#A5A5B2' }}>Assigned City / Hub:</span>
              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{city} Hub (Central)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#A5A5B2' }}>Delivery Vehicle:</span>
              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>
                {vehicleType === 'Bicycle' ? '🚲 Eco Bicycle' : `🛵 Motorcycle (${vehicleNumber || 'KA 03 EN 4592'})`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#A5A5B2' }}>Daily Payout UPI:</span>
              <span style={{ color: 'var(--color-veg, #2ECC71)', fontWeight: 700 }}>
                {bankDetails.upiId || 'Verified & Active'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#A5A5B2' }}>Terminal Status:</span>
              <span style={{ color: 'var(--color-veg, #2ECC71)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2ECC71', display: 'inline-block' }}></span>
                Online & Dispatch Ready
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                setIsRiderOnline(true);
                if (onBack) onBack();
              }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'var(--color-veg, #2ECC71)',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(46, 204, 113, 0.4)'
              }}
            >
              <span>Launch Delivery Terminal & Go On Duty ➔</span>
            </button>

            <button
              type="button"
              onClick={() => {
                resetRiderOnboarding();
                setStep(1);
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'transparent',
                color: '#A5A5B2',
                fontSize: '11px',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer'
              }}
            >
              <span>Reset to Test Another Application</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: UNDER REVIEW / VERIFICATION UNDER PROCESS (READ-ONLY)
  // ==========================================
  if (
    riderOnboardingStatus === 'under_review' ||
    riderOnboardingStatus === 'submitted' ||
    riderOnboardingStatus === 'in_review'
  ) {
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: '#131317',
          color: '#FFFFFF',
          overflowY: 'auto',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100%'
        }}
        className="no-scrollbar"
      >
        <div
          style={{
            maxWidth: '500px',
            width: '100%',
            backgroundColor: '#1E1E24',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '28px 24px',
            boxShadow: 'var(--shadow-xl)',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          {onBack && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '14px' }}>
              <button
                type="button"
                onClick={onBack}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s'
                }}
                title="Return to the Rider Terminal"
              >
                <ArrowLeft size={13} />
                <span>Back to Terminal</span>
              </button>
            </div>
          )}

          {/* Pulsing radar icon */}
          <div
            style={{
              position: 'relative',
              width: '80px',
              height: '80px',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                backgroundColor: 'rgba(243, 156, 18, 0.2)',
                animation: 'pulse 2s infinite'
              }}
            />
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(243, 156, 18, 0.25)',
                color: '#F39C12',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 2
              }}
            >
              <Clock size={32} />
            </div>
          </div>

          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              backgroundColor: 'rgba(243, 156, 18, 0.15)',
              color: '#F39C12',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(243, 156, 18, 0.3)',
              display: 'inline-block',
              marginBottom: '12px'
            }}
          >
            {isPreviewMode ? 'KYC Verification Under Process (Preview Mode)' : 'KYC Verification Under Process'}
          </span>

          {isPreviewMode && (
            <div
              style={{
                backgroundColor: 'rgba(243, 156, 18, 0.1)',
                border: '1px dashed rgba(243, 156, 18, 0.4)',
                borderRadius: '6px',
                padding: '6px 10px',
                marginBottom: '14px',
                fontSize: '11px',
                color: '#F39C12',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Sparkles size={12} />
              <span>Preview Mode: Simulated in local memory • No remote database updates</span>
            </div>
          )}

          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: '#FFFFFF' }}>
            We're Verifying Your Application
          </h2>

          <p style={{ fontSize: '13px', color: '#A5A5B2', lineHeight: 1.6, marginBottom: '22px' }}>
            Welcome to the Tomattto Delivery Fleet! 🛵 Your identity documents, Aadhaar, PAN card,
            vehicle credentials, and bank payout details have been submitted to Fleet Operations.
          </p>

          {/* Verification Step Timeline */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'left',
              marginBottom: '22px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
              <div style={{ color: 'var(--color-veg)', marginTop: '2px' }}>
                <CheckCircle2 size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>Documents & KYC Received</div>
                <div style={{ fontSize: '11px', color: '#A5A5B2' }}>
                  Aadhaar, PAN, vehicle credentials, bank proof & payout profile safely vaulted.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
              <div style={{ color: '#F39C12', marginTop: '2px' }}>
                <Clock size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#F39C12' }}>
                  Fleet Ops Admin Review (In Progress)
                </div>
                <div style={{ fontSize: '11px', color: '#A5A5B2' }}>
                  Compliance officers are validating government IDs & bank penny drop.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ color: '#6B7280', marginTop: '2px' }}>
                <Lock size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#9CA3AF' }}>
                  Terminal Activation & Order Dispatch
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                  Unlocks automatically the instant Operations approves your profile.
                </div>
              </div>
            </div>
          </div>

          {/* Application Details Summary (Read-Only) */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              border: '1px dashed rgba(255,255,255,0.1)',
              textAlign: 'left',
              fontSize: '12px',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#A5A5B2' }}>Applicant:</span>
              <span style={{ fontWeight: 700, color: '#FFFFFF' }}>
                {persistedRiderApp?.full_name || recentApp?.fullName || fullName}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#A5A5B2' }}>Application Ref:</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--color-primary)', fontWeight: 700 }}>
                {persistedRiderApp?.application_ref || applicationRef || recentApp?.id}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#A5A5B2' }}>Hub / City:</span>
              <span style={{ color: '#FFFFFF' }}>{persistedRiderApp?.city || city}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#A5A5B2' }}>Vehicle:</span>
              <span style={{ color: '#FFFFFF' }}>
                {persistedRiderApp?.vehicle_type || vehicleType}{' '}
                {persistedRiderApp?.vehicle_number && persistedRiderApp.vehicle_number !== 'N/A'
                  ? `(${persistedRiderApp.vehicle_number})`
                  : ''}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#A5A5B2' }}>Contact Phone:</span>
              <span style={{ color: '#FFFFFF' }}>{persistedRiderApp?.phone || recentApp?.phone || phone}</span>
            </div>
          </div>

          {/* Direct shortcut to Admin HQ for testing & Return actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => {
                if (onSwitchToAdmin) {
                  onSwitchToAdmin();
                } else {
                  alert('Switch to the Admin panel in the top bar to inspect and approve this application!');
                }
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-glow)',
                cursor: 'pointer'
              }}
            >
              <ShieldCheck size={16} />
              <span>Open Admin Panel to Approve ➔</span>
            </button>

            {/* Read-Only Status Indicator (Submitted applications are locked) */}
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#9CA3AF',
                fontSize: '11px',
                fontWeight: 600
              }}
            >
              <Lock size={13} color="#F39C12" />
              <span>Application Submitted & Locked for Review (Read-Only)</span>
            </div>

            {isPreviewMode && (
              <button
                type="button"
                onClick={() => {
                  resetRiderOnboarding();
                  setStep(1);
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(243, 156, 18, 0.15)',
                  color: '#F39C12',
                  border: '1px solid rgba(243, 156, 18, 0.35)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={13} />
                <span>Reset & Re-test Preview Flow</span>
              </button>
            )}

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                style={{
                  width: '100%',
                  padding: '9px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'transparent',
                  color: '#A5A5B2',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={12} />
                <span>Return to Demo Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: REJECTED STATE / ACTION REQUIRED
  // ==========================================
  const isActionRequired =
    riderOnboardingStatus === 'action_required' || persistedRiderApp?.status === 'action_required';

  if (
    riderOnboardingStatus === 'rejected' ||
    riderOnboardingStatus === 'action_required' ||
    persistedRiderApp?.status === 'action_required'
  ) {
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: '#131317',
          color: '#FFFFFF',
          overflowY: 'auto',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100%'
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: '#1E1E24',
            borderRadius: 'var(--radius-lg)',
            border: isActionRequired
              ? '1px solid rgba(243, 156, 18, 0.3)'
              : '1px solid rgba(231, 76, 60, 0.3)',
            padding: '28px 24px',
            textAlign: 'center'
          }}
        >
          {onBack && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '14px' }}>
              <button
                type="button"
                onClick={onBack}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s'
                }}
                title="Return to the Rider Terminal"
              >
                <ArrowLeft size={13} />
                <span>Back to Terminal</span>
              </button>
            </div>
          )}

          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: isActionRequired ? 'rgba(243, 156, 18, 0.2)' : 'rgba(231, 76, 60, 0.2)',
              color: isActionRequired ? '#F39C12' : '#E74C3C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <ShieldAlert size={32} />
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
            {isActionRequired ? 'Application Action Required' : 'Application Needs Attention'}
          </h2>
          <p style={{ fontSize: '13px', color: '#A5A5B2', marginBottom: '16px' }}>
            {isActionRequired
              ? 'Compliance reviewed your KYC documents and requested an updated or clearer scan before approval.'
              : 'Our compliance operations team encountered an issue while reviewing your documents.'}
          </p>

          <div
            style={{
              backgroundColor: isActionRequired ? 'rgba(243, 156, 18, 0.1)' : 'rgba(231, 76, 60, 0.1)',
              border: isActionRequired ? '1px solid rgba(243, 156, 18, 0.25)' : '1px solid rgba(231, 76, 60, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              fontSize: '12px',
              color: isActionRequired ? '#F39C12' : '#FF6B6B',
              textAlign: 'left',
              marginBottom: '20px'
            }}
          >
            <strong>Reviewer feedback:</strong>{' '}
            {persistedRiderApp?.rejection_reason ||
              recentApp?.rejectionReason ||
              'Driving license or Aadhaar photo was blurry or obscured. Please upload crisp, high-resolution scans.'}
          </div>

          <button
            onClick={() => {
              setStep(2);
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Update Documents & Resubmit
          </button>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              style={{
                width: '100%',
                padding: '9px',
                marginTop: '10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'transparent',
                color: '#A5A5B2',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={12} />
              <span>Return to Demo Dashboard</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: ONBOARDING APPLICATION FORM (3 STEPS)
  // ==========================================
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#131317',
        color: '#FFFFFF',
        overflowY: 'auto',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
      className="no-scrollbar"
    >
      <div style={{ maxWidth: '640px', width: '100%' }}>
        {onBack && (
          <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'flex-start' }}>
            <button
              type="button"
              onClick={onBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background-color 0.15s'
              }}
              title="Return to the Rider Terminal"
            >
              <ArrowLeft size={13} />
              <span>← Back to Terminal</span>
            </button>
          </div>
        )}

        {/* Development Sandbox Preview Banner */}
        {isPreviewMode && (
          <div
            style={{
              backgroundColor: 'rgba(243, 156, 18, 0.12)',
              border: '1px solid rgba(243, 156, 18, 0.35)',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}
          >
            <Sparkles size={18} color="#F39C12" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1, fontSize: '12px', lineHeight: 1.45 }}>
              <div style={{ fontWeight: 800, color: '#F39C12', marginBottom: '2px' }}>
                Development Sandbox Preview (No Authentication Required)
              </div>
              <div style={{ color: '#D1D5DB' }}>
                Supabase Phone OTP is currently postponed. In this preview mode, you can test all onboarding steps, form validations, motorcycle vs bicycle logic, KYC document previews, and payout configuration. All data is processed safely in client memory without writing to Supabase production tables or storage.
              </div>
            </div>
          </div>
        )}

        {/* Onboarding Header Banner */}
        <div
          style={{
            backgroundColor: '#1E1E24',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.08)',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 75, 58, 0.15)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                  Tomattto Rider Onboarding
                </h1>
                <p style={{ fontSize: '12px', color: '#A5A5B2', margin: '2px 0 0' }}>
                  Join India's fastest delivery fleet • Earn up to ₹35,000/month + Daily Payouts
                </p>
              </div>
            </div>

            {/* Quick Demo Pre-fill Button */}
            <button
              type="button"
              onClick={handleAutoFill}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(46, 204, 113, 0.15)',
                color: 'var(--color-veg)',
                border: '1px solid rgba(46, 204, 113, 0.3)',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <Sparkles size={13} />
              <span>⚡ Auto-fill Sample KYC</span>
            </button>
          </div>

          {/* Stepper Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px',
              marginTop: '18px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: '14px'
            }}
          >
            {[
              { num: 1, label: '1. Personal & Vehicle', icon: User },
              { num: 2, label: '2. KYC Documents', icon: FileText },
              { num: 3, label: '3. Bank & Payouts', icon: CreditCard }
            ].map((s) => {
              const isCurrent = step === s.num;
              const isDone = step > s.num;
              return (
                <div
                  key={s.num}
                  onClick={() => {
                    if (s.num === 1) setStep(1);
                    if (s.num === 2 && validateStep1()) handleSaveDraft(true);
                    if (s.num === 3 && validateStep1() && validateStep2()) setStep(3);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isCurrent
                      ? 'rgba(255, 75, 58, 0.15)'
                      : isDone
                      ? 'rgba(46, 204, 113, 0.1)'
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${
                      isCurrent
                        ? 'var(--color-primary)'
                        : isDone
                        ? 'var(--color-veg)'
                        : 'rgba(255,255,255,0.06)'
                    }`,
                    cursor: 'pointer'
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: isCurrent
                        ? 'var(--color-primary)'
                        : isDone
                        ? 'var(--color-veg)'
                        : 'rgba(255,255,255,0.2)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {isDone ? '✓' : s.num}
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isCurrent ? '#FFFFFF' : isDone ? 'var(--color-veg)' : '#A5A5B2',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1: PERSONAL & VEHICLE DETAILS */}
        {step === 1 && (
          <div
            style={{
              backgroundColor: '#1E1E24',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>
              Step 1: Personal KYC & Operating Details
            </h3>
            <p style={{ fontSize: '12px', color: '#A5A5B2', marginBottom: '20px' }}>
              Please enter your legal identity, operating hub, and vehicle details as printed on government documents.
            </p>

            {/* Profile Photo Picker */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '20px',
                padding: '14px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid var(--color-primary)',
                  flexShrink: 0,
                  position: 'relative'
                }}
              >
                <img
                  src={profilePhotoPreview}
                  alt="Rider Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF', display: 'block', marginBottom: '4px' }}>
                  Rider Profile Photo (Front-facing selfie)
                </label>
                <span style={{ fontSize: '11px', color: '#A5A5B2', display: 'block', marginBottom: '8px' }}>
                  Clear face without helmet, sunglasses, or mask (max 10MB JPG/PNG/WebP).
                </span>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Camera size={13} />
                  <span>Upload / Take Photo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleProfilePhotoUpload(e.target.files[0]);
                    }}
                  />
                </label>
                {formErrors.profilePhoto && (
                  <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '4px', display: 'block' }}>
                    {formErrors.profilePhoto}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {/* Full Name */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Singh"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${formErrors.fullName ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
                {formErrors.fullName && (
                  <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                    {formErrors.fullName}
                  </span>
                )}
              </div>

              {/* Phone */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Mobile Phone (Active for OTPs) *
                </label>
                <input
                  type="tel"
                  placeholder="+91 98451 92831"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${formErrors.phone ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
                {formErrors.phone && (
                  <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                    {formErrors.phone}
                  </span>
                )}
              </div>

              {/* Operating City */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Operating City / Hub *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#1E1E24',
                    border: `1px solid ${formErrors.city ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                >
                  {CITY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {formErrors.city && (
                  <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                    {formErrors.city}
                  </span>
                )}
              </div>

              {/* Vehicle Type Selection */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Delivery Vehicle Type *
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setVehicleType('Bike')}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: vehicleType === 'Bike' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                      color: '#FFFFFF',
                      border: `1px solid ${vehicleType === 'Bike' ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'}`,
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>🛵 Motorbike / Scooter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleType('Bicycle')}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: vehicleType === 'Bicycle' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                      color: '#FFFFFF',
                      border: `1px solid ${vehicleType === 'Bicycle' ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'}`,
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>🚲 Bicycle</span>
                  </button>
                </div>
              </div>

              {/* Conditional Vehicle Registration Number */}
              {vehicleType === 'Bike' && (
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                    Vehicle Registration Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KA 01 EK 4920"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${formErrors.vehicleNumber ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                      color: '#FFFFFF',
                      fontSize: '13px',
                      textTransform: 'uppercase'
                    }}
                  />
                  {formErrors.vehicleNumber && (
                    <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                      {formErrors.vehicleNumber}
                    </span>
                  )}
                </div>
              )}

              {/* Conditional Driving License Number */}
              {vehicleType === 'Bike' && (
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                    Driving License (DL) Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KA01 20190004821"
                    value={drivingLicenseNumber}
                    onChange={(e) => setDrivingLicenseNumber(e.target.value.toUpperCase())}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${formErrors.drivingLicenseNumber ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                      color: '#FFFFFF',
                      fontSize: '13px',
                      textTransform: 'uppercase'
                    }}
                  />
                  {formErrors.drivingLicenseNumber && (
                    <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                      {formErrors.drivingLicenseNumber}
                    </span>
                  )}
                </div>
              )}

              {/* Email (Optional) */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Email Address <span style={{ color: '#A5A5B2' }}>(Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. rider@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Date of Birth (Minimum 18 yrs) *
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${formErrors.dob ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                    color: '#FFFFFF',
                    fontSize: '13px',
                    colorScheme: 'dark'
                  }}
                />
                {formErrors.dob && (
                  <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                    {formErrors.dob}
                  </span>
                )}
              </div>

              {/* Gender */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Gender *
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['Male', 'Female', 'Other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      style={{
                        flex: 1,
                        padding: '9px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: gender === g ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                        color: '#FFFFFF',
                        border: `1px solid ${gender === g ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'}`,
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Blood Group */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Blood Group (For Emergency Kit) *
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#1E1E24',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                >
                  {(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const).map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              {/* Emergency Contact Name */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Singh (Father/Kin)"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* Emergency Contact Phone */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Emergency Contact Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98450 11223"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${formErrors.emergencyContactPhone ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
                {formErrors.emergencyContactPhone && (
                  <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                    {formErrors.emergencyContactPhone}
                  </span>
                )}
              </div>
            </div>

            {/* Address */}
            <div style={{ marginTop: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                Permanent / Current Residential Address *
              </label>
              <textarea
                rows={3}
                placeholder="House/Flat number, Building, Street, Landmark, City & Pincode"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${formErrors.address ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                  color: '#FFFFFF',
                  fontSize: '13px',
                  resize: 'vertical'
                }}
              />
              {formErrors.address && (
                <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                  {formErrors.address}
                </span>
              )}
            </div>

            {/* Actions: Save Draft & Proceed */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '22px' }}>
              <button
                type="button"
                onClick={() => handleSaveDraft(false)}
                disabled={isSavingDraft}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: isSavingDraft ? 'not-allowed' : 'pointer'
                }}
              >
                {isSavingDraft ? <Loader2 size={14} className="animate-spin" /> : <FileCheck size={14} />}
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveDraft(true)}
                disabled={isSavingDraft}
                style={{
                  padding: '11px 24px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-glow)',
                  cursor: isSavingDraft ? 'not-allowed' : 'pointer'
                }}
              >
                {isSavingDraft ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Documents</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DOCUMENTS UPLOAD */}
        {step === 2 && (
          <div
            style={{
              backgroundColor: '#1E1E24',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>
                  Step 2: Upload Verification Documents
                </h3>
                <p style={{ fontSize: '12px', color: '#A5A5B2' }}>
                  Upload clear photos or PDF scans of government documents (up to 10MB each).
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDocuments(DEFAULT_SAMPLE_DOCS);
                  setFormErrors({});
                }}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <Sparkles size={12} color="#F39C12" />
                <span>Fill Demo Docs</span>
              </button>
            </div>

            {/* Document Pairs Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 1. AADHAAR CARD */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '18px' }}>🪪</span>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                      Aadhaar Card (UIDAI Verified)
                    </h4>
                    <span style={{ fontSize: '11px', color: '#A5A5B2' }}>Front with photo & Back with address</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <DocUploadCard
                    title="Aadhaar Front Side *"
                    previewUrl={documents.aadhaarFront}
                    error={formErrors.aadhaarFront || uploadErrors.aadhaarFront}
                    isUploading={uploadingDocs.aadhaarFront}
                    onFileSelect={(f) => handleFileUpload('aadhaarFront', f)}
                  />
                  <DocUploadCard
                    title="Aadhaar Back Side *"
                    previewUrl={documents.aadhaarBack}
                    error={formErrors.aadhaarBack || uploadErrors.aadhaarBack}
                    isUploading={uploadingDocs.aadhaarBack}
                    onFileSelect={(f) => handleFileUpload('aadhaarBack', f)}
                  />
                </div>
              </div>

              {/* 2. PAN CARD */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '18px' }}>💳</span>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>PAN Card (Tax Identification)</h4>
                    <span style={{ fontSize: '11px', color: '#A5A5B2' }}>Front showing PAN number & Back barcode</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <DocUploadCard
                    title="PAN Front Side *"
                    previewUrl={documents.panFront}
                    error={formErrors.panFront || uploadErrors.panFront}
                    isUploading={uploadingDocs.panFront}
                    onFileSelect={(f) => handleFileUpload('panFront', f)}
                  />
                  <DocUploadCard
                    title="PAN Back Side *"
                    previewUrl={documents.panBack}
                    error={formErrors.panBack || uploadErrors.panBack}
                    isUploading={uploadingDocs.panBack}
                    onFileSelect={(f) => handleFileUpload('panBack', f)}
                  />
                </div>
              </div>

              {/* 3. VEHICLE CREDENTIALS (DRIVING LICENSE & VEHICLE RC) */}
              {vehicleType === 'Bike' ? (
                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '18px' }}>🛵</span>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                        Vehicle Credentials (Driving License & Registration RC)
                      </h4>
                      <span style={{ fontSize: '11px', color: '#A5A5B2' }}>
                        Mandatory documents for two-wheeler delivery partners
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    <DocUploadCard
                      title="Driving License Front *"
                      previewUrl={documents.drivingLicenseFront}
                      error={formErrors.drivingLicenseFront || uploadErrors.drivingLicenseFront}
                      isUploading={uploadingDocs.drivingLicenseFront}
                      onFileSelect={(f) => handleFileUpload('drivingLicenseFront', f)}
                    />
                    <DocUploadCard
                      title="Driving License Back *"
                      previewUrl={documents.drivingLicenseBack}
                      error={formErrors.drivingLicenseBack || uploadErrors.drivingLicenseBack}
                      isUploading={uploadingDocs.drivingLicenseBack}
                      onFileSelect={(f) => handleFileUpload('drivingLicenseBack', f)}
                    />
                    <DocUploadCard
                      title="Vehicle Registration Certificate (RC) *"
                      previewUrl={documents.vehicleRc || null}
                      error={formErrors.vehicleRc || uploadErrors.vehicleRc}
                      isUploading={uploadingDocs.vehicleRc}
                      onFileSelect={(f) => handleFileUpload('vehicleRc', f)}
                    />
                  </div>
                </div>
              ) : (
                /* Bicycle Exemption Info Card */
                <div
                  style={{
                    backgroundColor: 'rgba(46, 204, 113, 0.08)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    border: '1px solid rgba(46, 204, 113, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{ color: 'var(--color-veg)' }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                      🚲 Bicycle Partner Exemption Active
                    </h4>
                    <p style={{ fontSize: '11px', color: '#A5A5B2', margin: '4px 0 0', lineHeight: 1.5 }}>
                      Bicycle delivery partners are exempt from motor vehicle commercial driving license and RC uploads.
                      Your identity is fully validated through your Aadhaar, PAN, and Bank documents.
                    </p>
                  </div>
                </div>
              )}

              {/* 4. BANK ACCOUNT PROOF */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '18px' }}>🏦</span>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                      Bank Account Proof (For Daily Earnings Settlement)
                    </h4>
                    <span style={{ fontSize: '11px', color: '#A5A5B2' }}>
                      Upload clear photo of Cancelled Cheque, Bank Passbook, or Account Statement showing your name & IFSC
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <DocUploadCard
                    title="Bank Account Proof (Cheque / Passbook) *"
                    previewUrl={documents.bankProof || null}
                    error={formErrors.bankProof || uploadErrors.bankProof}
                    isUploading={uploadingDocs.bankProof}
                    onFileSelect={(f) => handleFileUpload('bankProof', f)}
                  />
                </div>
              </div>
            </div>

            {/* Stepper Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) setStep(3);
                }}
                style={{
                  padding: '11px 24px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-glow)',
                  cursor: 'pointer'
                }}
              >
                <span>Proceed to Financial Details</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: FINANCIAL & BANKING DETAILS */}
        {step === 3 && (
          <form
            onSubmit={handleSubmit}
            style={{
              backgroundColor: '#1E1E24',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>
              Step 3: Financial Details & Daily Payouts
            </h3>
            <p style={{ fontSize: '12px', color: '#A5A5B2', marginBottom: '20px' }}>
              Your trip payouts, surge bonuses, and customer tips are settled daily to this bank account or UPI ID.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {/* Account Holder Name */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Bank Account Holder Name *
                </label>
                <input
                  type="text"
                  placeholder="Should match legal KYC name"
                  value={bankDetails.accountHolderName}
                  onChange={(e) =>
                    setBankDetails((prev) => ({ ...prev, accountHolderName: e.target.value }))
                  }
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${formErrors.accountHolderName ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
                {formErrors.accountHolderName && (
                  <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                    {formErrors.accountHolderName}
                  </span>
                )}
              </div>

              {/* Bank Name */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Bank Name & Branch *
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank, Indiranagar"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails((prev) => ({ ...prev, bankName: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${formErrors.bankName ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
                {formErrors.bankName && (
                  <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                    {formErrors.bankName}
                  </span>
                )}
              </div>

              {/* IFSC Code */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  IFSC Code (11 characters) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC0000140"
                  value={bankDetails.ifscCode}
                  onChange={(e) =>
                    setBankDetails((prev) => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))
                  }
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${formErrors.ifscCode ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                    color: '#FFFFFF',
                    fontSize: '13px',
                    textTransform: 'uppercase'
                  }}
                />
                {formErrors.ifscCode && (
                  <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                    {formErrors.ifscCode}
                  </span>
                )}
              </div>

              {/* Account Number */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Account Number *
                </label>
                <input
                  type="password"
                  placeholder="Enter Bank Account Number"
                  value={bankDetails.accountNumber}
                  onChange={(e) =>
                    setBankDetails((prev) => ({ ...prev, accountNumber: e.target.value }))
                  }
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${formErrors.accountNumber ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
                {formErrors.accountNumber && (
                  <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                    {formErrors.accountNumber}
                  </span>
                )}
              </div>

              {/* Confirm Account Number */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Confirm Account Number *
                </label>
                <input
                  type="text"
                  placeholder="Re-enter Bank Account Number"
                  value={confirmAccNumber}
                  onChange={(e) => setConfirmAccNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${formErrors.confirmAccNumber ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
                {formErrors.confirmAccNumber && (
                  <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                    {formErrors.confirmAccNumber}
                  </span>
                )}
              </div>

              {/* UPI ID */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Instant Payout UPI ID (GPay / PhonePe / Paytm) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. mobile@okaxis or name@okhdfcbank"
                  value={bankDetails.upiId}
                  onChange={(e) => setBankDetails((prev) => ({ ...prev, upiId: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${formErrors.upiId ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
                {formErrors.upiId && (
                  <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                    {formErrors.upiId}
                  </span>
                )}
              </div>
            </div>

            {/* Terms & Declarations */}
            <div
              style={{
                marginTop: '20px',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(46, 204, 113, 0.05)',
                border: '1px solid rgba(46, 204, 113, 0.2)',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start'
              }}
            >
              <CheckCircle2 size={18} color="var(--color-veg)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ fontSize: '11px', color: '#D1D5DB', lineHeight: 1.5 }}>
                I hereby declare that all provided identity information, government documents (Aadhaar, PAN, Driving License, RC & Bank Proof),
                and banking details are authentic and belong to me. I agree to the Tomattto Delivery Fleet Code of Conduct.
              </div>
            </div>

            {/* Stepper Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '12px 28px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-veg)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-md)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Submit for Verification ➔</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// Reusable Document Upload Card
interface DocUploadCardProps {
  title: string;
  previewUrl: string | null;
  error?: string;
  isUploading?: boolean;
  onFileSelect: (file: File) => void;
}

const DocUploadCard: React.FC<DocUploadCardProps> = ({ title, previewUrl, error, isUploading, onFileSelect }) => {
  return (
    <div
      style={{
        borderRadius: 'var(--radius-sm)',
        border: `1px solid ${error ? '#E74C3C' : previewUrl ? 'rgba(46, 204, 113, 0.4)' : 'rgba(255,255,255,0.1)'}`,
        backgroundColor: previewUrl ? 'rgba(46, 204, 113, 0.04)' : 'rgba(255,255,255,0.02)',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF' }}>{title}</span>
        {isUploading ? (
          <span style={{ fontSize: '10px', color: '#F39C12', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Loader2 size={11} className="animate-spin" />
            Uploading
          </span>
        ) : previewUrl ? (
          <span style={{ fontSize: '10px', color: 'var(--color-veg)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
            <CheckCircle2 size={12} />
            Uploaded
          </span>
        ) : (
          <span style={{ fontSize: '10px', color: '#F39C12', fontWeight: 600 }}>Required</span>
        )}
      </div>

      {previewUrl ? (
        <div style={{ height: '100px', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
          <img src={previewUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0,0,0,0.65)',
              padding: '4px 8px',
              fontSize: '10px',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>Verified Scan</span>
            <label style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              Change
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
                }}
              />
            </label>
          </div>
        </div>
      ) : (
        <label
          style={{
            height: '90px',
            border: '1px dashed rgba(255,255,255,0.2)',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            cursor: 'pointer',
            backgroundColor: 'rgba(255,255,255,0.01)'
          }}
        >
          {isUploading ? (
            <>
              <Loader2 size={20} className="animate-spin" color="#F39C12" />
              <span style={{ fontSize: '11px', color: '#F39C12', fontWeight: 600 }}>Vaulting to storage...</span>
            </>
          ) : (
            <>
              <UploadCloud size={20} color="#A5A5B2" />
              <span style={{ fontSize: '11px', color: '#D1D5DB', fontWeight: 600 }}>Choose image or PDF</span>
              <span style={{ fontSize: '9px', color: '#8E8E93' }}>JPG, PNG or PDF (max 10MB)</span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            disabled={isUploading}
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
            }}
          />
        </label>
      )}

      {error && <span style={{ fontSize: '10px', color: '#E74C3C' }}>{error}</span>}
    </div>
  );
};
