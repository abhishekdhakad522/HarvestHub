import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    const { username, email, password, role, profilePicture } = req.body;

    if(!username || !email || !password || !role ||username==='' || email==='' || password==='' || role==='') {
        return res.status(400).json({ message: "All fields are required" });
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