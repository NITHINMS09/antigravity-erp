"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
const jwt_1 = require("../utils/jwt");
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Access denied. No token provided.' });
        return;
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
}
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required.' });
            return;
        }
        if (roles.length > 0 && !roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Insufficient permissions.' });
            return;
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map