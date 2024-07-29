import passport from "passport";
import local from 'passport-local';
import { usersModel } from "../Dao/models/mongoDB.models.js";
import { createHash, isValidPassword } from "../utils/bcrypt.js";
import GithubStrategy from 'passport-github2';
import { envConfig } from "./config.js";
import { UsersService } from "../service/index.js";
import { UserDto } from "../dtos/users.dto.js";

const LocalStrategy = local.Strategy;

export const initPassport = () => {

    passport.use('github', new GithubStrategy({
        clientID: 'Iv23liQqTKNob14q5NyD',
        clientSecret: 'b376a701b46cdd88055c6f6cbe3b63bbddcee4be',
        callbackURL: 'http://localhost:8080/api/sessions/githubcallback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log(profile);
            let user = await UsersService.get({ email: profile._json.email });

            if (!user) {
                let nuevoUsuario = {
                    first_name: profile._json.name,
                    last_name: profile._json.last_name,
                    email: profile._json.email,
                    password: '',
                    cart: '66415384d58d0d8b7e91820a',
                    age: null
                }

                let result = await UsersService.create(nuevoUsuario);

                return done(null, result);

            } else {
                return done(null, user);
            }

        } catch (error) {
            return done(error);
        }
    }));

    passport.use('register', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'email'
    }, async (req, username, password, done) => {
        const { first_name, last_name, age } = req.body;

        try {
            let usuarioEncontrado = await UsersService.get({ email: username });

            if (usuarioEncontrado) {
                console.log('Usuario existente');
                return done(null, false);
            }

            let nuevoUsuario = {
                first_name,
                last_name,
                username,
                age,
                // cart: '66415384d58d0d8b7e91820a',
                password: createHash(password),
                // fullname: `${first_name} ${last_name}`
            }

            let result = await UsersService.create(nuevoUsuario);

            return done(null, result);

        } catch (error) {
            return done('Error al registrar usuario' + error);
        }
    }));

    const hardcodedAdmin = {
        email: envConfig.dbUser,
        password: envConfig.dbPass,
        role: 'admin',
        cart: '66415384d58d0d8b7e91820a',
        age: null
    };

    passport.use('login', new LocalStrategy({
        usernameField: 'email'
    }, async (username, password, done) => {
        try {

            if (username === hardcodedAdmin.email) {
                if (password === hardcodedAdmin.password) {
                    return done(null, hardcodedAdmin);
                } else {
                    return done(null, false, { message: 'Incorrect password.' });
                }
            }

            let user = await UsersService.get({ email: username });

            if (!user) {
                console.log('Usuario inexistente');
                return done(null, false);
            }

            if (!isValidPassword(password, { password: user.password })) return done(null, false);

            return done(null, user);

        } catch (error) {
            return done(error + 'Error al loguear usuario');
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.email);
    });

    passport.deserializeUser(async (email, done) => {

        if (email === hardcodedAdmin.email) {
            return done(null, hardcodedAdmin);
        }

        try {
            let usuario = await UsersService.get({ email: email });
            return done(null, usuario);
        } catch (error) {
            return done(error);
        }
    });
}