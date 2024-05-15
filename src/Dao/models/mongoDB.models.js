import { Schema, model } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

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

productsSchema.plugin(mongoosePaginate);

export const productsModel = model(productsCollection, productsSchema);

cartsSchema.pre('findOne', function () {
    this.populate('products.product');
});

export const cartsModel = model(cartsCollection, cartsSchema);

export const messagesModel = model(messagesCollection, messagesSchema);