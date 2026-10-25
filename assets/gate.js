// Password gate for the whole site. Loaded in each page's <head> so locked content never flashes on screen.
// GitHub Pages serves files as they are and can't check a password, so this only hides the page: anyone who
// reads the page source or the public GitHub repo can still see everything. It keeps an unfinished site out
// of view; it doesn't protect secrets.
//
// The password is in PASSWORD.txt (kept out of git). To change it, put the new one there and set HASH to:
//   python -c "import hashlib; print(hashlib.sha256(('maxhulker.com:' + open('PASSWORD.txt').read().strip()).encode()).hexdigest())"
// Changing it logs everyone out. Add ?logout to any page's address to lock it again in this browser.
(() => {
  const HASH = 'f4bfa173f88ce924a8889b8b438b0023f12bbf05c17b822e74e4191f1cdba2ee';
  const KEY = 'maxhulker.gate';
  const root = document.documentElement;
  try {
    if (new URLSearchParams(location.search).has('logout')) localStorage.removeItem(KEY);
    if (localStorage.getItem(KEY) === HASH) return;
  } catch {}
  root.dataset.locked = '';

  const hash = async pw => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('maxhulker.com:' + pw)))]
    .map(b => b.toString(16).padStart(2, '0')).join('');

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('gate');
    if (!form) return;
    const input = form.querySelector('input[type=password]'), err = form.querySelector('.gate-err');
    const hint = input.placeholder;
    input.addEventListener('input', () => { input.removeAttribute('aria-invalid'); input.placeholder = hint; err.textContent = ''; });
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (await hash(input.value) !== HASH) {
        input.value = ''; input.placeholder = 'wrong, try again'; input.setAttribute('aria-invalid', 'true');
        err.textContent = 'Wrong password.';
        input.focus();
        return;
      }
      try { localStorage.setItem(KEY, HASH); } catch {}
      delete root.dataset.locked;
      input.value = '';
    });
  });
})();
