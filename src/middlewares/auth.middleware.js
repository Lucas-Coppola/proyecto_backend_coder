export function auth(req, res, next) {
    if(req.session?.user?.role) {
        return next()
    }

    return res.status(401).send('error de autorización')
}

// export function auth(req, res, next) {
//     if(req.session?.user?.admin) {
//         return next()
//     }

//     return res.status(401).send('error de autorización')
// }