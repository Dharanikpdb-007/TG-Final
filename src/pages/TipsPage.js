import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Shield, MapPin, Phone, AlertTriangle, Wallet, Heart, Users, Car, ChevronDown, ChevronUp } from 'lucide-react';
import '../App.css'; // Reuse main styles or create specific ones
const tipCategories = [
    {
        id: "general",
        title: "General Safety",
        icon: Shield,
        tips: [
            "Always carry a copy of your passport and visa",
            "Share your itinerary with family or friends",
            "Register with your embassy if traveling for extended periods",
            "Keep emergency contact numbers saved offline",
        ],
    },
    {
        id: "location",
        title: "Location Safety",
        icon: MapPin,
        tips: [
            "Stay aware of your surroundings at all times",
            "Avoid isolated areas, especially at night",
            "Use well-lit and populated routes",
            "Keep your phone charged and GPS enabled",
        ],
    },
    {
        id: "emergency",
        title: "Emergency Procedures",
        icon: Phone,
        tips: [
            "112 is the national emergency number",
            "100 for Police, 102 for Ambulance, 101 for Fire",
            "Use the SOS button in Tour Guard for immediate help",
            "Stay calm and provide clear location details",
        ],
    },
    {
        id: "scams",
        title: "Avoiding Scams",
        icon: AlertTriangle,
        tips: [
            "Be wary of overly friendly strangers offering help",
            "Negotiate prices before using services",
            "Use official taxi services or verified apps",
            "Don't share personal information with strangers",
        ],
    },
    {
        id: "money",
        title: "Money Safety",
        icon: Wallet,
        tips: [
            "Use ATMs inside banks when possible",
            "Carry only necessary cash",
            "Keep valuables in hotel safes",
            "Inform your bank about your travel dates",
        ],
    },
    {
        id: "health",
        title: "Health Tips",
        icon: Heart,
        tips: [
            "Drink only bottled or purified water",
            "Carry basic medications and first aid kit",
            "Get recommended vaccinations before travel",
            "Have travel health insurance",
        ],
    },
    {
        id: "cultural",
        title: "Cultural Awareness",
        icon: Users,
        tips: [
            "Dress modestly when visiting religious sites",
            "Ask permission before photographing people",
            "Remove shoes when entering temples and homes",
            "Learn a few basic local phrases",
        ],
    },
    {
        id: "transport",
        title: "Transportation Safety",
        icon: Car,
        tips: [
            "Use verified ride-hailing apps",
            "Note the vehicle details before getting in",
            "Share your ride details with someone",
            "Wear seatbelts and helmets when applicable",
        ],
    },
];
export default function TipsPage() {
    const [expandedId, setExpandedId] = useState('general');
    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };
    return (_jsxs("div", { className: "view-container", style: { paddingBottom: 80 }, children: [_jsxs("div", { style: { marginBottom: 24, padding: '20px 20px 0' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }, children: [_jsx(Shield, { size: 24, color: "#8b5cf6" }), _jsx("h2", { style: { margin: 0, fontSize: '1.25rem' }, children: "Tour Guard" })] }), _jsx("h3", { style: { margin: '0 0 12px', fontSize: '1.1rem' }, children: "Safety Tips & Guidelines" }), _jsx("div", { style: {
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: 8,
                            padding: 12,
                            fontSize: '0.9rem',
                            color: '#bfdbfe'
                        }, children: "Stay safe while exploring India. Follow these guidelines and use Tour Guard's features for a secure travel experience." })] }), _jsx("div", { style: { padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }, children: tipCategories.map((category) => {
                    const Icon = category.icon;
                    const isExpanded = expandedId === category.id;
                    return (_jsxs("div", { onClick: () => toggleExpand(category.id), style: {
                            background: '#1f2937',
                            borderRadius: 12,
                            border: '1px solid rgba(255,255,255,0.05)',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }, children: [_jsxs("div", { style: {
                                    padding: 16,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12 }, children: [_jsx(Icon, { size: 20, color: isExpanded ? '#8b5cf6' : '#9ca3af' }), _jsx("span", { style: { fontWeight: 600, color: isExpanded ? 'white' : '#e5e7eb' }, children: category.title })] }), isExpanded ? (_jsx(ChevronUp, { size: 20, color: "#9ca3af" })) : (_jsx(ChevronDown, { size: 20, color: "#9ca3af" }))] }), isExpanded && (_jsx("div", { style: {
                                    padding: '0 16px 16px',
                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                    animation: 'fadeIn 0.3s ease'
                                }, children: _jsx("ul", { style: { margin: '16px 0 0', paddingLeft: 24, color: '#d1d5db', fontSize: '0.95rem' }, children: category.tips.map((tip, index) => (_jsx("li", { style: { marginBottom: 8 }, children: tip }, index))) }) }))] }, category.id));
                }) }), _jsx("style", { children: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            ` })] }));
}
