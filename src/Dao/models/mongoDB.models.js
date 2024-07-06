import { Schema, model } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

const productsCollection = 'productos'
const cartsCollection = 'carts'
const messagesCollection = 'messages'
const usersCollection = 'users'
const ticketsCollection = 'tickets'

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
    products: {
        type: [{
            product: {
                type: Schema.Types.ObjectId,
                ref: 'productos'
            },
            cantidad: Number
        }]
    }
});

const messagesSchema = new Schema([{
    user: String,
    message: String
}]);

const usersSchema = new Schema({
    fullname: {
        type: String
    },
    first_name: {
        type: String
    },
    last_name: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    age: Date,
    cart: String,
    role: {
        type: String,
        default: 'user'
    }
});

const ticketSchema = new Schema({
    code: {
        type: String,
        unique: true,
        default: function() {
            return Math.random().toString(36).substring(2, 10).toUpperCase();
        }
    },
    purchase_datetime: Date,
    amount: Number,
    purchaser: String
});

productsSchema.plugin(mongoosePaginate);

export const productsModel = model(productsCollection, productsSchema);

cartsSchema.pre('findOne', function () {
    this.populate('products.product');
});

export const cartsModel = model(cartsCollection, cartsSchema);

export const messagesModel = model(messagesCollection, messagesSchema);

export const usersModel = model(usersCollection, usersSchema);

export const ticketsModel = model(ticketsCollection, ticketSchema);