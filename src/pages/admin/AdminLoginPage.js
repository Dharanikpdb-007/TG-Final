import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock } from 'lucide-react';
import './Admin.css';
export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const handleLogin = (e) => {
        e.preventDefault();
        if (username === 'admin' && password === 'admin') {
            localStorage.setItem('admin_auth', 'true');
            navigate('/admin/dashboard');
        }
        else {
            setError('Invalid credentials');
        }
    };
    return (_jsx("div", { className: "admin-login-container", children: _jsxs("div", { className: "admin-login-card", children: [_jsxs("div", { className: "admin-logo", children: [_jsx(Shield, { size: 48, color: "#8b5cf6" }), _jsx("h1", { children: "Tour Guard Admin" })] }), error && _jsx("div", { className: "admin-error", children: error }), _jsxs("form", { onSubmit: handleLogin, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Username" }), _jsx("input", { type: "text", value: username, onChange: (e) => setUsername(e.target.value), placeholder: "Enter admin username" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Password" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Enter admin password" })] }), _jsxs("button", { type: "submit", className: "btn-admin-login", children: [_jsx(Lock, { size: 18 }), " Login to Dashboard"] })] })] }) }));
}
