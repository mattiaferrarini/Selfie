export function ensureAuthenticated(req: any, res: any, next: any) {
    if (req.isAuthenticated()) {
        return next();
    }
    // If not authenticated, you can redirect to login or send an error message
    res.status(401).send('User not authenticated');
}

export function isAdmin(req: any, res: any, next: any) {
    if (req.isAuthenticated() && req.user.isAdmin) {
        return next();
    }
    res.status(403).send('User not authorized');
}
