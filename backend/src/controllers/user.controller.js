import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const logoutUser = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "User logged out successfully" });
}

export const updateProfile = async (req, res) => {
    const { username, email, password, profilePicture } = req.body;
    const userId = req.user.userId; // From JWT token (set by middleware)

    try {
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if username is taken by another user
        if (username && username !== user.username) { // check if username is provided  and different from current username
            // Validate username format (only letters, numbers, and underscores)
            const usernameRegex = /^[a-zA-Z0-9_]+$/;
            if (!usernameRegex.test(username)) {
                return res.status(400).json({ message: "Username can only contain letters, numbers, and underscores" });
            }
            
            const existingUsername = await User.findOne({ username });
            if (existingUsername) {
                return res.status(400).json({ message: "Username already taken" });
            }
        }

        // Check if email is taken by another user
        if (email && email !== user.email) { // check if email is provided and different from current email
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: "Email already in use" });
            }
        }

        // Update fields if provided
        if (username) user.username = username;
        if (email) user.email = email;
        if (profilePicture) user.profilePicture = profilePicture;
        
        // Hash new password if provided
        if (password && password.trim() !== '') {
            if (password.length < 6) {
                return res.status(400).json({ message: "Password must be at least 6 characters long" });
            }
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        // Return updated user without password
        const { password: _, ...updatedUser } = user._doc;
        res.status(200).json({ 
            message: "Profile updated successfully", 
            user: updatedUser 
        });

    } catch (error) {
        res.status(500).json({ message: "Error updating profile", error: error.message });
    }
};

export const getUserProfile = async (req, res) => {
    const userId = req.user.userId; // From JWT token

    try {
        const user = await User.findById(userId).select("-password"); // exclude password
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile", error: error.message });
    }
};

export const deleteUserAccount = async (req, res) => {
    const userId = req.user.userId; // From JWT token

    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.clearCookie("token");
        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting account", error: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        // Check if user is a buyer
        if (req.user.role !== 'buyer') {
            return res.status(403).json({ message: "Access denied. Only buyers can view all users." });
        }

        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Sorting (newest or oldest first)
        const sortOrder = req.query.sort === 'oldest' ? 1 : -1;
        
        // Filter by role (optional - show only farmers or all)
        const roleFilter = req.query.role ? { role: req.query.role } : {};

        // Fetch users with pagination and sorting
        const users = await User.find(roleFilter)
            .select("-password")
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(limit);
        
        // Get total count for pagination info
        const totalUsers = await User.countDocuments(roleFilter);
        
        // Get farmers count
        const totalFarmers = await User.countDocuments({ role: 'farmer' });
        
        // Calculate users from last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentUsers = await User.countDocuments({
            ...roleFilter,
            createdAt: { $gte: sevenDaysAgo }
        });
        
        res.status(200).json({
            message: "Users fetched successfully",
            users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
                usersPerPage: limit
            },
            stats: {
                totalFarmers,
                recentUsers
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};