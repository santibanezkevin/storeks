const cargarLinksNavbar = () => {
  const paginasPrincipales = [
    { titulo: "Home", url: "/index.html" }  ];

  const paginasCategorias = [
    { titulo: "Zapatillas", url: "/categorias/zapatillas.html" },
    { titulo: "Indumentaria", url: "/categorias/indumentaria.html" },
    { titulo: "Accesorios", url: "/categorias/accesorios.html" },
  ];

  const navList = document.getElementById("menu-links");
  const dropdownList = document.getElementById("dropdown-categorias");

  paginasPrincipales.forEach((pagina, index) => {
    const li = document.createElement("li");
    li.className = "nav-item";

    const a = document.createElement("a");
    a.className = "nav-link text-white";
    a.href = pagina.url;
    a.textContent = pagina.titulo;

    if (index === 0) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }

    li.appendChild(a);
    navList.insertBefore(li, navList.firstChild);
  });

  // Elementos del DROPDOWN
  paginasCategorias.forEach((pagina, index) => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.className = "dropdown-item";
    a.href = pagina.url;
    a.textContent = pagina.titulo;

    li.appendChild(a);

    if (index === 2) {
      const divider = document.createElement("li");
      divider.innerHTML = '<hr class="dropdown-divider" />';
      dropdownList.appendChild(divider);
    }

    dropdownList.appendChild(li);
  });
};
