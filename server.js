// server.js
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'FLAG{SET_THIS_IN_ENV}';

// Auth users (CEO not allowed to log in)
const users = {
  1336: { id: 1336, name: 'Priya Sharma', pass: 'pass1336' },
  1337: { id: 1337, name: 'Rohan Verma', pass: 'pass1337' },
  1338: { id: 1338, name: 'Neha Kulkarni', pass: 'pass1338' },
  1000: { id: 1000, name: 'Anand Kapoor' } // CEO has no password here
};

// Profile data for reports
const profiles = {
  1336: { dept: 'Engineering', role: 'Backend Developer', manager: 'A. Patel', period: 'FY2025 H1', rating: 'Exceeds Expectations' },
  1337: { dept: 'Engineering', role: 'Frontend Developer', manager: 'A. Patel', period: 'FY2025 H1', rating: 'Meets Expectations' },
  1338: { dept: 'Quality', role: 'SDET', manager: 'S. Rao', period: 'FY2025 H1', rating: 'Exceeds Expectations' },
  1000: { dept: 'Executive', role: 'Chief Executive Officer', manager: 'Board of Directors', period: 'FY2025 H1', rating: 'N/A' }
};

// Shared HTML shell with Bootstrap 5 and restored brand formatting
function page(title, bodyHtml, showLogout = true) {
  return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
  <style>
    :root{
      --brand-orange:#f36f21;
      --brand-blue:#0a5aa5;
      --bg:#0f172a;
      --panel:#0b1220;
      --ink:#e6e9ef;
      --ink-strong:#f6f7fb;
      --muted:#cbd5e1;
    }

    html, body { height: 100%; }
    body { min-height:100vh; display:flex; flex-direction:column; background:var(--bg); color:var(--ink); }
    .main { flex:1; display:flex; flex-direction:column; }

    .navbar { background: var(--panel); }
    /* RESTORED brand formatting */
    .brand { color: var(--ink); letter-spacing: .2px; }
    .brand .accent { color: var(--brand-blue); } /* earlier accent color */
    .brand .accent-orange { color: var(--brand-orange); } /* optional alt accent */

    /* Event header with split gradient */
    .grad-split {
      background: linear-gradient(90deg, var(--brand-orange) 0 50%, var(--brand-blue) 50% 100%);
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent; color: transparent;
    }

    .hero { text-align:center; padding: 28px 16px 8px; }
    .hero .event { font-weight: 800; font-size: clamp(26px, 3.2vw, 38px); line-height: 1.25; }
    .hero .host { margin-top: 6px; font-weight: 600; font-size: clamp(16px, 1.6vw, 18px); }
    .hero .mark{
      display:inline-flex; align-items:center; gap:10px;
      margin-top:14px; padding:6px 12px; border-radius:999px;
      background:linear-gradient(90deg, rgba(243,111,33,.15), rgba(10,90,165,.15));
      border:1px solid rgba(243,111,33,.25); color: var(--ink);
    }
    .hero .dot{width:10px;height:10px;border-radius:50%;background:var(--brand-orange);box-shadow:0 0 0 3px rgba(243,111,33,.25);}

    .login-wrap { padding-bottom: 12px; }
    .login-card{ background:#111827; border:0; box-shadow:0 12px 36px rgba(0,0,0,.30); }
    .login-card h4{ color:var(--ink-strong)!important; }
    .login-card .form-label{ color:var(--ink-strong)!important; margin-bottom:.35rem; }
    .login-card .form-control{ background:#fff; color:#0f172a; padding:.85rem 1rem; font-size:1.05rem; }
    .login-card .form-control::placeholder{ color:#64748b; }
    .btn-primary{
      background: linear-gradient(90deg, var(--brand-orange), var(--brand-blue));
      border:0; box-shadow:0 6px 18px rgba(10,90,165,.35);
    }
    .btn-primary:hover{ filter:brightness(1.03); }

    .sidebar{ min-height: 100vh; background: var(--panel); }
    .sidebar a{ color:#a3b2c6; text-decoration:none; display:block; padding:.7rem 1rem; border-radius:.5rem; }
    .sidebar a.active, .sidebar a:hover{ background:#111827; color:var(--ink-strong); }
    .card{ background:#111827; border:0; box-shadow:0 8px 28px rgba(0,0,0,.24); }
    .card h5, .card h6, .card p, .card li, .card div, .card span { color: var(--ink-strong); }
    .meta{ color: var(--muted) !important; }
    .text-secondary{ color: var(--muted) !important; }
    .badge-soft { background: rgba(10,90,165,.12); color: var(--brand-blue); border:1px solid rgba(10,90,165,.35); }

    footer.credit{ background: var(--panel); color:#9aa9c0; }
  </style>
</head>
<body>
 <nav class="navbar navbar-expand">
  <div class="container-fluid py-2 px-3">
    <span class="navbar-brand brand m-0 fw-semibold">
      <span class="accent">Company</span> Portal
    </span>
    <div class="ms-auto">
      ${showLogout ? '<a class="btn btn-outline-light btn-sm" href="/logout">Logout</a>' : ''}
    </div>
  </div>
</nav>

  <main class="main">
    ${bodyHtml}
  </main>

  <footer class="credit text-center py-2">© Manish Kale — Product Security Engineer</footer>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
</body>
</html>`;
}

function reportFor(id) {
  const u = users[id], p = profiles[id];
  if (!u || !p) return null;

  const base = `
    <div class="d-flex align-items-center justify-content-between">
      <h5 class="mb-0">${id === 1000 ? 'Executive Performance Report' : 'Performance Review'} — ${p.period}</h5>
      <span class="badge badge-soft">${p.rating}</span>
    </div>
    <hr class="border-secondary" />
    <div class="row g-3 meta">
      <div class="col-md-6"><strong>Name:</strong> ${u.name}</div>
      <div class="col-md-6"><strong>Employee ID:</strong> ${id}</div>
      <div class="col-md-6"><strong>Department:</strong> ${p.dept}</div>
      <div class="col-md-6"><strong>Role:</strong> ${p.role}</div>
      <div class="col-md-6"><strong>Manager:</strong> ${p.manager}</div>
      <div class="col-md-6"><strong>Review Period:</strong> ${p.period}</div>
    </div>
    <hr class="border-secondary" />

    <h6 class="text-uppercase text-secondary">Summary</h6>
    <p class="mb-2">Demonstrated consistent ownership of assigned scope with clear communication and timely delivery across sprints.</p>
    <p class="mb-2">Participated in code reviews with actionable feedback and adherence to team standards and quality benchmarks.</p>
    <p class="mb-2">Showed resilience under pressure during release stabilization and handled production hygiene tasks responsibly.</p>
    <p class="mb-2">Collaborated effectively with cross‑functional stakeholders, enabling predictable planning and execution.</p>

    <h6 class="text-uppercase text-secondary mt-4">Key Performance Indicators</h6>
    <ul class="mb-2">
      <li>Throughput and on‑time delivery improved relative to the previous period.</li>
      <li>Defect density within acceptable thresholds; regression escape rate trending down.</li>
      <li>Service reliability metrics remain within SLO targets for owned services.</li>
      <li>Security hygiene: dependencies patched and secrets scanning violations remediated.</li>
    </ul>

    <h6 class="text-uppercase text-secondary mt-4">Goals and Development</h6>
    <ul class="mb-0">
      <li>Lead one cross‑team initiative with clear success metrics.</li>
      <li>Expand automated tests for critical paths and reduce flaky tests by 30%.</li>
      <li>Mentor a junior engineer through a full feature lifecycle.</li>
    </ul>
  `;
  if (id === 1000) {
    return `
      ${base}
      <hr class="border-secondary" />
      <h6 class="text-uppercase text-secondary">Company Outlook</h6>
      <p class="mb-2">Revenue growth is tracking above guidance with disciplined cost control and strong free cash flow.</p>
      <p class="mb-2">Priority areas: platform reliability, security posture, and product differentiation in core verticals.</p>
      <p class="mb-2">Risk posture remains manageable with contingency plans for macro and supply chain variability.</p>
      <h6 class="text-uppercase text-secondary mt-4">Strategy Highlights</h6>
      <ul class="mb-2">
        <li>Accelerate AI‑assisted workflows across product lines and developer experience.</li>
        <li>Strengthen partner ecosystem integrations to drive adoption.</li>
        <li>Invest in talent density and leadership succession across critical functions.</li>
      </ul>
      <div class="alert alert-primary mt-4" role="alert">
        Confidential Addendum — Flag: <strong>${FLAG}</strong>
      </div>
    `;
  }
  return base;
}

// Routes
app.get('/', (req, res) => {
  const body = `
  <section class="hero container">
    <div class="event grad-split">October Cyber Month — 2025</div>
    <div class="host grad-split">Hosted by EvDevSec Team</div>
    <div class="mark"><span class="dot"></span><span>Secure Coding Challenge</span></div>
  </section>

  <section class="container login-wrap">
    <div class="row justify-content-center">
      <div class="col-12 col-md-7 col-lg-6">
        <div class="card p-4 login-card">
          <h4 class="mb-3">Sign in</h4>
          <form method="POST" action="/login" autocomplete="off" novalidate>
            <div class="mb-3">
              <label class="form-label">Employee ID</label>
              <input type="text" name="userId" class="form-control" placeholder="Employee ID" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <div class="input-group">
                <input type="password" name="password" id="password" class="form-control" placeholder="Password" required>
                <button class="btn btn-outline-secondary" type="button" id="togglePass" aria-label="Show password">
                  <svg id="eyeIcon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8"/>
                    <path d="M8 5.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5"/>
                  </svg>
                </button>
              </div>
            </div>
            <button type="submit" class="btn btn-primary w-100 py-2 fs-5">Login</button>
          </form>
        </div>
      </div>
    </div>
  </section>

  <script>
    (function(){
      const pwd=document.getElementById('password');
      const btn=document.getElementById('togglePass');
      const icon=document.getElementById('eyeIcon');
      if(btn&&pwd&&icon){
        btn.addEventListener('click',()=>{
          const showing=pwd.type==='text';
          pwd.type=showing?'password':'text';
          icon.style.opacity=showing?'1':'0.7';
        });
      }
    })();
  </script>`;
  res.send(page('Login • Company Portal', body, false));
});

app.post('/login', (req, res) => {
  const userId = parseInt(req.body.userId, 10);
  const password = String(req.body.password || '');
  const user = users[userId];

  if (!user || !user.pass || user.pass !== password) {
    return res.status(401).send(page('Login Failed', `
      <div class="container py-4">
        <div class="row justify-content-center">
          <div class="col-12 col-md-7 col-lg-6">
            <div class="card p-4 login-card">
              <h5 class="text-danger">Invalid credentials</h5>
              <a href="/" class="btn btn-secondary mt-3">Back to login</a>
            </div>
          </div>
        </div>
      </div>`, false));
  }

  res.cookie('uid', String(userId), { httpOnly: false, sameSite: 'Lax' });
  return res.redirect(`/documents?id=${userId}`);
});

app.get('/logout', (req, res) => {
  res.clearCookie('uid');
  res.redirect('/');
});

// VULNERABLE: checks only "logged in", not ownership of requested id
app.get('/documents', (req, res) => {
  const uid = req.cookies.uid;
  if (!uid) return res.redirect('/');

  const requestedId = parseInt(req.query.id, 10);
  const report = reportFor(requestedId);

  const signedInName = users[uid]?.name || `user-${uid}`;
  const body = `
  <div class="container-fluid">
    <div class="row">
      <aside class="col-12 col-md-3 col-xl-2 sidebar p-3">
        <div class="mb-2 text-uppercase small meta">Signed in as</div>
        <div class="h5 mb-4">${signedInName}</div>
        <a class="active" href="/documents?id=${uid}">My Review</a>
        <a href="#">Dashboard</a>
        <a href="#">Teams</a>
        <a href="#">Projects</a>
        <a href="#">Settings</a>
      </aside>
      <main class="col-12 col-md-9 col-xl-10 p-4">
        <div class="row g-4">
          <div class="col-12 col-xl-8">
            <div class="card p-4 p-md-5">
              ${report ? report : '<h5>Document not found.</h5>'}
            </div>
          </div>
          <div class="col-12 col-xl-4">
            <div class="card p-4 mb-4">
              <h6 class="text-uppercase text-secondary">Announcements</h6>
              <p class="mb-2">Quarterly reviews will close next Friday.</p>
              <p class="mb-0">Submit training attestations by month end.</p>
            </div>
            <div class="card p-4">
              <h6 class="text-uppercase text-secondary">Quick Links</h6>
              <ul class="mb-0">
                <li class="mb-2"><a href="#" class="link-primary text-decoration-none">HR Policies</a></li>
                <li class="mb-2"><a href="#" class="link-primary text-decoration-none">Time Off</a></li>
                <li class="mb-2"><a href="#" class="link-primary text-decoration-none">Benefits</a></li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>`;
  res.send(page('Documents • Company Portal', body));
});

app.listen(PORT, () => {
  console.log(`IDOR CTF listening on ${PORT}`);
});
