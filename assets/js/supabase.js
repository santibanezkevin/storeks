const { createClient } = supabase;

const SUPABASE_URL = 'https://brulmiuuabzxowgeduit.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJydWxtaXV1YWJ6eG93Z2VkdWl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNTA1NjIsImV4cCI6MjA2MjkyNjU2Mn0.AcozJF9kkhGFYzlCplJuLxVajf05VkgKeaXh3jhFwrM';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

async function leerProductos(tipo) {
  const url = `${SUPABASE_URL}/rest/v1/productos_ks?select=*&type_product=eq.${tipo}`;

  const respuesta = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!respuesta.ok) {
    console.error('Error al obtener los productos');
    return [];
  }

  return await respuesta.json();
}

async function mostrarProductos(categoria) {
  let consulta = supabaseClient.from('productos_ks').select('*');
  if (categoria) {
    consulta = consulta.eq('type_product', categoria);
  }

  const { data, error } = await consulta;

  if (error) {
    console.error('Error al consultar Supabase:', error);
    return;
  }
  if (!data || data.length === 0) {
    console.warn('No se encontraron productos' + (categoria ? ` para la categoría: ${categoria}` : ''));
    return;
  }

  const contenedor = document.getElementById('productos');
  contenedor.innerHTML = '<div class="row"></div>';
  const row = contenedor.querySelector('.row');

  data.forEach(producto => {
    if (producto.stock_product <= 0) return;
    const cardHTML = `
      <div class="col-xl-3 col-lg-4 col-md-4 col-sm-6">
        <div class="card product-item">
          <img src="${producto.url || '../img/storekslogo.webp'}" class="card-img-top" alt="${producto.name_product}">
          <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted ">${producto.type_product || ''}</h6>
            <h5 class="card-title">${producto.name_product}</h5>
            <p class="card-text">$${producto.price_product}
              <span class="ml-auto span-rating">
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
              </span>
            </p>
            <div class="mb-2 d-flex align-items-center cantidad-container">
              <label for="cantidad-${producto.id}" class="me-2 mb-0 cantidad-label">Cantidad:</label>
              <input type="number" id="cantidad-${producto.id}" class="form-control numero-stock" min="1" max="${producto.stock_product}" value="1">
              <span class="ms-2 text-muted stock">Stock: ${producto.stock_product}</span>
            </div>
            <div class="d-grid">
              <a class="btn btn-outline-primary agregar-carrito" href="#" data-id="${producto.id}" role="button">Agregar al carrito</a>
            </div>
          </div>
        </div>
      </div>
    `;
    row.innerHTML += cardHTML;
  });

  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('agregar-carrito')) {
      e.preventDefault();

      // Verifica si el usuario está logueado (con supabaseClient)
      let user;
      if (supabaseClient.auth.getUser) {
        user = (await supabaseClient.auth.getUser()).data.user;
      } else {
        const session = (await supabaseClient.auth.getSession()).data.session;
        user = session ? session.user : null;
      }

      if (!user) {
        Swal.fire({
          icon: 'warning',
          title: 'Inicia sesión',
          text: 'Debes iniciar sesión para agregar productos al carrito.',
          confirmButtonColor: '#116d6a'
        });
        return;
      }

      // Extraer datos del producto desde la card
      const button = e.target;
      const productId = button.getAttribute('data-id');
      const card = button.closest('.card');

      const name = card.querySelector('.card-title').textContent;
      const price = parseFloat(card.querySelector('.card-text').textContent.replace('$', ''));
      const image = card.querySelector('img').getAttribute('src');
      const cantidadInput = card.querySelector(`#cantidad-${productId}`);
      const cantidad = parseInt(cantidadInput.value);
      const stockMax = parseInt(cantidadInput.getAttribute('max'));

      // Validar cantidad ingresada
      if (cantidad < 1 || isNaN(cantidad)) {
        Swal.fire({
          icon: 'error',
          title: 'Cantidad inválida',
          text: `La cantidad debe ser un número válido mayor a 0.`,
          confirmButtonColor: '#116d6a'
        });
        return;
      }

      const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
      const productoExistente = carrito.find(item => item.id === productId);
      const cantidadActual = productoExistente ? productoExistente.cantidad : 0;
      const cantidadTotal = cantidadActual + cantidad;

      if (cantidadTotal > stockMax) {
        const unidadesDisponibles = stockMax - cantidadActual;
        let mensaje;

        if (cantidadActual >= stockMax) {
          mensaje = 'No hay más stock disponible para este producto.';
        } else if (cantidadActual > 0) {
          mensaje = `Ya tienes ${cantidadActual} en el carrito. Solo puedes agregar ${unidadesDisponibles} más.`;
        } else {
          mensaje = `No puedes agregar más de ${stockMax} unidades. Stock insuficiente.`;
        }

        Swal.fire({
          icon: 'error',
          title: 'Stock insuficiente',
          text: mensaje,
          confirmButtonColor: '#116d6a'
        });
        return;
      }


      // Armar el producto para guardar
      const producto = {
        id: productId,
        nombre: name,
        precio: price,
        imagen: image,
        cantidad: cantidad
      };

      // Agregar o actualizar producto en el carrito
      const indiceExistente = carrito.findIndex(item => item.id === productId);
      if (indiceExistente !== -1) {
        carrito[indiceExistente].cantidad += cantidad;
      } else {
        carrito.push(producto);
      }

      // Guardar el carrito actualizado
      localStorage.setItem('carrito', JSON.stringify(carrito));

      // Confirmación al usuario
      Swal.fire({
        icon: 'success',
        title: 'Producto agregado',
        text: `Agregado al carrito: ${name} x${cantidad}`,
        timer: 1500,
        showConfirmButton: false
      });
    }
  });


}



