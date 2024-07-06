import { UserDto } from "../dtos/users.dto.js";

export class UserRepository {
    constructor(userDao){
        this.userDao = userDao
    }

    getAll = async () => await this.userDao.getAll();
    get = async filter => await this.userDao.get(filter);
    create = async usuario => {
        const nuevoUsuario = new UserDto(usuario);
        return await this.userDao.create(nuevoUsuario);
    }
}