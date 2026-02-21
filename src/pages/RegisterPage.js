import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Phone, Globe, Calendar, FileText, Upload, Heart, AlertCircle, Lock, Check, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import './RegisterWizard.css';
export default function RegisterPage({ onSwitchToLogin }) {
    const { signUp } = useAuth();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');
    // File Upload Refs
    const passportInputRef = useRef(null);
    const visaInputRef = useRef(null);
    // Form State
    const [formData, setFormData] = useState({
        // Step 1: Personal
        fullName: '',
        email: '',
        phone: '',
        nationality: '',
        passportNumber: '',
        entryDate: '',
        exitDate: '',
        // Step 2: Documents
        passportPhoto: null,
        visaDoc: null,
        // Step 3: Emergency & Medical
        emergencyName: '',
        emergencyRelation: '',
        emergencyPhone: '',
        emergencyEmail: '',
        bloodType: '',
        allergies: '',
        medicalConditions: '',
        // Step 4: Password
        password: '',
        confirmPassword: '',
        // Step 5: Terms
        termsAccepted: false
    });
    // Navigation Logic
    const nextStep = () => {
        if (validateStep(step)) {
            setStep(prev => Math.min(prev + 1, 5));
            setError('');
        }
    };
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
    const validateStep = (currentStep) => {
        if (currentStep === 1) {
            if (!formData.fullName || !formData.email || !formData.phone || !formData.nationality) {
                setError('Please fill in all required personal fields');
                return false;
            }
        }
        if (currentStep === 3) {
            if (!formData.emergencyName || !formData.emergencyPhone) {
                setError('Primary emergency contact name and phone are required');
                return false;
            }
        }
        if (currentStep === 4) {
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters');
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
        }
        return true;
    };
    const handleFileChange = (e, field) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({ ...prev, [field]: file }));
        }
    };
    const handleRegister = async () => {
        if (!formData.termsAccepted) {
            setError('You must accept the terms and conditions');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            // 1. Sign Up (Creates User + initial Profile via Context)
            await signUp(formData.email, formData.password, formData.fullName, formData.phone);
            // 2. Get the new user ID
            const { data: { user } } = await supabase.auth.getUser();
            if (!user)
                throw new Error('Registration failed to retrieve user');
            const userId = user.id;
            // 3. Update User Profile with extra details (Passport, Medical, etc.)
            const { error: profileError } = await supabase
                .from('users')
                .update({
                nationality: formData.nationality,
                passport_number: formData.passportNumber,
                entry_date: formData.entryDate || null,
                exit_date: formData.exitDate || null,
                blood_type: formData.bloodType,
                allergies: formData.allergies,
                medical_conditions: formData.medicalConditions,
                passport_photo_url: formData.passportPhoto ? 'pending_upload_passport' : null,
                visa_doc_url: formData.visaDoc ? 'pending_upload_visa' : null
            })
                .eq('id', userId);
            if (profileError) {
                console.error('Profile update error:', profileError);
            }
            // 4. Create Emergency Contact
            const { error: contactError } = await supabase
                .from('emergency_contacts')
                .insert({
                user_id: userId,
                name: formData.emergencyName,
                relationship: formData.emergencyRelation || 'Family',
                phone_number: formData.emergencyPhone,
                email: formData.emergencyEmail,
                is_primary: true
            });
            if (contactError)
                console.error('Contact creation error:', contactError);
            // 5. Success!
            setShowSuccess(true);
        }
        catch (err) {
            console.error('Registration Error:', err);
            setError(err.message || 'Failed to register. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    // --- Render Steps ---
    const renderStep1 = () => (_jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, children: [_jsxs("div", { className: "step-header", children: [_jsx("span", { className: "step-indicator", children: "Step 1 of 5" }), _jsx("h2", { children: "Personal Information" }), _jsx("p", { children: "Enter your basic details for tourist registration" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Full Name (as on passport)" }), _jsxs("div", { className: "input-wrapper", children: [_jsx(User, { size: 18, className: "input-icon" }), _jsx("input", { className: "form-input", placeholder: "John Smith", value: formData.fullName, onChange: e => setFormData({ ...formData, fullName: e.target.value }) })] })] }), _jsxs("div", { className: "form-grid", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Email Address" }), _jsxs("div", { className: "input-wrapper", children: [_jsx(Mail, { size: 18, className: "input-icon" }), _jsx("input", { className: "form-input", type: "email", placeholder: "you@example.com", value: formData.email, onChange: e => setFormData({ ...formData, email: e.target.value }) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Phone Number" }), _jsxs("div", { className: "input-wrapper", children: [_jsx(Phone, { size: 18, className: "input-icon" }), _jsx("input", { className: "form-input", placeholder: "+1 234 567 8900", value: formData.phone, onChange: e => setFormData({ ...formData, phone: e.target.value }) })] })] })] }), _jsxs("div", { className: "form-grid", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Nationality" }), _jsxs("div", { className: "input-wrapper", children: [_jsx(Globe, { size: 18, className: "input-icon" }), _jsx("input", { className: "form-input", placeholder: "United States", value: formData.nationality, onChange: e => setFormData({ ...formData, nationality: e.target.value }) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Passport Number" }), _jsxs("div", { className: "input-wrapper", children: [_jsx(FileText, { size: 18, className: "input-icon" }), _jsx("input", { className: "form-input", placeholder: "AB1234567", value: formData.passportNumber, onChange: e => setFormData({ ...formData, passportNumber: e.target.value }) })] })] })] }), _jsxs("div", { className: "form-grid", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Entry Date to India" }), _jsxs("div", { className: "input-wrapper", children: [_jsx(Calendar, { size: 18, className: "input-icon" }), _jsx("input", { className: "form-input", type: "date", value: formData.entryDate, onChange: e => setFormData({ ...formData, entryDate: e.target.value }) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Expected Exit Date" }), _jsxs("div", { className: "input-wrapper", children: [_jsx(Calendar, { size: 18, className: "input-icon" }), _jsx("input", { className: "form-input", type: "date", value: formData.exitDate, onChange: e => setFormData({ ...formData, exitDate: e.target.value }) })] })] })] })] }));
    const renderStep2 = () => (_jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, children: [_jsxs("div", { className: "step-header", children: [_jsx("span", { className: "step-indicator", children: "Step 2 of 5" }), _jsx("h2", { children: "Document Upload" }), _jsx("p", { children: "Upload your travel documents for verification (optional for demo)" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Passport Photo Page" }), _jsx("input", { type: "file", ref: passportInputRef, onChange: (e) => handleFileChange(e, 'passportPhoto'), style: { display: 'none' }, accept: "image/*,.pdf" }), _jsxs("div", { className: "upload-area", onClick: () => passportInputRef.current?.click(), children: [_jsx(Upload, { size: 32, className: "upload-icon", color: formData.passportPhoto ? '#10b981' : '#9ca3af' }), _jsx("span", { className: "upload-text", children: formData.passportPhoto ? (formData.passportPhoto).name : 'Click to upload' }), _jsx("span", { className: "upload-subtext", children: formData.passportPhoto ? 'File selected' : 'JPG, PNG, WebP or PDF (max 5MB)' })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Visa Document (if applicable)" }), _jsx("input", { type: "file", ref: visaInputRef, onChange: (e) => handleFileChange(e, 'visaDoc'), style: { display: 'none' }, accept: "image/*,.pdf" }), _jsxs("div", { className: "upload-area", onClick: () => visaInputRef.current?.click(), children: [_jsx(Upload, { size: 32, className: "upload-icon", color: formData.visaDoc ? '#10b981' : '#9ca3af' }), _jsx("span", { className: "upload-text", children: formData.visaDoc ? (formData.visaDoc).name : 'Click to upload' }), _jsx("span", { className: "upload-subtext", children: formData.visaDoc ? 'File selected' : 'JPG, PNG, WebP or PDF (max 5MB)' })] })] })] }));
    const renderStep3 = () => (_jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, children: [_jsxs("div", { className: "step-header", children: [_jsx("span", { className: "step-indicator", children: "Step 3 of 5" }), _jsx("h2", { children: "Emergency Contacts & Medical" }), _jsx("p", { children: "Provide emergency contact details for your safety" })] }), _jsx("div", { className: "form-group full-width", style: { marginTop: 20 }, children: _jsxs("h3", { style: { fontSize: '1rem', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx(Phone, { size: 18 }), " Primary Emergency Contact"] }) }), _jsxs("div", { className: "form-grid", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Contact Name" }), _jsx("div", { className: "input-wrapper", children: _jsx("input", { className: "form-input no-icon", placeholder: "Jane Smith", value: formData.emergencyName, onChange: e => setFormData({ ...formData, emergencyName: e.target.value }) }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Relationship" }), _jsxs("select", { className: "form-select", style: { padding: 12, borderRadius: 8, background: '#0f1013', color: 'white', border: '1px solid #2a2b30', width: '100%' }, value: formData.emergencyRelation, onChange: e => setFormData({ ...formData, emergencyRelation: e.target.value }), children: [_jsx("option", { value: "", children: "Select relationship" }), _jsx("option", { value: "Parent", children: "Parent" }), _jsx("option", { value: "Spouse", children: "Spouse" }), _jsx("option", { value: "Sibling", children: "Sibling" }), _jsx("option", { value: "Friend", children: "Friend" }), _jsx("option", { value: "Other", children: "Other" })] })] })] }), _jsxs("div", { className: "form-grid", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Phone Number" }), _jsx("div", { className: "input-wrapper", children: _jsx("input", { className: "form-input no-icon", placeholder: "+1 234...", value: formData.emergencyPhone, onChange: e => setFormData({ ...formData, emergencyPhone: e.target.value }) }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Email (Optional)" }), _jsx("div", { className: "input-wrapper", children: _jsx("input", { className: "form-input no-icon", placeholder: "jane@example.com", value: formData.emergencyEmail, onChange: e => setFormData({ ...formData, emergencyEmail: e.target.value }) }) })] })] }), _jsx("div", { className: "form-group full-width", style: { marginTop: 30 }, children: _jsxs("h3", { style: { fontSize: '1rem', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx(Heart, { size: 18 }), " Medical Information (Optional)"] }) }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Blood Type" }), _jsxs("select", { className: "form-select", style: { padding: 12, borderRadius: 8, background: '#0f1013', color: 'white', border: '1px solid #2a2b30', width: '100%' }, value: formData.bloodType, onChange: e => setFormData({ ...formData, bloodType: e.target.value }), children: [_jsx("option", { value: "", children: "Select blood type" }), _jsx("option", { value: "A+", children: "A+" }), _jsx("option", { value: "A-", children: "A-" }), _jsx("option", { value: "B+", children: "B+" }), _jsx("option", { value: "B-", children: "B-" }), _jsx("option", { value: "O+", children: "O+" }), _jsx("option", { value: "O-", children: "O-" }), _jsx("option", { value: "AB+", children: "AB+" }), _jsx("option", { value: "AB-", children: "AB-" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Known Allergies" }), _jsx("div", { className: "input-wrapper", children: _jsx("input", { className: "form-input no-icon", placeholder: "List any allergies...", value: formData.allergies, onChange: e => setFormData({ ...formData, allergies: e.target.value }) }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Medical Conditions" }), _jsx("div", { className: "input-wrapper", children: _jsx("input", { className: "form-input no-icon", placeholder: "List any conditions (diabetes, etc)...", value: formData.medicalConditions, onChange: e => setFormData({ ...formData, medicalConditions: e.target.value }) }) })] })] }));
    const renderStep4 = () => (_jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, children: [_jsxs("div", { className: "step-header", children: [_jsx("span", { className: "step-indicator", children: "Step 4 of 5" }), _jsx("h2", { children: "Create Password" }), _jsx("p", { children: "Set a secure password for your Tour Guard account" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Password" }), _jsxs("div", { className: "input-wrapper", children: [_jsx(Lock, { size: 18, className: "input-icon" }), _jsx("input", { className: "form-input", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: formData.password, onChange: e => setFormData({ ...formData, password: e.target.value }) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Confirm Password" }), _jsxs("div", { className: "input-wrapper", children: [_jsx(Lock, { size: 18, className: "input-icon" }), _jsx("input", { className: "form-input", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: formData.confirmPassword, onChange: e => setFormData({ ...formData, confirmPassword: e.target.value }) })] })] }), _jsxs("div", { style: { background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 8, fontSize: '0.9rem', color: '#9ca3af' }, children: [_jsx("p", { style: { marginBottom: 8, color: 'white', fontWeight: 600 }, children: "Password requirements:" }), _jsx("ul", { style: { paddingLeft: 20 }, children: _jsx("li", { children: "At least 6 characters" }) })] })] }));
    const renderStep5 = () => (_jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, children: [_jsxs("div", { className: "step-header", children: [_jsx("span", { className: "step-indicator", children: "Step 5 of 5" }), _jsx("h2", { children: "Terms & Conditions" }), _jsx("p", { children: "Please review and accept our terms" })] }), _jsxs("div", { style: { height: 200, overflowY: 'auto', background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 8, marginBottom: 20, fontSize: '0.9rem', color: '#d1d5db' }, children: [_jsxs("p", { children: [_jsx("strong", { children: "1. Acceptance of Terms" }), _jsx("br", {}), "By creating an account, you agree to our terms of service..."] }), _jsx("br", {}), _jsxs("p", { children: [_jsx("strong", { children: "2. Privacy Policy" }), _jsx("br", {}), "We respect your privacy and protect your personal data..."] }), _jsx("br", {}), _jsxs("p", { children: [_jsx("strong", { children: "3. Emergency Services" }), _jsx("br", {}), "Tour Guard acts as a facilitator for emergency alerts..."] })] }), _jsxs("label", { className: "form-group", style: { flexDirection: 'row', alignItems: 'center', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", style: { width: 18, height: 18 }, checked: formData.termsAccepted, onChange: e => setFormData({ ...formData, termsAccepted: e.target.checked }) }), _jsx("span", { children: "I agree to the Terms of Service and Privacy Policy" })] })] }));
    return (_jsxs("div", { className: "register-container", children: [_jsx("div", { className: "stepper-wrapper", children: [1, 2, 3, 4, 5].map(i => (_jsxs("div", { className: `step-item ${step === i ? 'active' : ''} ${step > i ? 'completed' : ''}`, children: [_jsx("div", { className: "step-circle", children: step > i ? _jsx(Check, { size: 16 }) : i }), _jsx("span", { className: "step-label", children: i === 1 ? 'Personal' : i === 2 ? 'Docs' : i === 3 ? 'Emergency' : i === 4 ? 'Password' : 'Terms' })] }, i))) }), _jsxs("div", { className: "wizard-card", children: [error && _jsxs("div", { className: "error-message", style: { background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: 12, borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx(AlertCircle, { size: 18 }), " ", error] }), _jsxs(AnimatePresence, { mode: "wait", children: [step === 1 && renderStep1(), step === 2 && renderStep2(), step === 3 && renderStep3(), step === 4 && renderStep4(), step === 5 && renderStep5()] }), _jsxs("div", { className: "wizard-actions", children: [step > 1 ? (_jsxs("button", { className: "btn-wizard btn-back", onClick: prevStep, children: [_jsx(ChevronLeft, { size: 18 }), " Back"] })) : (_jsx("div", {}) // Spacer
                            ), step < 5 ? (_jsxs("button", { className: "btn-wizard btn-next", onClick: nextStep, style: { width: step === 5 ? '100%' : 'auto' }, children: ["Next ", _jsx(ChevronRight, { size: 18 })] })) : (_jsxs("button", { className: "btn-wizard btn-next", onClick: handleRegister, disabled: isLoading, style: { background: '#8b5cf6' }, children: [isLoading ? 'Creating Account...' : 'Create Account', " ", _jsx(ArrowRight, { size: 18 })] }))] })] }), _jsxs("div", { className: "login-link", children: ["Already registered? ", _jsx("a", { href: "#", onClick: (e) => { e.preventDefault(); if (onSwitchToLogin)
                            onSwitchToLogin();
                        else
                            window.location.href = '/login'; }, children: "Sign In here" })] }), showSuccess && (_jsx("div", { className: "success-overlay", children: _jsxs("div", { className: "success-modal", children: [_jsx("div", { className: "success-icon", children: _jsx(Check, { size: 48, color: "white" }) }), _jsx("h3", { style: { color: 'white', fontSize: '1.5rem', marginBottom: 10 }, children: "Registration Successful!" }), _jsx("p", { style: { color: '#9ca3af', marginBottom: 30 }, children: "Your account has been created successfully. Welcome to Tour Guard." }), _jsx("button", { className: "btn-wizard btn-next", style: { width: '100%', justifyContent: 'center' }, onClick: () => { if (onSwitchToLogin)
                                onSwitchToLogin();
                            else
                                window.location.href = '/login'; }, children: "Go to Login" })] }) }))] }));
}
