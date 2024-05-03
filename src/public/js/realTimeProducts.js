console.log('funcionando');

const socket = io();

const eliminarProducto = document.getElementById('btnEliminar');
const agregarProducto = document.getElementById('btnAgregar');

agregarProducto.addEventListener('click', e => {
    e.preventDefault();

    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('descripcion');
    const precioInput = document.getElementById('precio');
    const imgInput = document.getElementById('img');
    const codeInput = document.getElementById('code');
    const stockInput = document.getElementById('stock');
    const categoryInput = document.getElementById('category');

    if (titleInput.value == '' || descriptionInput.value == '' || precioInput.value < 0 || imgInput.value == '' || codeInput.value < 0 || stockInput.value < 0 || categoryInput.value == '') return console.log('por favor complete todos los datos');

    const producto = {
        title: titleInput.value,
        descripcion: descriptionInput.value,
        precio: precioInput.value,
        img: imgInput.value,
        code: codeInput.value,
        stock: stockInput.value,
        category: categoryInput.value,
        status: true
    };

    socket.emit('producto_actualizado', producto);

    titleInput.value = '';
    descriptionInput.value = '';
    precioInput.value = '';
    imgInput.value = '';
    codeInput.value = '';
    stockInput.value = '';
    categoryInput.value = '';
});

eliminarProducto.addEventListener('click', e => {
    e.preventDefault();
    
    let idEliminar
    Swal.fire({
        title: 'Eliminar Producto',
        input: 'text',
        text: 'Eliminá un producto por su ID',
        inputValidator: value => {
            return !value && 'Necesitas escribir un ID para continuar'
        },
        allowOutsideClick: false
    })
    .then(result => {
        idEliminar = result.value
        console.log(idEliminar);
        socket.emit('producto_eliminar', idEliminar);
    });
});

socket.on('productos_actualizados', data => {
    console.log(data);

    let productosLog = document.getElementById('productosRealTime');

    let productos = ``
    data.forEach( p => 
        productos += ` <div>
            <p>Nombre del producto: ${p.title} </p>
            <p> Descripcion: ${p.descripcion} </p>
            <p> $${p.precio} </p>
            <p> ${p.img} </p>
            <p> Codigo: ${p.code} </p>
            <p> Id: ${p.id} </p>
            <p> Stock: ${p.stock}</p>
            <p> Category: ${p.category} </p>
            <p> Status: ${p.status} </p>
        </div>`
    );

    productosLog.innerHTML = productos;
});

socket.on('productos_eliminados', data => {
    console.log(data);

    let productosLog = document.getElementById('productosRealTime');

    let productos = ``
    data.forEach( p => 
        productos += ` <div>
            <p>Nombre del producto: ${p.title} </p>
            <p> Descripcion: ${p.descripcion} </p>
            <p> $${p.precio} </p>
            <p> ${p.img} </p>
            <p> Codigo: ${p.code} </p>
            <p> Id: ${p.id} </p>
            <p> Stock: ${p.stock}</p>
            <p> Category: ${p.category} </p>
            <p> Status: ${p.status} </p>
        </div>`
    );

    productosLog.innerHTML = productos;
});