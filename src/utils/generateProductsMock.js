import { faker } from "@faker-js/faker"

export const generateProduct = () => {
    return {
        _id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        descripcion: faker.commerce.productDescription(),
        precio: faker.commerce.price(),
        img: faker.image.url(),
        code: faker.string.alphanumeric(),
        stock: faker.number.octal(),
        category: faker.commerce.product(),
        status: true
    }
}