import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    const { username, email, password, role, profilePicture } = req.body;

    if(!username || !email || !password || !role ||username==='' || email==='' || password==='' || role==='') {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Validate username format (only letters, numbers, and underscores)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
        return res.status(400).json({ message: "Username can only contain letters, numbers, and underscores" });
    }

    // Validate password length
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
        username, 
        email, 
        password: hashedPassword,
         role,
         ...(profilePicture && { profilePicture })
         });
    await user.save();

    const token = jwt.sign({
         userId: user._id, 
         role: user.role }, 
        process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie("token", token);

    res.status(201).json({ message: "User registered successfully" ,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture
        }
    });
}

export const loginUser = async (req, res) => {
    const { email, password ,role} = req.body;

    if(!email || !password || !role || email==='' || password==='' || role==='') {
            return res.status(400).json({ message: "All fields are required" });
        }
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
    }
    // check if user role matches the requested role
    if(role === 'farmer' &&  user.role !== role) {
        return res.status(400).json({ message: "user is not a farmer" });
    }
    else if(role === 'buyer' &&  user.role !== role) {
        return res.status(400).json({ message: "user is not a buyer" });
    }


    const token = jwt.sign({
         userId: user._id, 
         role: user.role }, 
        process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie("token", token);

    res.status(200).json({ message: "User logged in successfully" ,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture
        }
    });
}


export const logoutUser = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "User logged out successfully" });
}


export const throughGoogle = async (req, res) => {
    const { email, name, profilePicture, role } = req.body; // we have to send role from frontend as google doesn't provide role information and we need it for our app functionality

    try {
        const existingUser = await User.findOne({ email });
        
        // if user exists, generate token and return user data
        if (existingUser) { 
            const token = jwt.sign({
                    userId: existingUser._id,
                    role: existingUser.role
                },
                process.env.JWT_SECRET, { expiresIn: '1h' }
            );

            const { password, ...userData } = existingUser._doc;
            return res
                .status(200)
                .cookie("token", token, { httpOnly: true })
                .json(userData); 
        }
        
        // if user doesn't exist, create new user
        // Generate a random password for database requirement
        const generatedPassword = Math.random().toString(36).slice(-8) + 
                                   Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);
        
        // Create username from name (handle duplicates)
        const baseUsername = name.toLowerCase().split(' ').join('');
        const randomSuffix = Math.random().toString(9).slice(-4);
        const username = baseUsername + randomSuffix;

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role,
            profilePicture
        });
        
        await newUser.save();

        // Generate token for new user
        const token = jwt.sign({
                userId: newUser._id,
                role: newUser.role
            },
            process.env.JWT_SECRET, { expiresIn: '1h' }
        );

        const { password, ...userData } = newUser._doc;
        return res
            .status(201)
            .cookie("token", token, { httpOnly: true })
            .json(userData);
            
    } catch (error) {
        return res.status(500).json({ message: "Error during Google authentication", error: error.message });
    }
}