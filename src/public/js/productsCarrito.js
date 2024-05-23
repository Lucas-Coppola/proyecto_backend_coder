const btnAgregar = document.querySelectorAll('.btnAgregarCarrito');

btnAgregar.forEach(btn => {
    btn.addEventListener('click', async e => {
        try {

            const pid = e.target.getAttribute('data-id');

            fetch(`http://localhost:8080/api/carts/66415384d58d0d8b7e91820a/product/${pid}`, {
                method: 'POST'
            })
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(error => console.log(error));
    
            alert('Producto agregado al carrito');

        } catch (error) {
            return console.log(error);
        }
    });
});