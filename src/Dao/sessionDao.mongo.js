import { usersModel } from "./models/mongoDB.models.js";

export class SessionManager {
    constructor() {
        this.users = usersModel
    }

    async get(filter) {
        return await usersModel.findOne(filter);
    }

    async create(nuevoUsuario) {
        return await usersModel.create(nuevoUsuario);
    }
}