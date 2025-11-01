/* ==============================================================
   script.js — ROSA: Unhas • Cabelo
   ==============================================================
   🔹 Funções deste script:
   1️⃣ Menu hamburger (abrir/fechar)
   2️⃣ Animação scroll reveal com efeito em cascata
   3️⃣ Formulário com envio direto ao WhatsApp
   4️⃣ Lightbox para galeria de imagens
   5️⃣ Atualização automática do ano no rodapé
============================================================== */


/* ==============================================================
   CONFIGURAÇÕES
============================================================== */

// Número do WhatsApp da Rosa (sem +, sem espaços)
const WHATSAPP_NUM = "5519983557755";

/* ==============================================================
   FUNÇÕES AUXILIARES
============================================================== */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));


/* ==============================================================
   1️⃣ MENU HAMBURGUER (MOBILE)
============================================================== */
const btnBurger = $('#btn-burger');
const mainNav = $('.main-nav');

btnBurger?.addEventListener('click', () => {
  const expanded = btnBurger.getAttribute('aria-expanded') === 'true';
  btnBurger.setAttribute('aria-expanded', String(!expanded));
  mainNav.classList.toggle('open');
});

// Corrige comportamento ao redimensionar
window.addEventListener('resize', () => {
  if (window.innerWidth > 992) {
    mainNav.classList.remove('open');
    btnBurger.setAttribute('aria-expanded', 'false');
  }
});


/* ==============================================================
   2️⃣ SCROLL REVEAL — animações com efeito em cascata
============================================================== */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const el = entry.target;
      // Adiciona atraso em cascata com base na ordem
      const index = Array.from($$('.reveal')).indexOf(el);
      el.style.transitionDelay = `${index * 0.08}s`; // 80ms entre elementos
      el.classList.add('in-view');
    }
  });
}, { threshold: 0.12 });

// Observa todos os elementos .reveal
$$('.reveal').forEach((el) => observer.observe(el));


/* ==============================================================
   3️⃣ FORMULÁRIO — ENVIO DIRETO PELO WHATSAPP
============================================================== */
const form = $('#agendarForm');
const formMessage = $('#formMessage');

form?.addEventListener('submit', (e) => {
  e.preventDefault();

  const btn = $('#btnSubmit');
  btn.disabled = true;
  btn.textContent = 'Abrindo WhatsApp...';

  // Captura os campos do formulário
  const nome = $('#nome').value.trim();
  const telefone = $('#telefone').value.trim();
  const servico = $('#servico').value;
  const data = $('#data').value;
  const obs = $('#obs').value.trim();

  // Validação simples
  if (!nome || !telefone || !servico || !data) {
    formMessage.textContent = '⚠️ Preencha todos os campos obrigatórios.';
    formMessage.className = 'form-message error';
    btn.disabled = false;
    btn.textContent = 'Agendar';
    return;
  }

  // Monta mensagem formatada
  const mensagem = encodeURIComponent(
    `Olá, sou ${nome}.\n` +
    `Quero agendar:\n` +
    `• Serviço: ${servico}\n` +
    `• Data: ${new Date(data).toLocaleString('pt-BR')}\n` +
    `• Telefone: ${telefone}\n` +
    (obs ? `• Observações: ${obs}` : '')
  );

  // Abre WhatsApp Web / Mobile
  const waUrl = `https://wa.me/${WHATSAPP_NUM}?text=${mensagem}`;
  window.open(waUrl, '_blank');

  // Feedback visual no formulário
  formMessage.textContent = '✅ Solicitação enviada! A Rosa confirmará no WhatsApp.';
  formMessage.className = 'form-message success';

  // Reseta o formulário
  form.reset();
  btn.disabled = false;
  btn.textContent = 'Agendar';
});


/* ==============================================================
   4️⃣ LIGHTBOX — AMPLIAR IMAGENS DA GALERIA
============================================================== */
const lightbox = document.createElement('div');
lightbox.id = 'lightbox';
lightbox.innerHTML = `
  <div class="lightbox-content">
    <img src="" alt="Imagem ampliada">
    <button class="lightbox-close" aria-label="Fechar">&times;</button>
  </div>
`;
document.body.appendChild(lightbox);

const lightboxImg = lightbox.querySelector('img');
const btnClose = lightbox.querySelector('.lightbox-close');

// Ao clicar numa imagem da galeria com .zoomable
$$('.zoomable').forEach((img) => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightbox.classList.add('active');
  });
});

// Fecha lightbox (botão, clique fora ou ESC)
btnClose.addEventListener('click', () => lightbox.classList.remove('active'));
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) lightbox.classList.remove('active');
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') lightbox.classList.remove('active');
});


/* ==============================================================
   5️⃣ ANO AUTOMÁTICO NO RODAPÉ
============================================================== */
$('#ano').textContent = new Date().getFullYear();
