export function auth(req, res, next) { 
    console.log(req.user);
    if(req.user?.role === 'admin') {
        return next();
    }

    return res.status(401).send('Error de autorización');
};

export function authUser(req, res, next) {
    if(req.user?.role === 'user') {
        return next();
    }

    return res.status(401).send('Permitido solo para usuarios normales');
}