import { UsersService } from "../service/index.js";

class UsersPremiumController {
    constructor() {}

    updateUserRole = async (req, res) => {
        try {
            const uid = req.params.uid;
    
            const usuarioEncontrado = await UsersService.get({ _id: uid });

            console.log(usuarioEncontrado);
    
            if(!usuarioEncontrado) return res.status(400).send('El usuario no ha sido encontrado');

            // Volver a confirmar si el usuario esta autorizado a ser premium
            const requiredFiles = ['identificacion', 'domicilio', 'cuenta'];
            const documentFilesValues = usuarioEncontrado.documents.map(doc => doc.value);
        
            console.log(documentFilesValues);
        
            const authDocumentsRequired = requiredFiles.every(type => documentFilesValues.includes(type));
        
            console.log(authDocumentsRequired);
        
            if(authDocumentsRequired) {
                usuarioEncontrado.authorized = true
                await usuarioEncontrado.save();
            } else if (!authDocumentsRequired) {
                usuarioEncontrado.authorized = false
                await usuarioEncontrado.save();
            }
        
            console.log(usuarioEncontrado.authorized);
            
            //Proceso de cambio de role
            let newRole

            const auth = usuarioEncontrado.authorized

            if(usuarioEncontrado.role === 'user' && auth === true) {
                newRole = 'premium'
            } else if (usuarioEncontrado.role === 'premium') {
                newRole = 'user'
            } else if (usuarioEncontrado.role === 'user' && auth === false) {
                return res.status(400).send('Falta de documentación para mejora del rol');
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

    uploaderUserFiles = async (req, res) => {
    
        const uid = req.user._id;
    
        const usuarioEncontrado = await UsersService.get({ _id: uid });
    
        const uploadedFile = {
            name: req.file.originalname,
            reference: req.file.path,
            value: req.body.tipo
        }
    
        usuarioEncontrado.documents.push(uploadedFile);
    
        const requiredFiles = ['identificacion', 'domicilio', 'cuenta'];
        const documentFilesValues = usuarioEncontrado.documents.map(doc => doc.value);
    
        console.log(documentFilesValues);
    
        const authDocumentsRequired = requiredFiles.every(type => documentFilesValues.includes(type));
    
        console.log(authDocumentsRequired);
    
        if(authDocumentsRequired) {
            usuarioEncontrado.authorized = true
            await usuarioEncontrado.save();
        }
    
        console.log(usuarioEncontrado.authorized);
    
        await usuarioEncontrado.save();
    
        if (!req.file) {
            return res.send('no se puede subir el archivo');
        }
    
        res.send('archivo subido');
    }
}

export default UsersPremiumController