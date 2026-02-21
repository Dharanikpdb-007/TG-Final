import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import './AuthPages.css';
export default function LoginPage({ onSwitchToRegister }) {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await signIn(email, password);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "auth-container", children: _jsxs("div", { className: "auth-card", children: [_jsxs("div", { className: "auth-header", children: [_jsx("div", { className: "logo-icon", children: "\uD83D\uDEA8" }), _jsx("h1", { children: "Tour Guard" }), _jsx("p", { children: "Emergency Response System" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "auth-form", children: [error && (_jsxs("div", { className: "error-alert", children: [_jsx(AlertCircle, { size: 20 }), _jsx("span", { children: error })] })), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "email", children: "Email Address" }), _jsx("input", { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "your@email.com", required: true, disabled: isLoading })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "password", children: "Password" }), _jsx("input", { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Enter your password", required: true, disabled: isLoading })] }), _jsx("button", { type: "submit", className: "btn-primary", disabled: isLoading, children: isLoading ? 'Signing in...' : 'Sign In' })] }), _jsx("div", { className: "auth-footer", children: _jsxs("p", { children: ["Don't have an account?", ' ', _jsx("button", { onClick: onSwitchToRegister, className: "link-button", children: "Create one" })] }) })] }) }));
}
