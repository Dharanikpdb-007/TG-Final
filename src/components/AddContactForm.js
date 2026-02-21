import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle } from 'lucide-react';
import './AddContactForm.css';
export default function AddContactForm({ userId, onContactAdded, onCancel, }) {
    const [formData, setFormData] = useState({
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        relationship: 'family',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.contactName || !formData.contactEmail) {
            setError('Name and email are required');
            return;
        }
        if (!userId) {
            setError('User not authenticated');
            return;
        }
        setIsLoading(true);
        try {
            const { error: insertError } = await supabase
                .from('emergency_contacts')
                .insert({
                user_id: userId,
                contact_name: formData.contactName,
                contact_email: formData.contactEmail,
                contact_phone: formData.contactPhone || null,
                relationship: formData.relationship,
            });
            if (insertError)
                throw insertError;
            onContactAdded();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add contact');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "add-contact-form", children: [error && (_jsxs("div", { className: "form-error", children: [_jsx(AlertCircle, { size: 18 }), _jsx("span", { children: error })] })), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "contactName", children: "Contact Name *" }), _jsx("input", { id: "contactName", type: "text", name: "contactName", value: formData.contactName, onChange: handleChange, placeholder: "Full name", required: true, disabled: isLoading })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "contactEmail", children: "Email Address *" }), _jsx("input", { id: "contactEmail", type: "email", name: "contactEmail", value: formData.contactEmail, onChange: handleChange, placeholder: "email@example.com", required: true, disabled: isLoading })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "contactPhone", children: "Phone Number" }), _jsx("input", { id: "contactPhone", type: "tel", name: "contactPhone", value: formData.contactPhone, onChange: handleChange, placeholder: "+1 (555) 000-0000", disabled: isLoading })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "relationship", children: "Relationship" }), _jsxs("select", { id: "relationship", name: "relationship", value: formData.relationship, onChange: handleChange, disabled: isLoading, children: [_jsx("option", { value: "family", children: "Family Member" }), _jsx("option", { value: "friend", children: "Friend" }), _jsx("option", { value: "embassy", children: "Embassy / Consulate" }), _jsx("option", { value: "other", children: "Other" })] })] }), _jsxs("div", { className: "form-actions", children: [_jsx("button", { type: "button", onClick: onCancel, className: "btn-cancel", disabled: isLoading, children: "Cancel" }), _jsx("button", { type: "submit", className: "btn-submit", disabled: isLoading, children: isLoading ? 'Adding...' : 'Add Contact' })] })] }));
}
