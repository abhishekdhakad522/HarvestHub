import jwt from "jsonwebtoken";

const extractToken = (req) => {
    const authHeader = req.headers.authorization || "";

    if (authHeader.startsWith("Bearer ")) {
        return authHeader.slice(7);
    }

    return req.cookies?.token;
};

export const verifyToken = (req, res, next) => {
    const token = extractToken(req);

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Add user info (userId, role) to request
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export const optionalVerifyToken = (req, res, next) => {
    const token = extractToken(req);

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (error) {
        req.user = null;
    }

    next();
};
