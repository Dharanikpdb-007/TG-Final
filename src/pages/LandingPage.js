import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Shield, ArrowRight } from 'lucide-react';
import './LandingPage.css';
export default function LandingPage({ onGetStarted, onLogin }) {
    return (_jsx("div", { className: "landing-container", children: _jsxs("div", { className: "landing-content", children: [_jsxs("div", { className: "trust-badge", children: [_jsx(Shield, { size: 16, className: "badge-icon" }), _jsx("span", { children: "Trusted by 50,000+ Tourists" })] }), _jsxs("h1", { className: "landing-title", children: ["Travel India", _jsx("br", {}), _jsx("span", { className: "gradient-text", children: "With Confidence" })] }), _jsx("p", { className: "landing-subtitle", children: "Your AI-powered safety companion for exploring India. Real-time protection, instant emergency response, and blockchain-verified security\u2014all in one app." }), _jsxs("div", { className: "landing-actions", children: [_jsxs("button", { onClick: onGetStarted, className: "btn-get-started", children: ["Register", _jsx(ArrowRight, { size: 20 })] }), _jsx("button", { onClick: onLogin, className: "btn-already-registered", children: "Login" })] })] }) }));
}
