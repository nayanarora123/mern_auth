import React, {useContext} from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {

    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const logoutUser = async () => {
        await logout();
        navigate('/login');
    }

    return <div>
        <h1>Welcome to the Dashboard!</h1>
        <button onClick={logoutUser}>Logout</button>
    </div>;
};

export default Dashboard;
