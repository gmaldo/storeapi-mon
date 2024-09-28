const button = document.getElementById('buy-now-btn');

button.addEventListener('click', async _ => {
    let cartID
    Swal.fire({
        title: "Ingresa el numero de carrito",
        input: "text",
        text: "Numero de carrito",
        inputValidator: (value) => {
            return !value && "Necesitas un nombre para continuar"
        },
        allowOutsideClick: false
    }).then(result => {
        cartID = result.value
        let productId = document.getElementById('product-id').innerHTML
        fetch(`../api/carts/${cartID}/product/${productId}`, {
            method: 'POST',
        })
        .then(response => {
            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Producto agregado al carrito",
                    showConfirmButton: false,
                    timer: 1500
                })
            }else{
                //console.log(response);
                response.json()
                .then(response => {
                    Swal.fire({
                        icon: "error",
                        title: "Error al agregar el producto\n"+response.error,
                        showConfirmButton: false,
                        timer: 1500
                    })
                })
                
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    })
   
});