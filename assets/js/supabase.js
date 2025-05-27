const { createClient } = supabase;

const SUPABASE_URL = 'https://brulmiuuabzxowgeduit.supabase.co';
const SUPABASE_KEY = 'profe, por favor, ingrese la API KEY de Supabase aquí';
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
  contenedor.innerHTML = '';

  data.forEach(producto => {
    const cardHTML = `
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <img src="${producto.url || '../img/storekslogo.webp'}" class="card-img-top" alt="${producto.name_product}">
          <div class="card-body">
            <h5 class="card-title">${producto.name_product}</h5>
            <p class="text-success fw-bold">$${producto.price_product}</p>
            <p class="card-text">${producto.description_product || 'Sin descripción'}.</p>
            <a href="#" class="btn btn-dark">Agregar al carrito</a>
          </div>
        </div>
      </div>
    `;
    contenedor.innerHTML += cardHTML;
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