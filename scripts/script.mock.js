// ================================
// MODO DE TESTE LOCAL (MOCK)
// Simula o comportamento do Google Apps Script
// ================================

// Configurações básicas
const WHATSAPP_NUM = "5519983557755"; // número real da Rosa

// Preenchimento automático do ano no rodapé
document.getElementById('ano').textContent = new Date().getFullYear();

// Menu hamburger
const btnBurger = document.getElementById('btn-burger');
const navList = document.querySelector('.nav-list');
btnBurger?.addEventListener('click', () => {
  const expanded = btnBurger.getAttribute('aria-expanded') === 'true';
  btnBurger.setAttribute('aria-expanded', String(!expanded));
  navList.classList.toggle('open');
});

// Scroll reveal (animação simples)
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('in-view');
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ================================
// MOCK do envio de formulário
// ================================
const form = document.getElementById('agendarForm');
const formMessage = document.getElementById('formMessage');

form?.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  formMessage.textContent = '';
  const btn = document.getElementById('btnSubmit');
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  const nome = document.getElementById('nome').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const servico = document.getElementById('servico').value;
  const data = document.getElementById('data').value;
  const obs = document.getElementById('obs').value.trim();

  // Simula conexão e resposta (mock)
  await new Promise(res => setTimeout(res, 1500)); // atraso falso de rede

  // Regras simuladas:
  // Se o horário terminar com "5" → ocupado
  // Caso contrário → sucesso
  const hora = new Date(data).getHours();
  const status = hora === 15 || hora === 10 ? "busy" : "success"; // Exemplo: 10h e 15h ocupados

  if (status === "busy") {
    formMessage.textContent = "⚠️ Este horário está ocupado, escolha outro.";
    formMessage.className = "form-message busy";
    btn.disabled = false;
    btn.textContent = "Agendar";
    return;
  }

  if (status === "success") {
    formMessage.textContent = "✅ Agendamento confirmado (teste local).";
    formMessage.className = "form-message success";

    const mensagem = encodeURIComponent(
      `Olá, sou ${nome}.\nQuero agendar:\n• Serviço: ${servico}\n• Data: ${data}\n• Telefone: ${telefone}\n• Obs: ${obs}`
    );
    const waUrl = `https://wa.me/${WHATSAPP_NUM}?text=${mensagem}`;
    window.open(waUrl, '_blank'); // Abre WhatsApp Web
    form.reset();
  }

  btn.disabled = false;
  btn.textContent = "Agendar";
});