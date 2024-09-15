const btnAgregar = document.querySelectorAll('.btnAgregarCarrito');


btnAgregar.forEach(btn => {
    btn.addEventListener('click', async e => {
        try {
            const pid = e.target.getAttribute('data-product-id');
            const cid = e.target.getAttribute('data-cart-id');

            console.log(cid);
            
            const response = await fetch(`http://localhost:8080/api/carts/${cid}/product/${pid}`, {
                method: 'POST'
            });

            console.log(response);
            
            const data = await response.json();

            console.log(data);
            
            if (response.ok) {
                if (data.error) {
                    alert(`Error: ${data.error.cause}`);
                } else if(!data.error){
                    alert(`${data.payload}`);
                } else {
                    alert('Hubo un error al procesar la solicitud');
                }
            }
        } catch (error) {
            console.error(error);
            alert('Hubo un error al procesar la solicitud');
        }
    });
});