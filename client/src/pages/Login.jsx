import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, auth } = useContext(AuthContext);
    const navigate = useNavigate();
    
    useEffect(() => {
        if(auth) {
            return navigate('/');
        }
    }, [auth, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(username, password);
        navigate('/');
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                <button type="submit">Login</button>
            </form>
            <Link to="http://localhost:5000/auth/google">Google Login</Link>
        </div>
    );
};

export default Login;
