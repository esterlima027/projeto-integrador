// ---------- LOG TICKER ----------
const logActions = [
  "localização capturada","cookie de rastreamento gravado","perfil de consumo atualizado",
  "sessão de navegação registrada","dispositivo identificado (fingerprint)","permissão de microfone verificada",
  "histórico de busca indexado","padrão de uso compilado","dado compartilhado com parceiro ad-tech",
  "tempo de tela registrado","contato sincronizado","rota de deslocamento salva"
];
const logFeed = document.getElementById('log-feed');
const MAX_LOGS = 14;
function pad(n){ return n.toString().padStart(2,'0'); }
function pushLog(){
  const now = new Date();
  const ts = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const action = logActions[Math.floor(Math.random()*logActions.length)];
  const el = document.createElement('div');
  el.className = 'entry';
  el.innerHTML = `<span class="ts">${ts}</span> — ${action}`;
  logFeed.appendChild(el);
  while(logFeed.children.length > MAX_LOGS){ logFeed.removeChild(logFeed.firstChild); }
  logFeed.scrollTop = logFeed.scrollHeight;
}
for(let i=0;i<8;i++){ setTimeout(pushLog, i*120); }
setInterval(pushLog, 2600);

// ---------- CHAPTER NAV ACTIVE STATE (desktop + mobile) ----------
const navLinks = document.querySelectorAll('#chapters a, #chapters-mobile a');
const chapters = document.querySelectorAll('section.chapter');
const obs = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      navLinks.forEach(l=>l.classList.remove('active'));
      document.querySelectorAll(`a[href="#${entry.target.id}"]`).forEach(link=>link.classList.add('active'));
    }
  });
}, {threshold:0.3});
chapters.forEach(c=>obs.observe(c));

// ---------- LGPD RIGHTS ----------
const rights = [
  {t:"Confirmação da existência de tratamento", d:"Saber, de forma simples, se uma empresa trata algum dado seu — sim ou não, sem precisar justificar o pedido."},
  {t:"Acesso aos dados", d:"Receber uma cópia completa dos dados pessoais que a empresa armazena sobre você."},
  {t:"Correção de dados incompletos, inexatos ou desatualizados", d:"Pedir a atualização de informações erradas ou defasadas no seu cadastro."},
  {t:"Anonimização, bloqueio ou eliminação de dados desnecessários", d:"Solicitar a remoção de dados excessivos, ou tratados fora do que a lei permite."},
  {t:"Portabilidade dos dados", d:"Pedir que seus dados sejam transferidos a outro fornecedor de produto ou serviço, em formato estruturado."},
  {t:"Eliminação dos dados tratados com consentimento", d:"Solicitar a exclusão definitiva de dados que você forneceu mediante consentimento."},
  {t:"Informação sobre compartilhamento", d:"Saber com quais empresas ou órgãos públicos seus dados foram compartilhados."},
  {t:"Informação sobre a possibilidade de não consentir", d:"Ser informado, antes de aceitar, sobre as consequências de não fornecer o consentimento."},
  {t:"Revogação do consentimento", d:"Retirar, a qualquer momento, um consentimento dado anteriormente — de forma tão simples quanto foi concedê-lo."}
];
const grid = document.getElementById('rights-grid');
rights.forEach((r,i)=>{
  const card = document.createElement('div');
  card.className = 'right-card';
  card.innerHTML = `
    <button type="button">
      <span class="idx mono">${pad(i+1)}</span>
      <span class="ttl">${r.t}</span>
      <span class="chev">▶</span>
    </button>
    <div class="body"><p>${r.d}</p></div>
  `;
  card.querySelector('button').addEventListener('click', ()=>{
    card.classList.toggle('open');
  });
  grid.appendChild(card);
});

// ---------- CHECKLIST (com persistência local) ----------
const checklistItems = [
  "Revisar permissões de localização dos apps instalados (usar 'somente ao usar o app')",
  "Desativar rastreamento entre apps nas configurações do celular",
  "Recusar cookies não essenciais em sites quando possível",
  "Revisar e remover permissões de microfone e câmera de apps que não precisam delas",
  "Usar autenticação em duas etapas nas contas principais",
  "Verificar periodicamente se seu e-mail aparece em vazamentos conhecidos"
];
const STORAGE_KEY = 'privacidade-checklist-v1';
const checklistEl = document.getElementById('checklist');
const progressEl = document.getElementById('checklist-progress');
const resetBtn = document.getElementById('checklist-reset');

// storage é opcional: se o navegador bloquear localStorage (modo privado restrito,
// política de terceiros etc.), o checklist continua funcionando só sem persistir.
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  }catch(e){ return {}; }
}
function saveState(state){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
  catch(e){ return false; }
}
let state = loadState();
let storageAvailable = true;

function updateProgress(){
  const done = checklistEl.querySelectorAll('.check-item.done').length;
  const savedTag = storageAvailable ? '<span class="saved-tag">· salvo neste navegador</span>' : '';
  progressEl.innerHTML = `${done} / ${checklistItems.length} concluídos ${savedTag}`;
}

checklistItems.forEach((txt,i)=>{
  const item = document.createElement('div');
  item.className = 'check-item' + (state[i] ? ' done' : '');
  item.innerHTML = `<div class="box"></div><div class="txt">${txt}</div>`;
  item.addEventListener('click', ()=>{
    item.classList.toggle('done');
    state[i] = item.classList.contains('done');
    storageAvailable = saveState(state);
    updateProgress();
  });
  checklistEl.appendChild(item);
});
updateProgress();

resetBtn.addEventListener('click', ()=>{
  state = {};
  storageAvailable = saveState(state);
  checklistEl.querySelectorAll('.check-item').forEach(el=>el.classList.remove('done'));
  updateProgress();
});