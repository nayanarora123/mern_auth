import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [loading, setLoading] = useState(true);

    const [auth, setAuth] = useState(false);
    const [currentUser, setCurrentUser] = useState(false);

    const login = async (username, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/login', { username, password }, {
            withCredentials: true,
        });
        setAuth(res.data.user._id);
        setCurrentUser(res.data.user);
    };

    const register = async (username, password) => {
        await axios.post('http://localhost:5000/api/auth/register', { username, password });
    };

    const logout = async () => {
        await axios.get('http://localhost:5000/api/auth/logout', {
            withCredentials: true, 
        });        
        setAuth(false);
    }

    const authUser = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('http://localhost:5000/api/auth', {
                withCredentials: true,
            });

            if (data.user) {
                setAuth(data.user._id);
                setCurrentUser(data.user);
            }
        } catch (error) {
            if (error.response?.status === 401 && error.response.data.error.name === "TokenExpiredError") {
                // Attempt to refresh token
                try {
                    await axios.get('http://localhost:5000/api/auth/refresh-token', {
                        withCredentials: true,
                    });

                    // Retry the original request
                    const retryResponse = await axios.get('http://localhost:5000/api/auth', {
                        withCredentials: true,
                    });

                    if (retryResponse.data.user) {
                        setAuth(retryResponse.data.user._id);
                        setCurrentUser(retryResponse.data.user);
                    }
                } catch (refreshError) {
                    console.log('Error refreshing token:', refreshError);
                    setAuth(false);
                    setCurrentUser(false);
                }
            } else {
                setAuth(false);
                setCurrentUser(false);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        authUser();
    }, []);

    return (
        <AuthContext.Provider value={{ auth, login, register, logout, currentUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
