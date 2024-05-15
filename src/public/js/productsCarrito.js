const btnAgregar = document.querySelectorAll('.btnAgregarCarrito');

btnAgregar.forEach(btn => {
    btn.addEventListener('click', e => {
        const pid = e.target.getAttribute('data-id');

        alert('Producto agregado al carrito');
        fetch(`http://localhost:8080/api/carts/66415384d58d0d8b7e91820a/product/${pid}`, {
            method: 'POST'
        })
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(error => console.log(error));
    });
});