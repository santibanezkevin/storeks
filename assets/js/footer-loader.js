async function cargarFooter() {
  const container = document.getElementById("footer-container");
  if (!container) return;

  const res = await fetch("/includes/footer.html");
  const data = await res.text();
  container.innerHTML = data;
}

cargarFooter();


