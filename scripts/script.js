// CONFIGURAÇÕES: cole sua URL do Google Apps Script e, se necessário, atualize o número do WhatsApp
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzWs5rJT39KIY9Gk6A_-ysE2WXMnoqcbOpH6ZhYYbzLha4_AkmXSmGj8Ygyokn7Qwdp_Q/exec";
const WHATSAPP_NUM = "5519983557755";

// preenchimento do ano
document.getElementById('ano').textContent = new Date().getFullYear();

// menu burger
const btnBurger = document.getElementById('btn-burger');
const navList = document.querySelector('.nav-list');
btnBurger?.addEventListener('click', () => {
    const expanded = btnBurger.getAttribute('aria-expanded') === 'true';
    btnBurger.setAttribute('aria-expanded', String(!expanded));
    navList.classList.toggle('open');
});

// Scroll reveal simples usando IntersectionObserver
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
    if (e.isIntersecting) {
        e.target.classList.add('in-view');
    }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Form submit -> Google Apps Script -> WhatsApp (com verificação de conflito)
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

    if (!SCRIPT_URL || SCRIPT_URL.startsWith("COLE_AQUI")) {
    alert("URL do script não configurada. Cole a URL do Google Apps Script em SCRIPT_URL no código.");
    btn.disabled = false;
    btn.textContent = 'Agendar';
    return;
    }

    const payload = { nome, telefone, servico, data, obs };

    try {
    const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (result.status === 'busy') {
        formMessage.textContent = result.message || 'Horário indisponível, escolha outro horário.';
        formMessage.className = 'form-message busy';
        btn.disabled = false;
        btn.textContent = 'Agendar';
        return;
    }

    if (result.status === 'success') {
        formMessage.textContent = result.message || 'Agendamento confirmado. Aguardando confirmação via WhatsApp.';
        formMessage.className = 'form-message success';

        // abre whatsapp com a mensagem
        const mensagem = encodeURIComponent(
        `Olá, sou ${nome}.\nQuero agendar:\n• Serviço: ${servico}\n• Data: ${data}\n• Telefone: ${telefone}\n• Obs: ${obs}`
        );
        const waUrl = `https://wa.me/${WHATSAPP_NUM}?text=${mensagem}`;
        window.open(waUrl, '_blank');

        form.reset();
        btn.disabled = false;
        btn.textContent = 'Agendar';
        return;
    }

    // erro
    formMessage.textContent = result.message || 'Erro ao processar. Tente novamente.';
    formMessage.className = 'form-message error';
    } catch (err) {
    console.error(err);
    formMessage.textContent = 'Erro de conexão. Tente novamente mais tarde.';
    formMessage.className = 'form-message error';
    } finally {
    btn.disabled = false;
    btn.textContent = 'Agendar';
    }
});