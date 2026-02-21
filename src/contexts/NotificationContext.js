import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
const NotificationContext = createContext({});
export const useNotification = () => useContext(NotificationContext);
export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const showNotification = useCallback((message, type = 'info', duration = 5000, action) => {
        const id = Date.now().toString() + Math.random().toString().slice(2);
        setNotifications(prev => [...prev, { id, message, type, duration, action }]);
        if (duration > 0) {
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, duration);
        }
    }, []);
    const dismissNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };
    return (_jsxs(NotificationContext.Provider, { value: { showNotification }, children: [children, _jsx("div", { className: "notification-container", style: {
                    position: 'fixed',
                    top: 20,
                    right: 20,
                    zIndex: 99999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    pointerEvents: 'none' // Allow clicks through container
                }, children: _jsx(AnimatePresence, { children: notifications.map(n => (_jsxs(motion.div, { initial: { opacity: 0, x: 50, scale: 0.9 }, animate: { opacity: 1, x: 0, scale: 1 }, exit: { opacity: 0, x: 50, transition: { duration: 0.2 } }, className: `notification-toast ${n.type}`, style: {
                            background: '#1f2937',
                            color: 'white',
                            padding: '14px 18px',
                            borderRadius: 12,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            minWidth: 320,
                            maxWidth: 400,
                            borderLeft: `4px solid ${getColor(n.type)}`,
                            border: '1px solid rgba(255,255,255,0.1)',
                            pointerEvents: 'auto' // Re-enable clicks
                        }, children: [getIcon(n.type), _jsx("div", { style: { flex: 1 }, children: _jsx("p", { style: { margin: 0, fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.4 }, children: n.message }) }), n.action && (_jsx("button", { onClick: () => { n.action.onClick(); dismissNotification(n.id); }, style: {
                                    background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
                                    padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                                    marginRight: 8
                                }, children: n.action.label })), _jsx("button", { onClick: () => dismissNotification(n.id), style: {
                                    background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4, display: 'flex'
                                }, children: _jsx(X, { size: 16 }) })] }, n.id))) }) })] }));
};
const getColor = (type) => {
    switch (type) {
        case 'success': return '#10b981';
        case 'error': return '#ef4444';
        case 'warning': return '#f59e0b';
        default: return '#3b82f6';
    }
};
const getIcon = (type) => {
    switch (type) {
        case 'success': return _jsx(CheckCircle, { size: 22, color: "#10b981" });
        case 'error': return _jsx(AlertCircle, { size: 22, color: "#ef4444" });
        case 'warning': return _jsx(AlertTriangle, { size: 22, color: "#f59e0b" });
        default: return _jsx(Info, { size: 22, color: "#3b82f6" });
    }
};
