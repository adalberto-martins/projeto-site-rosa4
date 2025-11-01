/* ==========================================================
   script.js — ROSA: Unhas • Cabelo
   ==========================================================
   🔹 Funções:
     1. Menu hamburguer responsivo
     2. Scroll reveal otimizado
     3. Formulário → WhatsApp direto
     4. Lightbox para galeria
     5. Atualização de rodapé automática
========================================================== */


/* ==========================================================
   CONFIGURAÇÕES GERAIS
========================================================== */
const WHATSAPP_NUM = "5519983557755"; // número da Rosa (sem + ou espaços)
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);


/* ==========================================================
   1️⃣ MENU HAMBURGUER — Responsivo e fluido
========================================================== */
const btnBurger = $('#btn-burger');
const navList = $('.nav-list');

if (btnBurger && navList) {
  btnBurger.addEventListener('click', () => {
    const expanded = btnBurger.getAttribute('aria-expanded') === 'true';
    btnBurger.setAttribute('aria-expanded', !expanded);
    navList.classList.toggle('open');
  });

  // Fechar menu ao clicar em um link
  navList.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      btnBurger.setAttribute('aria-expanded', 'false');
    });
  });

  // Corrige estado ao redimensionar
  window.addEventListener('resize', () => {
    if (window.innerWidth > 992) {
      navList.classList.remove('open');
      btnBurger.setAttribute('aria-expanded', 'false');
    }
  });
}


/* ==========================================================
   2️⃣ SCROLL REVEAL — animação otimizada
========================================================== */
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      obs.unobserve(entry.target); // ✅ libera o elemento após animar
    }
  });
}, { threshold: 0.15 });

$$('.reveal').forEach((el) => observer.observe(el));


/* ==========================================================
   3️⃣ FORMULÁRIO → ENVIO DIRETO PELO WHATSAPP
========================================================== */
const form = $('#agendarForm');
const formMessage = $('#formMessage');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = $('#btnSubmit');
    btn.disabled = true;
    btn.textContent = 'Abrindo WhatsApp...';

    const nome = $('#nome').value.trim();
    const telefone = $('#telefone').value.trim();
    const servico = $('#servico').value.trim();
    const data = $('#data').value;
    const obs = $('#obs').value.trim();

    if (!nome || !telefone || !servico || !data) {
      formMessage.textContent = '⚠️ Preencha todos os campos obrigatórios.';
      formMessage.className = 'form-message error';
      btn.disabled = false;
      btn.textContent = 'Agendar';
      return;
    }

    const mensagem = encodeURIComponent(
      `Olá, sou ${nome}!\n` +
      `Gostaria de agendar:\n` +
      `• Serviço: ${servico}\n` +
      `• Data: ${new Date(data).toLocaleString('pt-BR')}\n` +
      `• Telefone: ${telefone}\n` +
      (obs ? `• Observações: ${obs}` : '')
    );

    const waUrl = `https://wa.me/${WHATSAPP_NUM}?text=${mensagem}`;
    window.open(waUrl, '_blank');

    formMessage.textContent = '✅ A Rosa vai confirmar seu atendimento pelo WhatsApp.';
    formMessage.className = 'form-message success';

    form.reset();
    btn.disabled = false;
    btn.textContent = 'Agendar';
  });
}


/* ==========================================================
   4️⃣ LIGHTBOX — ampliar imagens da galeria
========================================================== */
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

// Abrir imagem
$$('.zoomable').forEach((img) => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightbox.classList.add('active');
  });
});

// Fechar lightbox
btnClose.addEventListener('click', () => lightbox.classList.remove('active'));
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) lightbox.classList.remove('active');
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') lightbox.classList.remove('active');
});


/* ==========================================================
   5️⃣ RODAPÉ — Atualiza automaticamente o ano
========================================================== */
const ano = $('#ano');
if (ano) ano.textContent = new Date().getFullYear();
