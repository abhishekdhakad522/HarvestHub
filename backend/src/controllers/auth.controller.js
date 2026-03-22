import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createAuthToken = (user) =>
    jwt.sign(
        {
            userId: user._id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

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

    const token = createAuthToken(user);
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


    const token = createAuthToken(user);
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

export const throughGoogle = async (req, res) => {
    const { credential, role } = req.body;

    try {
        if (!credential || !role) {
            return res.status(400).json({ message: "Google credential and role are required" });
        }

        if (!["farmer", "buyer"].includes(role)) {
            return res.status(400).json({ message: "Invalid role selected" });
        }

        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.status(500).json({ message: "GOOGLE_CLIENT_ID is not configured" });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        if (!payload || !payload.email || !payload.email_verified) {
            return res.status(400).json({ message: "Google account email is not verified" });
        }

        const email = payload.email;
        const displayName = payload.name || email.split("@")[0];
        const profilePicture = payload.picture || undefined;

        const existingUser = await User.findOne({ email });
        
        // if user exists, generate token and return user data
        if (existingUser) { 
            const token = createAuthToken(existingUser);

            const { password, ...userData } = existingUser._doc;
            return res
                .status(200)
                .cookie("token", token, { httpOnly: true })
                .json({
                    message: "Google login successful",
                    user: userData,
                }); 
        }
        
        // if user doesn't exist, create new user
        // Generate a random password for database requirement
        const generatedPassword = Math.random().toString(36).slice(-8) + 
                                   Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);
        
        // Create username from name (handle duplicates)
        const baseUsername = displayName.toLowerCase().replace(/[^a-z0-9_]/g, "");
        const randomSuffix = Math.random().toString(9).slice(-4);
        const username = `${baseUsername || "user"}${randomSuffix}`;

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role,
            profilePicture
        });
        
        await newUser.save();

        // Generate token for new user
        const token = createAuthToken(newUser);

        const { password, ...userData } = newUser._doc;
        return res
            .status(201)
            .cookie("token", token, { httpOnly: true })
            .json({
                message: "Google account created and logged in",
                user: userData,
            });
            
    } catch (error) {
        return res.status(500).json({ message: "Error during Google authentication", error: error.message });
    }
}