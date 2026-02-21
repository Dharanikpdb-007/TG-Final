import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, Mail, Phone } from 'lucide-react';
import './EmergencyContactsList.css';
export default function EmergencyContactsList({ contacts, onContactDeleted, }) {
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState('');
    const handleDelete = async (contactId) => {
        setDeletingId(contactId);
        setError('');
        try {
            const { error: deleteError } = await supabase
                .from('emergency_contacts')
                .delete()
                .eq('id', contactId);
            if (deleteError)
                throw deleteError;
            onContactDeleted();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete contact');
        }
        finally {
            setDeletingId(null);
        }
    };
    return (_jsxs("div", { className: "contacts-list", children: [error && (_jsx("div", { className: "error-banner", children: _jsx("span", { children: error }) })), contacts.map((contact) => (_jsxs("div", { className: "contact-card", children: [_jsxs("div", { className: "contact-header", children: [_jsx("h4", { children: contact.contact_name }), _jsx("span", { className: "relationship-badge", children: contact.relationship })] }), _jsxs("div", { className: "contact-details", children: [contact.contact_email && (_jsxs("div", { className: "contact-row", children: [_jsx(Mail, { size: 16 }), _jsx("a", { href: `mailto:${contact.contact_email}`, children: contact.contact_email })] })), contact.contact_phone && (_jsxs("div", { className: "contact-row", children: [_jsx(Phone, { size: 16 }), _jsx("a", { href: `tel:${contact.contact_phone}`, children: contact.contact_phone })] }))] }), _jsxs("button", { onClick: () => handleDelete(contact.id), disabled: deletingId === contact.id, className: "btn-delete", title: "Delete contact", children: [_jsx(Trash2, { size: 16 }), deletingId === contact.id ? 'Deleting...' : 'Delete'] })] }, contact.id)))] }));
}
