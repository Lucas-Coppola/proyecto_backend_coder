import multer from 'multer';
import { __dirname } from '../util.js';
import path from 'path';
// import { fileURLToPath } from 'url';

const storage = multer.diskStorage({
    destination: function(req, file, callback){

        // console.log(req.body);

        // console.log(req.file);

        // console.log(body);
        console.log(file);

        let folder = 'uploads';
        if (req.body.tipo === 'profile') {
            folder = '/uploads/profile';
        } else if (req.body.tipo === 'producto') {
            folder = '/uploads/productos';
        } else if (req.body.tipo === 'document') {
            folder = '/uploads/documents';
        }

        const fullPath = path.join(__dirname, 'public', folder);

        console.log(`Guardando en: ${fullPath}`);

        callback(null, fullPath);
    },
    filename: function(req, file, callback){
        callback(null, `${Date.now()}-${file.originalname}`)
    }
});

export const uploader = multer({
    storage
});