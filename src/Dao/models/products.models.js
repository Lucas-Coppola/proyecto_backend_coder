import { Schema, model } from "mongoose";

const productsCollection = 'productos'
const cartsCollection = 'carts'
const messagesCollection = 'messages'

const productsSchema = new Schema({
    title: String, 
    descripcion: String,
    precio: Number,
    img: String,
    code: String,
    stock: Number,
    category: String,
    status: Boolean
});

const cartsSchema = new Schema({
    id: Number,
    products: Array
});

const messagesSchema = new Schema([{
    user: String,
    message: String
}]);

export const productsModel = model(productsCollection, productsSchema); 

export const cartsModel = model(cartsCollection, cartsSchema);

export const messagesModel = model(messagesCollection, messagesSchema);