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

// Reusable HTML shell with Bootstrap 5
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
    :root { --bg:#0f172a; --panel:#0b1220; --ink:#e2e8f0; --muted:#94a3b8; --accent:#60a5fa; }
    body { background: var(--bg); color: var(--ink); }
    .navbar { background: var(--panel); }
    .brand { color: var(--ink); }
    .brand .accent { color: var(--accent); }
    .sidebar { min-height: 100vh; background: var(--panel); }
    .sidebar a { color: var(--muted); text-decoration: none; display: block; padding: .75rem 1rem; border-radius: .5rem; }
    .sidebar a.active, .sidebar a:hover { background: #111827; color: var(--ink); }
    .card { background: #111827; border: 0; box-shadow: 0 8px 28px rgba(0,0,0,.24); }
    .credit { background: var(--panel); color: #9aa9c0; }
    .meta { color: #9aa9c0; }
    .badge-soft { background: rgba(96,165,250,.15); color: var(--accent); border: 1px solid rgba(96,165,250,.35); }
  </style>
</head>
<body>
  <nav class="navbar navbar-expand px-3">
    <div class="container-fluid">
      <span class="navbar-brand brand"><span class="accent">Company</span> Portal</span>
      <div class="d-flex align-items-center gap-2">
        ${showLogout ? '<a class="btn btn-outline-light btn-sm" href="/logout">Logout</a>' : ''}
      </div>
    </div>
  </nav>
  ${bodyHtml}
  <footer class="credit text-center py-2 mt-4">
    Challenge by Manish — Product Security Engineer
  </footer>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
</body>
</html>`;
}

// Build an official-looking report for a given id
function reportFor(id) {
  const u = users[id];
  const p = profiles[id];
  if (!u || !p) return null;

  // Base content for employees
  const base = `
    <div class="d-flex align-items-center justify-content-between">
      <h5 class="mb-0">Performance Review — ${p.period}</h5>
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
      <li>Service reliability metrics (latency/error budget) within SLO targets for owned services.</li>
      <li>Security hygiene: dependencies patched and secrets scanning violations remediated.</li>
    </ul>

    <h6 class="text-uppercase text-secondary mt-4">Goals and Development</h6>
    <ul class="mb-0">
      <li>Deepen system design skills and lead one cross‑team initiative next period.</li>
      <li>Expand automated testing for critical paths and reduce flaky tests by 30%.</li>
      <li>Mentor a junior engineer through a full feature lifecycle.</li>
    </ul>
  `;

  // CEO content is richer and includes the flag
  if (id === 1000) {
    return `
      ${base.replace('Performance Review', 'Executive Performance Report')}
      <hr class="border-secondary" />
      <h6 class="text-uppercase text-secondary">Company Outlook</h6>
      <p class="mb-2">Revenue growth is tracking above guidance with disciplined cost control and healthy free cash flow.</p>
      <p class="mb-2">Focus areas: platform reliability, security posture, and product differentiation in core verticals.</p>
      <p class="mb-2">Risk posture remains manageable with contingency plans for macro and supply chain variability.</p>

      <h6 class="text-uppercase text-secondary mt-4">Strategy Highlights</h6>
      <ul class="mb-2">
        <li>Accelerate AI‑assisted workflows across product lines and developer experience.</li>
        <li>Strengthen partnerships and ecosystem integrations to drive adoption.</li>
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
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card p-4">
          <h4 class="mb-3">Sign in</h4>
          <form method="POST" action="/login" autocomplete="off" novalidate>
            <div class="mb-3">
              <label class="form-label">Employee ID</label>
              <input type="text" name="userId" class="form-control" placeholder="Employee ID" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input type="password" name="password" class="form-control" placeholder="Password" required>
            </div>
            <button type="submit" class="btn btn-primary w-100">Login</button>
          </form>
        </div>
      </div>
    </div>
  </div>`;
  res.send(page('Login • Company Portal', body, false));
});

app.post('/login', (req, res) => {
  const userId = parseInt(req.body.userId, 10);
  const password = String(req.body.password || '');
  const user = users[userId];

  if (!user || !user.pass || user.pass !== password) {
    return res.status(401).send(page('Login Failed', `
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-5">
            <div class="card p-4">
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

// VULNERABLE endpoint: only checks that someone is logged in; does NOT enforce ownership of id
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
            <div class="card p-4">
              ${report ? report : '<h5>Document not found.</h5>'}
            </div>
          </div>
          <div class="col-12 col-xl-4">
            <div class="card p-4 mb-4">
              <h6 class="text-uppercase text-secondary">Announcements</h6>
              <p class="mb-2">Quarterly reviews will close next Friday.</p>
              <p class="mb-0">Remember to submit training attestations by month end.</p>
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
