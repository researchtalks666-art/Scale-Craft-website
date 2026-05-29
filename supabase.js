const SUPABASE_URL = 'https://treeikfjmtjrldupgxgr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_0DqP93YMwNSqvggBNqemsg_1XqukVwr';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ── Connection test (runs once on load) ──
(async function testSupabaseConnection() {
try {
    const { error } = await _supabase.from('contact_submissions').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
        console.warn('⚠️ Supabase connection issue:', error.message);
      } else {
        console.log('✅ Supabase connected successfully');
      }
    } catch (e) {
        console.error('❌ Supabase connection failed:', e.message);
    }
  })();

  // ── Email Validation ──
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

// ── Contact Form Submission ──
async function submitContactForm() {
  // ── Honeypot check ──
  const honeypot = document.getElementById('cf-honeypot').value;
  if (honeypot) return;

  const nameEl    = document.getElementById('cf-name');
  const emailEl   = document.getElementById('cf-email');
  const phoneEl   = document.getElementById('cf-phone');
  const messageEl = document.getElementById('cf-message');
  const emailErr  = document.getElementById('cf-email-error');
  const btn       = document.getElementById('cf-submit-btn');

  const name    = nameEl.value.trim();
  const email   = emailEl.value.trim();
  const phone   = phoneEl.value.trim();
  const message = messageEl.value.trim();
  const service = document.querySelector('input[name="service"]:checked');
  const selectedService = service ? service.closest('label').querySelector('span').textContent : null;

  // Reset error state
  emailErr.style.display = 'none';
  emailEl.style.borderColor = '';

  // ── Validation ──
  if (!name) { nameEl.focus(); nameEl.style.borderColor = '#f87171'; return; } else { nameEl.style.borderColor = ''; }
  if (!email || !isValidEmail(email)) {
    emailEl.style.borderColor = '#f87171';
    emailEl.style.boxShadow = '0 0 0 2px rgba(248,113,113,0.2)';
    emailErr.style.display = 'block';
    emailEl.focus();
    return;
  }
  if (!message) { messageEl.focus(); messageEl.style.borderColor = '#f87171'; return; } else { messageEl.style.borderColor = ''; }

  // ── Submit to Supabase ──
  btn.disabled = true;
  btn.textContent = 'Sending…';

  try {
    const { error } = await _supabase.from('contact_submissions').insert([{
      name,
      email,
      phone: phone || null,
      message,
      service: selectedService || null,
    }]);

    if (error) throw error;

    // ── Success ──
    btn.textContent = '✓ Sent!';
    btn.style.background = '#22c55e';
    nameEl.value = '';
    emailEl.value = '';
    phoneEl.value = '';
    messageEl.value = '';
    if (service) service.checked = false;

    setTimeout(() => {
      closeDialog();
      btn.textContent = 'Send Message';
      btn.style.background = '';
      btn.disabled = false;
    }, 1800);

  } catch (err) {
    console.error('Supabase error:', err);
    btn.textContent = 'Failed – Try Again';
    btn.style.background = '#f87171';
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      btn.disabled = false;
    }, 2500);
  }
}