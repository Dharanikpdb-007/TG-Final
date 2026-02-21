import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Bot, User, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import './ChatbotPage.css';
export default function ChatbotPage() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { showNotification } = useNotification();
    const [messages, setMessages] = useState([
        {
            id: '1',
            role: 'model',
            text: "Hello! I'm your Tourist Guard assistant. How can I help you stay safe today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [apiKey, setApiKey] = useState(import.meta.env.VITE_GOOGLE_API_KEY || '');
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    const handleSend = async () => {
        if (!input.trim())
            return;
        if (!apiKey) {
            showNotification('API Key is missing. Please configure VITE_GOOGLE_API_KEY in .env', 'error');
            return;
        }
        const userMsg = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        try {
            // Call Gemini API
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: `You are a helpful assistant for the Tourist Guard app. You help tourists stay safe, find emergency contacts, and navigate the app. Answer helpful and concise. User: ${input}` }]
                        }
                    ]
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || 'Failed to fetch response');
            }
            const modelResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't understand that.";
            const botMsg = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: modelResponse,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        }
        catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `Error: ${error.message}. Please check your API key.`,
                    timestamp: new Date()
                }]);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "chatbot-page", children: [_jsxs("header", { className: "chatbot-header", children: [_jsx("button", { onClick: () => navigate(-1), className: "back-btn", children: _jsx(ChevronLeft, { size: 24 }) }), _jsxs("div", { className: "header-title", children: [_jsx(Bot, { size: 24, className: "header-icon" }), _jsx("h2", { children: t('smartChatbot') || 'SafeTravel AI' })] })] }), _jsxs("div", { className: "chat-container", children: [messages.map((msg) => (_jsxs("div", { className: `chat-bubble ${msg.role}`, children: [_jsx("div", { className: "bubble-icon", children: msg.role === 'model' ? _jsx(Sparkles, { size: 16 }) : _jsx(User, { size: 16 }) }), _jsx("div", { className: "bubble-content", children: msg.text })] }, msg.id))), isLoading && (_jsxs("div", { className: "chat-bubble model loading", children: [_jsx("div", { className: "bubble-icon", children: _jsx(Bot, { size: 16 }) }), _jsx("div", { className: "typing-dot" }), _jsx("div", { className: "typing-dot" }), _jsx("div", { className: "typing-dot" })] })), _jsx("div", { ref: messagesEndRef })] }), _jsxs("div", { className: "chat-input-area", children: [_jsx("input", { type: "text", value: input, onChange: (e) => setInput(e.target.value), onKeyPress: (e) => e.key === 'Enter' && handleSend(), placeholder: "Ask about safety, emergency contacts...", className: "chat-input", disabled: isLoading }), _jsx("button", { onClick: handleSend, className: "chat-send-btn", disabled: !input.trim() || isLoading, children: _jsx(Send, { size: 20 }) })] })] }));
}
