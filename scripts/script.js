/* ====================================================
   script.js - interações principais
   - menu burger com correção resize
   - scroll reveal
   - envio de formulário -> Google Apps Script + WhatsApp
   ==================================================== */

/* ====== CONFIGURAÇÕES (substitua antes de publicar) ====== */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZy1BDgqE9mefWJrTTCVNBldlufnO93fK9Bq68qmFZxJ77j1QzTm2elQIJ_BsH7fPPCw/exec"; // ex: https://script.google.com/macros/s/AKfy.../exec
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