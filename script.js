/* ====== Lightweight interactions: countdown, reveal, RSVP ====== */
const targetDate = new Date('2026-03-26T19:00:00+03:00');

const els = {
  days: document.getElementById('days'),
  hours: document.getElementById('hours'),
  minutes: document.getElementById('minutes'),
  seconds: document.getElementById('seconds'),
  message: document.getElementById('countdownMessage'),
  mapsButton: document.getElementById('mapsButton'),
  form: document.getElementById('rsvpForm'),
  toast: document.getElementById('toast'),
  whatsapp: document.getElementById('whatsappButton'),
  modal: document.getElementById('rsvpModal'),
  modalSummary: document.getElementById('modalSummary'),
};

function pad(v){return String(v).padStart(2,'0')}

function updateCountdown(){
  if(!els.days) return;
  const now = new Date();
  const diff = targetDate - now;
  if(diff <= 0){
    els.message.textContent = 'Etkinlik başladı';
    ['days','hours','minutes','seconds'].forEach(k=>els[k].textContent='00');
    return;
  }
  const s = Math.floor(diff/1000);
  const days = Math.floor(s/86400);
  const hours = Math.floor((s%86400)/3600);
  const mins = Math.floor((s%3600)/60);
  const secs = s%60;
  els.days.textContent = pad(days);
  els.hours.textContent = pad(hours);
  els.minutes.textContent = pad(mins);
  els.seconds.textContent = pad(secs);
}
updateCountdown();setInterval(updateCountdown,1000);

/* Reveal (soft) */
const observer = new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting) e.target.classList.add('visible')})},{threshold:0.18});
document.querySelectorAll('.reveal').forEach(n=>observer.observe(n));

/* Maps link */
const addressText = `Glory Wedding Venue De Luxe\nKüçükbakkalköy Mahallesi\nVedat Günyol Caddesi\nDefne Sokak No: 1\nFlora Residence\nAtaşehir / İSTANBUL`;
if(els.mapsButton) els.mapsButton.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`;

/* RSVP form (localStorage preserved) */
function getFormData(){
  if(!els.form) return {};
  const fd = new FormData(els.form);
  return {
    fullName:(fd.get('fullName')||'').toString().trim(),
    phone:(fd.get('phone')||'').toString().trim(),
    guests:fd.get('guests')||'1',
    status:fd.get('status')||'Geliyorum',
    note:(fd.get('note')||'').toString().trim(),
    createdAt:new Date().toISOString(),
  }
}

function saveEntry(entry){
  const arr = JSON.parse(localStorage.getItem('rsvpEntries')||'[]');
  arr.push(entry); localStorage.setItem('rsvpEntries',JSON.stringify(arr));
}

function showToast(text){
  if(!els.toast) return; els.toast.textContent = text; els.toast.classList.add('show'); els.toast.setAttribute('aria-hidden','false'); setTimeout(()=>{els.toast.classList.remove('show'); els.toast.setAttribute('aria-hidden','true')},3200);
}

function openModal(text){ if(!els.modal) return; els.modal.setAttribute('aria-hidden','false'); if(els.modalSummary) els.modalSummary.textContent = text; }
function closeModal(){ if(!els.modal) return; els.modal.setAttribute('aria-hidden','true'); }

document.addEventListener('click',(e)=>{
  if(e.target.matches('.modal-close')||e.target.matches('.modal-ok')) closeModal();
});
document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeModal(); });

if(els.form){
  els.form.addEventListener('submit',(ev)=>{
    ev.preventDefault();
    const data = getFormData();
    if(!data.fullName){ const f = els.form.querySelector('input[name="fullName"]'); if(f) f.focus(); return; }
    saveEntry(data);
    openModal(`${data.fullName} — ${data.status} — ${data.guests} kişi` + (data.note?` — Not: ${data.note}`:''));
    showToast('Bilgiler kaydedildi — teşekkürler.');
    els.form.reset();
  });
}

/* WhatsApp send */
if(els.whatsapp){ els.whatsapp.addEventListener('click',()=>{ const d=getFormData(); const msg = `Kına Davetiyesi RSVP\n\nAd Soyad: ${d.fullName||'-'}\nTelefon: ${d.phone||'-'}\nKişi Sayısı: ${d.guests||'-'}\nKatılım: ${d.status||'-'}\nNot: ${d.note||'-'}`; const enc=encodeURIComponent(msg); const isMobile=/Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent); const url=isMobile?`whatsapp://send?text=${enc}`:`https://web.whatsapp.com/send?text=${enc}`; window.open(url,'_blank','noreferrer'); }); }


