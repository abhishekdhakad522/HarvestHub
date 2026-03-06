import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    const { username, email, password, role, profilePicture } = req.body;

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
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
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