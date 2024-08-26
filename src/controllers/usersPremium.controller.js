import { UsersService } from "../service/index.js";

class UsersPremiumController {
    constructor() {}

    updateUserRole = async (req, res) => {
        try {
            const uid = req.params.uid;
    
            const usuarioEncontrado = await UsersService.get({ _id: uid });

            console.log(usuarioEncontrado);
    
            if(!usuarioEncontrado) return res.status(400).send('El usuario no ha sido encontrado');
            
            let newRole

            if(usuarioEncontrado.role === 'user') {
                newRole = 'premium'
            } else if (usuarioEncontrado.role === 'premium') {
                newRole = 'user'
            } else {
                return res.status(400).send('Rol del usuario no válido');
            }
    
            console.log(newRole);
    
            const roleUpdated = await UsersService.update({ _id: uid }, {role: newRole});

            console.log(roleUpdated);
    
            res.status(200).send({ status: 'success', payload: roleUpdated });
    
        } catch (error) {
            console.log(error);
            res.status(500).send({ status: 'error', message: 'Error interno del servidor' });
        }
    }
}

export default UsersPremiumController