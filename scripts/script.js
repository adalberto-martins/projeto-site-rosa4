/* ==============================================================
   script.js — ROSA: Unhas • Cabelo
   ==============================================================
   🔹 Funções deste script:
   1️⃣ Menu hamburger (abrir/fechar)
   2️⃣ Animação scroll reveal
   3️⃣ Formulário com envio ao WhatsApp + integração n8n (Google Calendar)
   4️⃣ Lightbox para galeria
   5️⃣ Atualização automática do ano no rodapé
============================================================== */

/* ==============================================================
   CONFIGURAÇÕES
============================================================== */

// Número do WhatsApp (somente números, com DDI e DDD)
const WHATSAPP_NUM = "5519983557755";

// Endpoint do n8n (produção)
const N8N_ENDPOINT = "https://rosaunhascabelo.app.n8n.cloud/webhook/agendar";

/* ==============================================================
   FUNÇÕES AUXILIARES
============================================================== */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* ==============================================================
   1️⃣ MENU HAMBURGER
============================================================== */
const btnBurger = $("#btn-burger");
const mainNav = $(".main-nav");

btnBurger?.addEventListener("click", () => {
  const expanded = btnBurger.getAttribute("aria-expanded") === "true";
  btnBurger.setAttribute("aria-expanded", String(!expanded));
  mainNav.classList.toggle("open");
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 992) {
    mainNav.classList.remove("open");
    btnBurger.setAttribute("aria-expanded", "false");
  }
});

/* ==============================================================
   2️⃣ SCROLL REVEAL
============================================================== */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const index = Array.from($$(".reveal")).indexOf(el);
        el.style.transitionDelay = `${index * 0.08}s`;
        el.classList.add("in-view");
      }
    });
  },
  { threshold: 0.12 }
);

$$(".reveal").forEach((el) => observer.observe(el));

/* ==============================================================
   3️⃣ FORMULÁRIO — WHATSAPP + N8N
============================================================== */
const form = $("#agendarForm");
const formMessage = $("#formMessage");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = $("#btnSubmit");
  btn.disabled = true;
  btn.textContent = "Enviando...";

  // Captura dos campos
  const nome = $("#nome").value.trim();
  const telefone = $("#telefone").value.trim();
  const servico = $("#servico").value;
  const data = $("#data").value;
  const obs = $("#obs").value.trim();

  // Validação
  if (!nome || !telefone || !servico || !data) {
    formMessage.textContent = "⚠️ Preencha todos os campos obrigatórios.";
    formMessage.className = "form-message error";
    btn.disabled = false;
    btn.textContent = "Agendar";
    return;
  }

  // Define duração automática por tipo de serviço
  let duracaoMinutos = 60; // padrão
  if (servico.toLowerCase().includes("cabel")) duracaoMinutos = 90;
  else if (servico.toLowerCase().includes("pacot")) duracaoMinutos = 120;

  // Monta mensagem para o WhatsApp
  const mensagem = encodeURIComponent(
    `Olá, sou ${nome}.\n` +
      `Quero agendar:\n` +
      `• Serviço: ${servico}\n` +
      `• Data: ${new Date(data).toLocaleString("pt-BR")}\n` +
      `• Telefone: ${telefone}\n` +
      `• Duração estimada: ${duracaoMinutos} minutos\n` +
      (obs ? `• Observações: ${obs}` : "")
  );

  // Abre conversa no WhatsApp
  window.open(`https://wa.me/${WHATSAPP_NUM}?text=${mensagem}`, "_blank");

  // Envia dados para o n8n
  try {
    const res = await fetch(N8N_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        telefone,
        servico,
        data: new Date(data).toISOString(),
        duracao: duracaoMinutos,
        obs,
      }),
    });

    const json = await res.json().catch(() => ({}));

    if (res.ok && json.status === "ok") {
      formMessage.textContent = "✅ Agendamento criado com sucesso!";
      formMessage.className = "form-message success";
    } else if (json.status === "erro") {
      formMessage.textContent = "❌ Horário indisponível. Escolha outro horário.";
      formMessage.className = "form-message error";
    } else {
      formMessage.textContent = "⚠️ Erro ao registrar no sistema. Tente novamente.";
      formMessage.className = "form-message error";
    }
  } catch (err) {
    console.error("Erro ao enviar para n8n:", err);
    formMessage.textContent = "🚫 Falha na conexão com o servidor.";
    formMessage.className = "form-message error";
  }

  // Finaliza
  form.reset();
  btn.disabled = false;
  btn.textContent = "Agendar";
});

/* ==============================================================
   4️⃣ LIGHTBOX — GALERIA
===========
