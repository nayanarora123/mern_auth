import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const { logout, currentUser } = useContext(AuthContext);

    const logoutUser = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div style={{padding: "10px"}}>
            <h1>Welcome to the Dashboard!</h1>
            <h2>User Information:</h2>
            <ul>
                {currentUser && Object.entries(currentUser).map(([key, value]) => (
                    <li key={key}>
                        <strong>{key}:</strong> {value}
                    </li>
                ))}
            </ul>
            <button onClick={logoutUser}>Logout</button>
        </div>
    );
};

export default Dashboard;
