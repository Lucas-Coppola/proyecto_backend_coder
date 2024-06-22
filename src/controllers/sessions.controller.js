import passport  from "passport";

class SessionController {
    constructor(){}

    githubConfig = passport.authenticate('github', {scope: [ 'user:email' ]});

    githubLogin = (req, res) => {
        req.session.user = req.user
        res.redirect('http://localhost:8080/products');
    }

    createUser = async (req, res) => {
        res.redirect('http://localhost:8080/products');
    }

    getUser = async (req, res) => {

        if (!req.user) return res.status(400).send({ status: 'error', error: 'Credenciales invalidas' });
    
        console.log(req.user);
    
        req.session.user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email
        }
    
        return res.redirect('http://localhost:8080/products');
    }

    userLogout = (req, res) => {
        req.session.destroy(err => {
            if (err) return res.send({ status: 'error', error: err });
            else return res.redirect('http://localhost:8080/login');
        });
    }
}

export default SessionController