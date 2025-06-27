document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('carrito-container');

    
    function obtenerCarrito() {
        return JSON.parse(localStorage.getItem('carrito')) || [];
    }

    function guardarCarrito(carrito) {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    function eliminarProducto(id) {
        const carrito = obtenerCarrito().filter(producto => producto.id !== id);
        guardarCarrito(carrito);
        renderizarCarrito();
    }

    function renderizarCarrito() {
        const carrito = obtenerCarrito();
        container.innerHTML = '';

        if (carrito.length === 0) {
            container.innerHTML = '<p class="carrito-vacio">El carrito está vacío.</p>';
            return;
        }

        let total = 0;
        carrito.forEach(producto => {
            const subtotal = producto.precio * producto.cantidad;
            total += subtotal;

            const card = document.createElement('div');
            card.className = 'col-12 mb-3';
            card.innerHTML = `
        <div class="card card-producto-carrito flex-row align-items-center p-3">
          <div class="col-auto">
            <img src="${producto.imagen}" class="card-img-top imagen-producto-carrito" alt="${producto.nombre}">
          </div>
          <div class="card-body body-producto-carrito d-flex flex-column flex-md-row align-items-md-center justify-content-between w-100">
            <div>
              <h5 class="card-title title-producto-carrito mb-1">${producto.nombre}</h5>
              <p class="mb-1"><span class="fw-bold">Precio unitario:</span> $${producto.precio}</p>
              <p class="mb-1"><span class="fw-bold">Cantidad:</span> ${producto.cantidad}</p>
              <p class="mb-1"><span class="fw-bold">Subtotal:</span> $${subtotal}</p>
            </div>
            <button class="btn btn-danger eliminar-btn eliminar-producto-carrito ms-md-4 mt-3 mt-md-0" data-id="${producto.id}"><i class="bi bi-trash"></i> Eliminar</button>
          </div>
        </div>
      `;
            container.appendChild(card);
            const botonesEliminar = container.querySelectorAll('.eliminar-btn');
            botonesEliminar.forEach(boton => {
                boton.addEventListener('click', () => {
                    const id = boton.getAttribute('data-id');
                    eliminarProducto(id);
                });
            });
        });

        // Mostrar total y botón de pago debajo de todos los productos SOLO si hay productos
        if (carrito.length > 0) {
            const totalDiv = document.createElement('div');
            totalDiv.className = 'col-12 mt-4';
            totalDiv.innerHTML = `
        <div class="d-flex flex-column align-items-end">
          <h4 class="mb-3 total-precio-carrito">
            <span class="badge bg-success">Total: $${total}</span>
          </h4>
          <button class="btn btn-primary btn-lg boton-proceder-al-pago" id="btn-pago"><i class="bi bi-credit-card"></i> Proceder al pago</button>
        </div>
      `;
            container.appendChild(totalDiv);

            // Evento para el botón de pago
            const btnPago = document.getElementById('btn-pago');
            if (btnPago) {
                btnPago.addEventListener('click', async () => {
                    const result = await Swal.fire({
                        title: '¿Está seguro?',
                        text: '¿Desea proceder con el pago?',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Sí',
                        cancelButtonText: 'No',
                        confirmButtonColor: '#116d6a',
                        cancelButtonColor: '#d33'
                    });
                    if (result.isConfirmed) {
                        // Procesar stock de todos los productos
                        let errorStock = false;
                        for (const producto of carrito) {
                            const ok = await restarStockProducto(producto.id, producto.cantidad);
                            if (!ok) {
                                errorStock = true;
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Stock insuficiente',
                                    text: `No hay suficiente stock para el producto: ${producto.nombre}`,
                                    confirmButtonColor: '#116d6a'
                                });
                                break;
                            }
                        }
                        if (!errorStock) {
                            Swal.fire({
                                title: 'Simulando pago...',
                                allowOutsideClick: false,
                                allowEscapeKey: false,
                                didOpen: () => {
                                    Swal.showLoading();
                                    setTimeout(() => {
                                        Swal.fire({
                                            icon: 'success',
                                            title: '¡Pago exitoso!',
                                            text: 'Gracias por tu compra.',
                                            confirmButtonColor: '#116d6a'
                                        });
                                        // Vaciar carrito después del pago
                                        guardarCarrito([]);
                                        renderizarCarrito();
                                    }, 3000);
                                }
                            });
                        }
                    }
                });
            }
        }
    }

    renderizarCarrito();
});
