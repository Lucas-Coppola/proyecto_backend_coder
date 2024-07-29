import { UserDto } from "../dtos/users.dto.js";

export class UserRepository {
    constructor(userDao) {
        this.userDao = userDao;
    }

    // Obtener todos los usuarios
    getAll = async () => await this.userDao.getAll();

    // Obtener un usuario por filtro
    get = async filter => await this.userDao.get(filter);

    // Crear un nuevo usuario
    create = async usuario => {
        const nuevoUsuario = new UserDto(usuario);
        return await this.userDao.create(nuevoUsuario);
    }

    update = async (id, updatedUser) => this.userDao.update(id, updatedUser);

    save = async usuario => await usuario.save();

    // Guardar el token de recuperación y su expiración
    saveRecoveryToken = async (email, token) => {
        const user = await this.userDao.get({ email });
        if (user) {
            user.recoveryToken = token;
            user.recoveryTokenExpiration = Date.now() + 3600000;
            await this.userDao.save(user);
        }
    }

    // Encontrar un usuario por el token de recuperación
    findByRecoveryToken = async token => {
        return await this.userDao.findByRecoveryToken(token);
    }
}