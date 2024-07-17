import passport  from "passport";
import { UserDtoCurrent } from "../dtos/users.dto.js";
// import { UsersService } from "../service.js";
import { UsersService } from "../service/index.js";

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
    
        req.logger.info(req.user);
    
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

    userDataAdminAccess = async (req, res) => {
        const users = await UsersService.getAll();
        
        function calcularEdad(fecha) {
            var hoy = new Date();
            var cumpleanos = new Date(fecha);
            var edad = hoy.getFullYear() - cumpleanos.getFullYear();
            var m = hoy.getMonth() - cumpleanos.getMonth();
    
            if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
                edad--;
            }
    
            return edad;
        }
    
        const UsersDtoCurrent = users.map(user => {
            if (user.age !== null) {
                const edad = calcularEdad(user.age);
    
                req.logger.info(edad);
    
                const { first_name, last_name, email, role } = user
    
                const usersDto = new UserDtoCurrent({first_name, last_name, email, role, age: edad});
    
                req.logger.info(usersDto);
    
                return usersDto;
    
            } else return new UserDtoCurrent(user);
        });
        
        res.send({ status: 'Usuario autorizado a datos sensibles', payload: UsersDtoCurrent });
    }
}

export default SessionController