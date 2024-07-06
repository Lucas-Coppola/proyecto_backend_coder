import { usersModel } from "./models/mongoDB.models.js";

export class SessionManager {
    constructor() {
        this.users = usersModel
    }

    async getAll() {
        return await usersModel.find();
    }

    async get(filter) {
        return await usersModel.findOne(filter);
    }

    async create(nuevoUsuario) {
        return await usersModel.create(nuevoUsuario);
    }
}