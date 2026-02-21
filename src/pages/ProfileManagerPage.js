import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ChevronLeft, CreditCard, Calendar, User, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
export default function ProfileManagerPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [showQR, setShowQR] = useState(false);
    const [userData, setUserData] = useState(null);
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user?.id)
                return;
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                if (error)
                    throw error;
                setUserData(data);
            }
            catch (err) {
                console.error('Error fetching profile:', err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [user?.id]);
    const getQRData = () => {
        if (!userData)
            return '';
        return JSON.stringify({
            id: userData.digital_id || userData.id,
            name: userData.name,
            passport: userData.passport_number,
            entry: userData.entry_date,
            exit: userData.exit_date,
            status: 'Active'
        });
    };
    if (loading) {
        return (_jsx("div", { className: "view-container", style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'white' }, children: "Loading Profile..." }));
    }
    return (_jsxs("div", { className: "view-container", style: { paddingBottom: 80, background: '#0f1013', minHeight: '100vh' }, children: [_jsxs("div", { className: "page-header", style: { display: 'flex', alignItems: 'center', marginBottom: 24, padding: 20 }, children: [_jsx("button", { onClick: () => navigate(-1), style: { background: 'none', border: 'none', color: 'white', marginRight: 12, cursor: 'pointer' }, children: _jsx(ChevronLeft, { size: 24 }) }), _jsx("h2", { style: { margin: 0, fontSize: '1.25rem' }, children: "Profile Manager" })] }), _jsxs("div", { style: { padding: '0 20px' }, children: [_jsxs("div", { style: {
                            background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                            borderRadius: 20,
                            padding: 24,
                            marginBottom: 24,
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }, children: [_jsx("div", { style: {
                                            width: 64, height: 64,
                                            borderRadius: '50%',
                                            background: '#374151',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            overflow: 'hidden',
                                            border: '2px solid #3b82f6'
                                        }, children: userData?.profile_picture ? (_jsx("img", { src: userData.profile_picture, alt: "Profile", style: { width: '100%', height: '100%', objectFit: 'cover' } })) : (_jsx(User, { size: 32, color: "#9ca3af" })) }), _jsxs("div", { children: [_jsx("h3", { style: { margin: '0 0 4px', color: 'white', fontSize: '1.2rem' }, children: userData?.name || 'Guest User' }), _jsx("div", { style: {
                                                    color: '#10b981',
                                                    fontSize: '0.85rem',
                                                    background: 'rgba(16, 185, 129, 0.1)',
                                                    padding: '4px 10px',
                                                    borderRadius: 12,
                                                    display: 'inline-block',
                                                    border: '1px solid rgba(16, 185, 129, 0.2)'
                                                }, children: "\u25CF Status: Location Active" })] })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 12 }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }, children: "Digital ID" }), _jsxs("div", { style: { color: 'white', fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: 1 }, children: [userData?.digital_id?.substring(0, 12) || userData?.id?.substring(0, 12), "..."] })] }), _jsxs("button", { onClick: () => setShowQR(!showQR), style: {
                                            background: showQR ? '#4b5563' : '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px 16px',
                                            borderRadius: 8,
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: 500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            transition: 'background 0.2s'
                                        }, children: [showQR ? _jsx(EyeOff, { size: 16 }) : _jsx(Eye, { size: 16 }), showQR ? 'Hide ID' : 'View ID'] })] }), showQR && (_jsxs("div", { style: {
                                    marginTop: 20,
                                    background: 'white',
                                    padding: 24,
                                    borderRadius: 16,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    animation: 'fadeIn 0.3s ease'
                                }, children: [_jsx(QRCodeCanvas, { value: getQRData(), size: 200 }), _jsx("p", { style: { marginTop: 16, color: '#111827', fontWeight: 700, fontSize: '1.1rem' }, children: userData?.digital_id || userData?.id }), _jsx("p", { style: { color: '#6b7280', fontSize: '0.9rem', margin: 0 }, children: "Official Tourist Digital Identity" })] }))] }), _jsx("h3", { style: { color: '#e5e7eb', fontSize: '1.1rem', marginBottom: 16 }, children: "Travel Details" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr', gap: 12 }, children: [_jsxs("div", { style: {
                                    background: '#1f2937',
                                    padding: 16,
                                    borderRadius: 12,
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12
                                }, children: [_jsx("div", { style: { background: 'rgba(59, 130, 246, 0.1)', padding: 8, borderRadius: 8 }, children: _jsx(User, { size: 20, color: "#3b82f6" }) }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '0.8rem', color: '#9ca3af' }, children: "Phone Number" }), _jsx("div", { style: { color: 'white', fontWeight: 500 }, children: userData?.phone || 'Not added' })] })] }), _jsxs("div", { style: {
                                    background: '#1f2937',
                                    padding: 16,
                                    borderRadius: 12,
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12
                                }, children: [_jsx("div", { style: { background: 'rgba(168, 85, 247, 0.1)', padding: 8, borderRadius: 8 }, children: _jsx(CreditCard, { size: 20, color: "#a855f7" }) }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '0.8rem', color: '#9ca3af' }, children: "Passport Number" }), _jsx("div", { style: { color: 'white', fontWeight: 500 }, children: userData?.passport_number || 'N/A' })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }, children: [_jsxs("div", { style: {
                                            background: '#1f2937',
                                            padding: 16,
                                            borderRadius: 12,
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }, children: [_jsx(Calendar, { size: 16, color: "#10b981" }), _jsx("span", { style: { fontSize: '0.8rem', color: '#9ca3af' }, children: "Entry Date" })] }), _jsx("div", { style: { color: 'white', fontWeight: 500 }, children: userData?.entry_date || 'N/A' })] }), _jsxs("div", { style: {
                                            background: '#1f2937',
                                            padding: 16,
                                            borderRadius: 12,
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }, children: [_jsx(Calendar, { size: 16, color: "#ef4444" }), _jsx("span", { style: { fontSize: '0.8rem', color: '#9ca3af' }, children: "Exit Date" })] }), _jsx("div", { style: { color: 'white', fontWeight: 500 }, children: userData?.exit_date || 'N/A' })] })] })] })] }), _jsx("style", { children: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            ` })] }));
}
