import passport from "passport";
import { UserDtoCurrent } from "../dtos/users.dto.js";
// import { UsersService } from "../service.js";
import { UsersService } from "../service/index.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from 'crypto'
import bcrypt from 'bcrypt'
// import { UsersService } from "../../service/index.js";
import { createHash } from "../utils/bcrypt.js"

class SessionController {
    constructor() { }

    githubConfig = passport.authenticate('github', { scope: ['user:email'] });

    githubLogin = (req, res) => {
        req.session.user = req.user
        res.redirect('http://localhost:8080/products');
    }

    createUser = async (req, res) => {
        // req.session.user = req.user

        // req.user = {
        //     first_name: req.user.first_name,
        //     last_name: req.user.last_name,
        //     email: req.user.email,
        //     role: req.user.role
        // }

        res.redirect('http://localhost:8080/products');
    }

    getUser = async (req, res) => {

        if (!req.user) return res.status(400).send({ status: 'error', error: 'Credenciales invalidas' });

        req.logger.info(req.user);

        req.user.last_connection = Date.now();

        req.session.user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            role: req.user.role
        }

        return res.redirect('http://localhost:8080/products');
    }

    userLogout = async (req, res) => {
        // console.log(req.user.last_connection);
        
        const usuario = req.user

        if (usuario.email != 'adminCoder@coder.com') {
            usuario.last_connection = Date.now();

            await usuario.save();
        }

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

                const usersDto = new UserDtoCurrent({ first_name, last_name, email, role, age: edad });

                req.logger.info(JSON.stringify(usersDto, null, 2));

                return usersDto;

            } else return new UserDtoCurrent(user);
        });

        res.send({ status: 'Usuario autorizado a datos sensibles', payload: UsersDtoCurrent });
    }

    recoverPass = async (req, res) => {
        const { token, email, newPassword } = req.body;

        console.log('Body:', req.body);

        try {
            // Obtener el usuario usando el token
            const user = await UsersService.findByRecoveryToken(token);

            // console.log(user);

            if (user.email !== email || !newPassword) {
                return res.status(400).json({ message: 'Email no coincide o contraseña inválida.' });
            } else if (!user) {
                res.status(500).json({ message: 'Token inválido' });
                return res.redirect('http://localhost:8080/recoverByEmail');
            }

            // Verificar si la nueva contraseña es igual a la actual
            const isSamePassword = await bcrypt.compare(newPassword, user.password);
            if (isSamePassword) {
                return res.status(400).json({ message: 'La nueva contraseña no puede ser la misma que la anterior.' });
            }

            // Crear el hash de la nueva contraseña
            const hashedPassword = createHash(newPassword);

            // Actualizar la contraseña del usuario
            user.password = hashedPassword;
            user.recoveryToken = null;
            user.recoveryTokenExpiration = null;
            await UsersService.save(user);

            console.log('Contraseña actualizada correctamente');
            // return res.status(200).send({ message: 'Contraseña actualizada correctamente' });
            res.redirect('http://localhost:8080/login');

        } catch (error) {
            console.error('Error al recuperar contraseña:', error);
            return res.status(500).send({ message: 'Error al recuperar contraseña' });
        }
    }

    recoverPassByEmail = async (req, res) => {
        try {
            const { email } = req.body

            console.log(email);

            if (email) {

                const token = crypto.randomBytes(20).toString('hex');

                await UsersService.saveRecoveryToken(email, token);

                const html = `Para recuperar contraseña siga el enlace <a href='http://localhost:8080/passwordReset/${token}' > restablecer contraseña </a>. Luego de 60 minutos el link expirará y te redigirá a la solicitud de cambio nuevamente.`

                sendEmail({
                    userMail: email,
                    subject: 'Recuperacion de contraseña',
                    html,
                    to: email
                });

                return res.status(200).send(`Se ha enviado el mail de recuperación al destinatario seleccionado: ${email}`);

            } else return res.status(400).send('No se seleccionó un destinatario');

        } catch (error) {
            res.send(error);
        }
    }

    updateUserRole = async (req, res) => {
        try {
            const uid = req.params.uid;

            const usuarioEncontrado = await UsersService.get({ _id: uid });

            console.log(usuarioEncontrado);

            if (!usuarioEncontrado) return res.status(400).send('El usuario no ha sido encontrado');

            let newRole

            if (usuarioEncontrado.role === 'user') {
                newRole = 'premium'
            } else if (usuarioEncontrado.role === 'premium') {
                newRole = 'user'
            } else {
                return res.status(400).send('Rol del usuario no válido');
            }

            console.log(newRole);

            const roleUpdated = await UsersService.update({ _id: uid }, { role: newRole });

            console.log(roleUpdated);

            res.status(200).send({ status: 'success', payload: roleUpdated });

        } catch (error) {
            console.log(error);
            res.status(500).send({ status: 'error', message: 'Error interno del servidor' });
        }
    }
}

export default SessionController