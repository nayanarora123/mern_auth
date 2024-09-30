const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/Users');

// Register
exports.register = async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ msg: "User already exists." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ msg: "User registered successfully." });
    } catch (error) {
        res.status(500).json({ msg: "Server error." });
    }
};

// Login
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ msg: "Invalid credentials." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials." });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' }); 

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('token', token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
            httpOnly: true
        });
        res.cookie('refreshToken', refreshToken, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
            httpOnly: true
        });
        res.status(200)
        res.json({ success: true, user });
    } catch (error) {
        console.log(error.name);
        
        res.status(500).json({ msg: "Server error." });
    }
};


exports.loadUser = async (req, res) => {
    return res.status(200).json({user: req.user});
}


exports.verifyAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ error: "Please Login to Access" });
    }

    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decodedData.id);
        next();
    } catch (err) {
        if(err.name === 'TokenExpiredError')  {
            return res.status(401).json({ error: err });
        }
        return res.status(401).json({error: err});
    }
};


// Refresh Token Endpoint
exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.status(403).json({ msg: "Refresh token is required." });
    }

    try {
        const decodedData = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const user = await User.findById(decodedData.id);        

        if (!user ) {
            return res.status(403).json({ msg: "User not found ." });
        }
        if (user.refreshToken !== refreshToken ) {
            return res.status(403).json({ msg: "invalid refresh token." });
        }
        
        // Optionally, you can rotate the refresh token
        const refreshTokenExpiryDate = new Date(decodedData.exp * 1000);
        const currentDate = new Date();

        const timeDifference = refreshTokenExpiryDate - currentDate;
        const daysLeft = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

        if (currentDate > refreshTokenExpiryDate) {
            return res.status(403).json({ msg: "Session has expired." });
        }
        

        const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const newRefreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: daysLeft + 'd' });
        user.refreshToken = newRefreshToken; // Update the refresh token
        await user.save();
        
        res.cookie('token', newToken, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  
            httpOnly: true
        });
        res.cookie('refreshToken', newRefreshToken, {
            expires: refreshTokenExpiryDate, 
            httpOnly: true
        });
        return res.status(200).json({user: req.user});
    } catch (err) {
        console.error(err);
        return res.status(401).json({ error: "Invalid refresh token." });
    }
};


exports.logout = async (req, res) => {
    res.clearCookie('refreshToken');
    res.clearCookie('token');
    res.status(200).json({
        success: true,
        message: "Logged Out",
    });
};
