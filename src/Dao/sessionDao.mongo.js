import { usersModel } from "./models/mongoDB.models.js";

export class SessionManager {
    constructor() {
        this.users = usersModel;
    }

    async getAll() {
        try {
            return await this.users.find();
        } catch (error) {
            console.error('Error al obtener todos los usuarios:', error);
            throw error;
        }
    }

    async get(filter) {
        try {
            return await this.users.findOne(filter);
        } catch (error) {
            console.error('Error al obtener el usuario:', error);
            throw error;
        }
    }

    async create(nuevoUsuario) {
        try {
            return await this.users.create(nuevoUsuario);
        } catch (error) {
            console.error('Error al crear el usuario:', error);
            throw error;
        }
    }

    async update(id, updatedUser) {
        try {
            return await this.users.updateOne({_id: id}, updatedUser);
        } catch (error) {
            console.error('Error al crear el usuario:', error);
            throw error;
        }
    }

    async save(user) {
        try {
            return await user.save(); // Usa save para actualizar el documento
        } catch (error) {
            console.error('Error al actualizar el usuario:', error);
            throw error;
        }
    }

    async saveRecoveryToken(email, token) {
        try {
            const user = await this.get({ email });
            if (user) {
                user.recoveryToken = token;
                user.recoveryTokenExpiration = Date.now() + 3600000; // Token válido por 1 hora
                await this.update(user); // Usa update para guardar los cambios
            }
        } catch (error) {
            console.error('Error al guardar el token de recuperación:', error);
            throw error;
        }
    }

    async findByRecoveryToken(token) {
        try {
            return await this.users.findOne({
                recoveryToken: token,
                recoveryTokenExpiration: { $gt: Date.now() }
            });
        } catch (error) {
            console.error('Error al encontrar el usuario por token de recuperación:', error);
            throw error;
        }
    }
}

