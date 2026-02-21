import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Send, Users, ChevronLeft, MessageSquare } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import './CommunityPage.css';
export default function CommunityPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { showNotification } = useNotification();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    useEffect(() => {
        loadMessages();
        // Subscribe to new messages
        const channel = supabase
            .channel('public:community_messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_messages' }, (payload) => {
            const newMsg = payload.new;
            setMessages((prev) => [...prev, newMsg]);
            scrollToBottom();
        })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);
    const loadMessages = async () => {
        try {
            const { data, error } = await supabase
                .from('community_messages')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(50);
            if (error)
                throw error;
            if (data) {
                setMessages(data);
                scrollToBottom();
            }
        }
        catch (error) {
            console.error('Error loading messages:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const scrollToBottom = () => {
        setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user)
            return;
        const content = newMessage.trim();
        setNewMessage(''); // Optimistic clear
        try {
            // Get user profile for name
            const { data: profile } = await supabase
                .from('users')
                .select('name')
                .eq('id', user.id)
                .single();
            const userName = profile?.name || user.email?.split('@')[0] || 'Anonymous';
            const { error } = await supabase
                .from('community_messages')
                .insert({
                user_id: user.id,
                content: content,
                user_name: userName,
                created_at: new Date().toISOString()
            });
            if (error)
                throw error;
        }
        catch (error) {
            console.error('Error sending message:', error);
            showNotification('Failed to send message. Please try again.', 'error');
            setNewMessage(content); // Restore on error
        }
    };
    return (_jsxs("div", { className: "community-page", children: [_jsxs("header", { className: "community-header", children: [_jsx("button", { onClick: () => navigate(-1), className: "back-btn", children: _jsx(ChevronLeft, { size: 24 }) }), _jsxs("div", { className: "header-title", children: [_jsx(Users, { size: 20, className: "header-icon" }), _jsx("h2", { children: t('communityChat') || 'Community Chat' })] })] }), _jsxs("div", { className: "messages-container", children: [loading ? (_jsxs("div", { className: "loading-state", children: [_jsx(MessageSquare, { size: 48, className: "pulse-icon" }), _jsx("p", { children: "Loading conversation..." })] })) : messages.length === 0 ? (_jsxs("div", { className: "empty-state", children: [_jsx(MessageSquare, { size: 48 }), _jsx("h3", { children: "No messages yet" }), _jsx("p", { children: "Be the first to say hello!" })] })) : (messages.map((msg) => {
                        const isOwn = msg.user_id === user?.id;
                        return (_jsxs("div", { className: `message-bubble ${isOwn ? 'own' : 'other'}`, children: [!isOwn && _jsx("span", { className: "message-author", children: msg.user_name }), _jsx("div", { className: "message-content", children: msg.content }), _jsx("span", { className: "message-time", children: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })] }, msg.id));
                    })), _jsx("div", { ref: scrollRef })] }), _jsxs("form", { className: "message-input-area", onSubmit: handleSendMessage, children: [_jsx("input", { type: "text", value: newMessage, onChange: (e) => setNewMessage(e.target.value), placeholder: "Type a message...", className: "message-input" }), _jsx("button", { type: "submit", className: "send-btn", disabled: !newMessage.trim(), children: _jsx(Send, { size: 20 }) })] })] }));
}
