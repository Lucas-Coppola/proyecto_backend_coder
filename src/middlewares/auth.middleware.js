export function auth(req, res, next) { 
    if(req.user?.role === 'admin') {
        return next();
    }

    return res.status(401).send('Error de autorización');
};