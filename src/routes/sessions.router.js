import { Router } from "express";
import { usersModel } from "../Dao/models/mongoDB.models.js";

const router = Router();

router.post('/register', async (req, res) => {
    try {
        
        const { first_name, last_name, email, password } = req.body

        if(!email || !password) res.send('Por favor complete los datos para poder registrarse');
    
        const usuarioExistente = await usersModel.findOne({email: email});
        if(usuarioExistente) res.status(401).send({status: 'error', error: 'Email existente, selecciona otro para registrarte' });
        else {

            const nuevoUsuario = {
                first_name,
                last_name,
                email,
                password
            }
        
            const result = await usersModel.create(nuevoUsuario);
            
            res.send('Registrado exitosamente, por favor, loguee para corroborar siguiendo este link: http://localhost:8080/login');
            
        }

    } catch (error) {
        res.status(401).send({status: error, error: 'Faltan datos o email ya en uso'})
    }
});

router.post('/login', async (req, res) => {
    try {

        const { email, password } = req.body

        if(!email || !password) res.send('Por favor complete los datos para poder registrarse');

        let usuarioEncontrado = await usersModel.findOne({email});

        // console.log(usuarioEncontrado);

        if(email === 'adminCoder@coder.com' && password === 'adminCod3er123') {
            req.session.user = {
                email,
                admin: true
            }

            // usuarioEncontrado = {
            //     email,
            //     first_name: 'Admin Coder',
            //     role: 'admin'
            // }

            // console.log(usuarioEncontrado);

           return res.redirect('http://localhost:8080/products');
        }
    
        if(!usuarioEncontrado) return res.status(401).send({status: 'error', error: 'usuario no encontrado'});

        if(usuarioEncontrado) {
            req.session.user = {
                email,
                admin: usuarioEncontrado.role === 'admin'
            }

           return res.redirect('http://localhost:8080/products');
        }
        
    } catch (error) {
        console.log(error);
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy( err => {
        if(err) return res.send({status: 'error', error: err});
        else return res.redirect('http://localhost:8080/login');
    });
});

export default router