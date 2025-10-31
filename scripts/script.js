/* ====================================================
   script.js - interações principais
   - menu burger com correção resize
   - scroll reveal
   - envio de formulário -> Google Apps Script + WhatsApp
   ==================================================== */

/* ====== CONFIGURAÇÕES (substitua antes de publicar) ====== */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby6oax1hWsGonYMFgEDi8f46D9-ejQWoMjhFOLCKx1JsAyVgQ0GTS1jCWD0FEtGWkCHLQ/exec"; // ex: https://script.google.com/macros/s/AKfy.../exec
const WHATSAPP_NUM = "5519983557755"; // número internacional sem + (ex: 5511999999999)

/* ====== Helpers ====== */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* Preencher ano automaticamente */
const anoEl = $("#ano");
if (anoEl) anoEl.textContent = new Date().getFullYear();

/* ====== MENU BURGER ====== */
const btnBurger = document.getElementById("btn-burger");
const mainNav = document.querySelector(".main-nav");

if (btnBurger && mainNav) {
  btnBurger.addEventListener("click", () => {
    const expanded = btnBurger.getAttribute("aria-expanded") === "true";
    btnBurger.setAttribute("aria-expanded", String(!expanded));
    mainNav.classList.toggle("open");
  });

  // Ao redimensionar: se for tela larga, garante estado desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      mainNav.classList.remove("open");
      btnBurger.setAttribute("aria-expanded", "false");
    }
  });

  // Ao clicar em link do menu no mobile, fecha o menu
  document.addEventListener("click", (e) => {
    if (!mainNav.classList.contains("open")) return;
    const target = e.target;
    if (target.tagName === "A" && target.closest(".main-nav")) {
      mainNav.classList.remove("open");
      btnBurger.setAttribute("aria-expanded", "false");
    }
  });
}

/* ====== Scroll reveal (simples) ====== */
try {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("in-view");
    });
  }, { threshold: 0.12 });

  $$(".reveal").forEach((el) => observer.observe(el));
} catch (err) {
  // IntersectionObserver não suportado: revela tudo
  $$(".reveal").forEach((el) => el.classList.add("in-view"));
}

/* ====== FORM: envio para Google Apps Script e abertura WhatsApp ====== */
const form = document.getElementById("agendarForm");
const formMessage = document.getElementById("formMessage");

if (form) {
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (!SCRIPT_URL || SCRIPT_URL.startsWith("COLE_AQUI")) {
      alert("URL do script não configurada. Cole a URL do Google Apps Script em SCRIPT_URL no código.");
      return;
    }

    // coletar dados
    const nome = (document.getElementById("nome") || {}).value?.trim() || "";
    const telefone = (document.getElementById("telefone") || {}).value?.trim() || "";
    const servico = (document.getElementById("servico") || {}).value || "";
    const data = (document.getElementById("data") || {}).value || "";
    const obs = (document.getElementById("obs") || {}).value?.trim() || "";

    // validação simples
    if (!nome || !telefone || !servico || !data) {
      formMessage.textContent = "Por favor preencha todos os campos obrigatórios.";
      formMessage.className = "form-message error";
      return;
    }

    const btn = document.getElementById("btnSubmit");
    btn.disabled = true;
    btn.textContent = "Enviando...";

    const payload = { nome, telefone, servico, data, obs };

    try {
      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Se não for JSON, captura erro
      const result = await res.json();

      if (result.status === "busy") {
        formMessage.textContent = result.message || "Este horário já está reservado. Escolha outro horário.";
        formMessage.className = "form-message busy";
        btn.disabled = false;
        btn.textContent = "Agendar";
        return;
      }

      if (result.status === "success") {
        formMessage.textContent = result.message || "Agendamento confirmado. Aguardando confirmação via WhatsApp.";
        formMessage.className = "form-message success";

        // Abre WhatsApp com mensagem formatada
        const mensagem = encodeURIComponent(
          `Olá, sou ${nome}.\nQuero agendar:\n• Serviço: ${servico}\n• Data: ${data}\n• Telefone: ${telefone}\n• Obs: ${obs}`
        );
        const waUrl = `https://wa.me/${WHATSAPP_NUM}?text=${mensagem}`;
        window.open(waUrl, "_blank");

        form.reset();
        btn.disabled = false;
        btn.textContent = "Agendar";
        return;
      }

      // caso resposta inesperada
      formMessage.textContent = result.message || "Erro no processamento. Tente novamente.";
      formMessage.className = "form-message error";
    } catch (err) {
      console.error("Erro fetch ->", err);
      formMessage.textContent = "Erro de conexão. Tente novamente mais tarde.";
      formMessage.className = "form-message error";
    } finally {
      btn.disabled = false;
      btn.textContent = "Agendar";
    }
  });
}

/* ====== LIGHTBOX GALERIA COMPLETA ====== */
document.addEventListener("DOMContentLoaded", () => {
  const imagens = document.querySelectorAll(".zoomable");
  if (imagens.length === 0) return;

  let currentIndex = 0;
  const lightbox = document.createElement("div");
  lightbox.classList.add("lightbox");
  lightbox.innerHTML = `
    <span class="close-btn" aria-label="Fechar imagem">&times;</span>
    <span class="nav-btn prev" aria-label="Anterior">❮</span>
    <img src="" alt="Imagem ampliada">
    <span class="nav-btn next" aria-label="Próxima">❯</span>
    <div class="caption"></div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector("img");
  const caption = lightbox.querySelector(".caption");
  const closeBtn = lightbox.querySelector(".close-btn");
  const btnPrev = lightbox.querySelector(".prev");
  const btnNext = lightbox.querySelector(".next");

  function abrirLightbox(index) {
    currentIndex = index;
    const imgAtual = imagens[currentIndex];
    lightboxImg.src = imgAtual.src;
    caption.textContent = imgAtual.alt || "";
    lightbox.classList.add("active");
  }

  function fecharLightbox() {
    lightbox.classList.remove("active");
    setTimeout(() => {
      lightboxImg.src = "";
      caption.textContent = "";
    }, 300);
  }

  function mostrarProxima() {
    currentIndex = (currentIndex + 1) % imagens.length;
    const imgAtual = imagens[currentIndex];
    lightboxImg.src = imgAtual.src;
    caption.textContent = imgAtual.alt || "";
  }

  function mostrarAnterior() {
    currentIndex = (currentIndex - 1 + imagens.length) % imagens.length;
    const imgAtual = imagens[currentIndex];
    lightboxImg.src = imgAtual.src;
    caption.textContent = imgAtual.alt || "";
  }

  imagens.forEach((img, index) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => abrirLightbox(index));
  });

  closeBtn.addEventListener("click", fecharLightbox);
  btnNext.addEventListener("click", mostrarProxima);
  btnPrev.addEventListener("click", mostrarAnterior);

  // Fecha clicando fora
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) fecharLightbox();
  });

  // Teclado
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "ArrowRight") mostrarProxima();
    if (e.key === "ArrowLeft") mostrarAnterior();
    if (e.key === "Escape") fecharLightbox();
  });

  // Swipe mobile
  let startX = 0;
  lightbox.addEventListener("touchstart", (e) => startX = e.touches[0].clientX);
  lightbox.addEventListener("touchend", (e) => {
    const endX = e.changedTouches[0].clientX;
    if (startX - endX > 50) mostrarProxima();
    if (endX - startX > 50) mostrarAnterior();
  });
});