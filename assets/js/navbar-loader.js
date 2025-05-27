async function cargarNavbarYSesion() {
  const container = document.getElementById("navbar-container");
  if (!container) return;

  const res = await fetch("includes/navbar.html");
  const data = await res.text();
  container.innerHTML = data;

  // Verifica si el usuario está logueado (con supabaseClient)
  let user;
  if (supabaseClient.auth.getUser) {
    user = (await supabaseClient.auth.getUser()).data.user;
  } else {
    const session = (await supabaseClient.auth.getSession()).data.session;
    user = session ? session.user : null;
  }

  if (user) {
    document.getElementById("login-link").style.display = "none";
    document.getElementById("login-carrito").style.display = "block";
    document.getElementById("logout-link-li").style.display = "block";
  } else {
    document.getElementById("login-link").style.display = "block";
    document.getElementById("login-carrito").style.display = "none";
    document.getElementById("logout-link-li").style.display = "none";
  }

  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      cerrarSesion();
    });
  }

  // Carga el script links.js y ejecuta la función cargarLinksNavbar()
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "assets/js/links.js";
    script.onload = () => {
      if (typeof cargarLinksNavbar === "function") {
        cargarLinksNavbar();
      }
      resolve();
    };
    document.body.appendChild(script);
  });
}
