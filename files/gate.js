// مكتبة فريقي: بوابة الإيميل، والمكتبة تنفتح من رابط يوصل على الإيميل.
// ١. الزائر يكتب إيميله، وينحفظ بنموذج قوقل «مكتبة فريقي» بحساب fareeqi.ai@gmail.com.
// ٢. سكربت قوقل يرسل له رابط خاص فيه (?t=رمز).
// ٣. لما يفتح الرابط، الصفحة تتأكد من الرمز عند السكربت، وتنفتح المكتبة وينكتب «مؤكد» بالجدول.
(function () {
  var FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdD088iEZYi31XifK8JWqug-o6LqwnleUKbikT0UbwXwuzHmA/formResponse';
  var F_EMAIL = 'entry.1238426203';   // الإيميل
  var F_SOURCE = 'entry.922652765';   // المصدر
  // رابط سكربت قوقل بعد النشر (ينتهي بـ /exec). إذا فاضي، المكتبة تنفتح مباشرة بعد التسجيل بدون تأكيد.
  var VERIFY_URL = 'https://script.google.com/macros/s/AKfycbznDD4NAEsGhMUDtyZ4ZUtOvkzSQ76akIx_h_KDz7nSqLUcUQwBia0vYWFI7S6-VFZ35A/exec';
  var KEY = 'fareeqi_ok';
  var RESEND_WAIT = 60; // ثواني قبل ما يقدر يطلب الرابط مرة ثانية

  var params; try { params = new URLSearchParams(location.search); } catch (e) { params = { get: function () { return null; } }; }
  var token = params.get('t');

  function isOpen() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  if (isOpen() && !token) return;

  function source() {
    var src = params.get('src') || '';
    var parts = location.pathname.split('/').filter(function (p) {
      return p && p !== 'fareeqi.ai' && p !== 'index.html';
    });
    var page = parts.length ? parts[parts.length - 1] : 'الرئيسية';
    return src ? src + ' | ' + page : page;
  }

  function cleanUrl() {
    try {
      params.delete('t');
      var q = params.toString();
      history.replaceState(null, '', location.pathname + (q ? '?' + q : '') + location.hash);
    } catch (e) {}
  }

  var css = '#fq-gate{position:fixed;inset:0;z-index:99;background:rgba(14,18,48,.72);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Alexandria,system-ui,sans-serif}' +
    '#fq-gate .box{position:relative;background:#fff;border-radius:24px;max-width:420px;width:100%;padding:26px 22px;text-align:center;direction:rtl;box-shadow:0 20px 60px rgba(0,0,0,.3)}' +
    '#fq-gate img{width:64px;height:64px;border-radius:50%;margin-bottom:6px}' +
    '#fq-gate h2{margin:0 0 6px;font-size:24px;font-weight:900;color:#0E1230}#fq-gate p{margin:0 0 14px;color:#5B638A;line-height:1.7}' +
    '#fq-gate label{display:block;text-align:right;font-size:14px;font-weight:700;color:#0E1230;margin:10px 2px 2px}' +
    '#fq-gate input{width:100%;box-sizing:border-box;font:inherit;font-size:17px;padding:13px 14px;margin:4px 0;border:1.5px solid #DCE2FA;border-radius:14px;outline:none;text-align:left}' +
    '#fq-gate input:focus{border-color:#2346FF}' +
    '#fq-gate button{width:100%;margin-top:12px;font:inherit;font-weight:800;font-size:18px;padding:13px;border:0;border-radius:14px;background:#2346FF;color:#fff;cursor:pointer}' +
    '#fq-gate button.alt{background:#EEF1FF;color:#2346FF;font-size:16px}' +
    '#fq-gate button[disabled]{opacity:.6;cursor:default}' +
    '#fq-gate .hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}' +
    '#fq-gate .mail{display:inline-block;direction:ltr;font-weight:800;color:#0E1230;background:#F4F6FF;border-radius:10px;padding:4px 12px;margin:2px 0 10px;word-break:break-all}' +
    '#fq-gate .tip{font-size:14px;background:#FFF8DC;border-radius:12px;padding:10px 12px;color:#5B4A00}' +
    '#fq-gate small{display:block;margin-top:10px;color:#8A90B0;font-size:12px}#fq-gate .err{color:#C0392B;min-height:22px;font-size:14px;margin-top:6px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var logo = (document.querySelector('link[rel="icon"]') || {}).href || '';
  var logoHtml = logo ? '<img src="' + logo + '" alt="فريقي">' : '';
  var d = document.createElement('div'); d.id = 'fq-gate';
  d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
  document.body.appendChild(d);
  document.documentElement.style.overflow = 'hidden';

  var lastEmail = '';

  function unlock() {
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
    document.documentElement.style.overflow = '';
    d.remove();
  }

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); }

  // الشاشة الأولى: الإيميل
  function showForm(note) {
    d.innerHTML = '<form class="box" novalidate>' + logoHtml +
      '<h2>افتح مكتبة فريقي</h2><p>اكتب ايميلك لكي نرسلك رابط المكتبه</p>' +
      '<label for="fq-email">الإيميل</label>' +
      '<input id="fq-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="name@gmail.com" dir="ltr" required>' +
      '<input name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<div class="err" aria-live="polite"></div><button type="submit">أرسل لي الرابط</button></form>';
    var f = d.querySelector('form'), err = d.querySelector('.err'), btn = f.querySelector('button');
    if (lastEmail) f.email.value = lastEmail;
    if (note) err.textContent = note;

    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      err.textContent = '';
      var email = f.email.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) { err.textContent = 'اكتب إيميل صحيح'; f.email.focus(); return; }
      lastEmail = email;

      if (f.website.value) { showSent(); return; } // خانة مخفية انعبت: بوت

      btn.disabled = true; btn.textContent = 'لحظة…';
      send(email, function () {
        if (!VERIFY_URL) { unlock(); return; } // السكربت مو جاهز للحين: نفتح مباشرة
        showSent();
      });
    });
  }

  function send(email, then) {
    var body = new URLSearchParams();
    body.append(F_EMAIL, email);
    body.append(F_SOURCE, source());
    var done = false;
    function finish() { if (!done) { done = true; then(); } }
    fetch(FORM_URL, { method: 'POST', mode: 'no-cors', body: body }).then(finish, finish);
    setTimeout(finish, 5000);
  }

  // الشاشة الثانية: شيك إيميلك
  function showSent() {
    d.innerHTML = '<div class="box">' + logoHtml +
      '<h2>شيك إيميلك</h2><p>دزينا رابط المكتبة على:</p><div class="mail">' + esc(lastEmail) + '</div>' +
      '<p class="tip">إذا ما لقيته خلال دقيقة، شيك مجلد السبام أو العروض الترويجية.</p>' +
      '<button type="button" class="alt" data-act="resend" disabled>ما وصلني، أرسل مرة ثانية</button>' +
      '<button type="button" class="alt" data-act="edit">غلطت بالإيميل</button>' +
      '<div class="err" aria-live="polite"></div></div>';
    var resend = d.querySelector('[data-act=resend]'), edit = d.querySelector('[data-act=edit]'), err = d.querySelector('.err');
    var left = RESEND_WAIT;
    var label = 'ما وصلني، أرسل مرة ثانية';
    resend.textContent = label + ' (' + left + ')';
    var timer = setInterval(function () {
      left--;
      if (left <= 0) { clearInterval(timer); resend.disabled = false; resend.textContent = label; }
      else resend.textContent = label + ' (' + left + ')';
    }, 1000);
    resend.addEventListener('click', function () {
      resend.disabled = true; resend.textContent = 'لحظة…';
      send(lastEmail, function () {
        err.style.color = '#1E7B3A'; err.textContent = 'انرسل مرة ثانية';
        setTimeout(showSent, 1500);
      });
    });
    edit.addEventListener('click', function () { clearInterval(timer); showForm(); });
  }

  // جاي من رابط الإيميل: نتأكد من الرمز
  function verify(t) {
    d.innerHTML = '<div class="box">' + logoHtml + '<h2>لحظة…</h2><p>نفتح لك المكتبة</p></div>';
    var done = false;
    function fail() {
      if (done) return; done = true;
      cleanUrl();
      if (isOpen()) { unlock(); return; }
      showForm('الرابط مو صحيح أو قديم. سجل مرة ثانية ونرسل لك رابط جديد.');
    }
    fetch(VERIFY_URL + '?t=' + encodeURIComponent(t))
      .then(function (r) { return r.json(); })
      .then(function (res) { if (done) return; done = true; cleanUrl(); if (res && res.ok) unlock(); else { done = false; fail(); } })
      .catch(fail);
    setTimeout(fail, 12000);
  }

  if (token && VERIFY_URL && /^[a-f0-9]{32}$/.test(token)) verify(token);
  else if (token && isOpen()) { cleanUrl(); unlock(); }
  else showForm();
})();
