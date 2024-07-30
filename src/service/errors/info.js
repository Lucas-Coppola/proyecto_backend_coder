export const createProductError = product => {
    return `Campos incompletos o inválidos.
    Campos requeridos: 
    * Title: Se recibio ${product.title}
    * Descripcion: Se recibio ${product.descripcion}
    * Precio: Se recibio ${product.precio}
    * Img: Se recibio ${product.img}
    * Code: Se recibio ${product.code}
    * Stock: Se recibio ${product.stock}
    * Category: Se recibio ${product.category}
    `
}

export const codeProductExistente = p => {
    return `El code ${p.code} ya existe y los productos no pueden compartirlo`
}

export const notFoundProduct = p => {
    return `El producto con id: ${p}, no fue encontrado`
}

export const notFoundCart = c => {
    return `El carrito con id: ${c}, no fue encontrado`
}

export const stockAgotado = p => {
    return `El stock del producto id: ${p} se encuentra agotado`
}

export const cantidadSuperaStock = () => {
    return `La cantidad que desea supera al stock disponible`
}

export const sameOwner = p => {
    return `El ${p} fue creado por usted mismo, por lo que no puede agregarlo a su carrito`
}