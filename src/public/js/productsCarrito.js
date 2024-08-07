const btnAgregar = document.querySelectorAll('.btnAgregarCarrito');


btnAgregar.forEach(btn => {
    btn.addEventListener('click', async e => {
        try {
            const pid = e.target.getAttribute('data-id');
            
            const response = await fetch(`http://localhost:8080/api/carts/66415384d58d0d8b7e91820a/product/${pid}`, {
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
        
        // btnAgregar.forEach(btn => {
        //     btn.addEventListener('click', async e => {
        //         try {
        
        //             const pid = e.target.getAttribute('data-id');
        
        //             fetch(`http://localhost:8080/api/carts/66415384d58d0d8b7e91820a/product/${pid}`, {
        //                 method: 'POST'
        //             })
        //             .then(res => res.json())
        //             .then(data => console.log(data))
        //             .catch(error => console.log(error));
        
        //             // alert('Producto agregado al carrito');
        
        //         } catch (error) {
        //             return console.log(error);
        //         }
        //     });
        // });