async function iniciarSesion(email, password) {

  if (!email || !password) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Por favor, ingresa tu email y contraseña.',
      confirmButtonColor: '#116d6a'
    });
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Credenciales incorrectas o el usuario no existe.',
      confirmButtonColor: '#116d6a', // Cambia el color del botón

    });
    return;
  }
  else {
    sessionStorage.setItem('usuario', JSON.stringify(data.user));
    Swal.fire({
      icon: 'success',
      title: '¡Bienvenido!',
      text: 'Inicio de sesión exitoso.',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      window.location.href = "index.html";
    });
  }

}


async function crearUsuario(email, password, displayName) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName
      }
    }
  });

  if (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message,
      confirmButtonColor: '#116d6a'
    });
    return;
  }

  Swal.fire({
    icon: 'success',
    title: '¡Usuario creado!',
    text: 'Revisa tu correo para confirmar la cuenta.',
    confirmButtonColor: '#116d6a'
  }).then(() => {
    window.location.href = "index.html";
  });
}


async function cerrarSesion() {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Hubo un error al cerrar sesión.',
      confirmButtonColor: '#116d6a'
    });
  } else {
    // Elimina la información del usuario del sessionStorage
    sessionStorage.removeItem('usuario');
    Swal.fire({
      icon: 'success',
      title: 'Sesión cerrada',
      text: 'Sesión cerrada correctamente.',
      confirmButtonColor: '#116d6a'
    }).then(() => {
      window.location.href = 'login.html';
    });
  }
}

// Resta cantidad al stock de un producto en Supabase
async function restarStockProducto(id, cantidadARestar) {
  // 1. Consultar el producto por id
  const { data, error } = await supabaseClient
    .from('productos_ks')
    .select('stock_product')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error al obtener el producto:', error);
    return false;
  }

  const stockActual = data.stock_product;
  const nuevoStock = stockActual - cantidadARestar;

  // 2. Validar que no quede negativo
  if (nuevoStock < 0) {
    console.warn('No hay suficiente stock');
    return false;
  }

  // 3. Actualizar el stock en la base de datos
  const { error: updateError } = await supabaseClient
    .from('productos_ks')
    .update({ stock_product: nuevoStock })
    .eq('id', id);

  if (updateError) {
    console.error('Error al actualizar el stock:', updateError);
    return false;
  }

  return true;
}


document.addEventListener('DOMContentLoaded', function() {
  const usuario = JSON.parse(sessionStorage.getItem('usuario'));
  if (usuario && usuario.email) {
    const saludo = document.getElementById('saludo-usuario');
    if (saludo) {
      saludo.textContent = `¡Hola, ${usuario.email}!`;
    }
  }
});