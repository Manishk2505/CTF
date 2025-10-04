// server.js
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'FLAG{SET_THIS_IN_ENV}';

// Whitelisted users for login (CEO not allowed to log in)
const users = {
  1336: { id: 1336, name: 'user-1336', pass: 'pass1336' },
  1337: { id: 1337, name: 'user-1337', pass: 'pass1337' },
  1338: { id: 1338, name: 'user-1338', pass: 'pass1338' },
  // CEO account exists only as a document owner, not a login
  1000: { id: 1000, name: 'ceo-1000' }
};

// In-memory “documents”
const documents = {
  1336: `Performance Review for user-1336: Great teamwork and delivery.`,
  1337: `Performance Review for user-1337: Solid performance across sprints.`,
  1338: `Performance Review for user-1338: Reliable contributor and code quality.`,
  1000: `Performance Review for CEO-1000: Confidential. ${FLAG}`
};

// Utility: HTML page shell with Bootstrap 5
function page(title, bodyHtml) {
  return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
  <style>
    body { background-color: #0f172a; } /* slate-900 */
    .nav-brand { color: #e2e8f0 !important; }
    .card { border: 0; box-shadow: 0 6px 24px rgba(0,0,0,.18); }
    .sidebar { min-height: 100vh; background: #0b1220; }
    .sidebar a { color: #94a3b8; text-decoration: none; display: block; padding: .75rem 1rem; border-radius: .5rem; }
    .sidebar a.active, .sidebar a:hover { background: #0f172a; color: #e2e8f0; }
    .brand-accent { color: #60a5fa; }
  </style>
</head>
<body>
  <nav class="navbar navbar-dark" style="background:#0b1220;">
    <div class="container-fluid">
      <span class="navbar-brand nav-brand">
        <span class="brand-accent">Company</span> Portal
      </span>
      <div>
        <a class="btn btn-outline-light btn-sm" href="/logout">Logout</a>
      </div>
    </div>
  </nav>
  ${bodyHtml}
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
</body>
</html>`;
}

// GET / — login page
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
              <input type="text" name="userId" class="form-control" placeholder="e.g. 1337" required>
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
  res.send(page('Login • Company Portal', body));
});

// POST /login — simple auth
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
      </div>`));
  }

  // Set a readable cookie (intentionally not httpOnly to keep the challenge simple)
  res.cookie('uid', String(userId), { httpOnly: false, sameSite: 'Lax' });
  return res.redirect(`/documents?id=${userId}`);
});

// GET /logout
app.get('/logout', (req, res) => {
  res.clearCookie('uid');
  res.redirect('/');
});

// GET /documents — VULNERABLE: only checks "logged in", not ownership of id
app.get('/documents', (req, res) => {
  const uid = req.cookies.uid;
  if (!uid) return res.redirect('/');

  const requestedId = parseInt(req.query.id, 10);
  const doc = documents[requestedId];

  const welcomeName = users[uid]?.name || `user-${uid}`;

  const body = `
  <div class="container-fluid">
    <div class="row">
      <div class="col-12 col-md-3 col-xl-2 sidebar p-3">
        <div class="mb-3 text-white-50">Signed in as</div>
        <div class="h5 text-white mb-4">${welcomeName}</div>
        <a class="active" href="/documents?id=${uid}">My Review</a>
        <a href="#">Dashboard</a>
        <a href="#">Teams</a>
        <a href="#">Projects</a>
        <a href="#">Settings</a>
      </div>
      <div class="col-12 col-md-9 col-xl-10 p-4">
        <div class="row g-4">
          <div class="col-12 col-xl-8">
            <div class="card p-4">
              <h5 class="mb-3">Performance Review</h5>
              <div>${doc ? doc : 'Document not found.'}</div>
            </div>
          </div>
          <div class="col-12 col-xl-4">
            <div class="card p-4 mb-4">
              <h6 class="text-muted">Quick Links</h6>
              <ul class="list-unstyled mb-0">
                <li class="mb-2"><a href="#" class="link-primary text-decoration-none">HR Policies</a></li>
                <li class="mb-2"><a href="#" class="link-primary text-decoration-none">Time Off</a></li>
                <li class="mb-2"><a href="#" class="link-primary text-decoration-none">Benefits</a></li>
              </ul>
            </div>
            <div class="card p-4">
              <h6 class="text-muted">Announcements</h6>
              <p class="mb-0">Welcome to the portal.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  res.send(page('Documents • Company Portal', body));
});

app.listen(PORT, () => {
  console.log(`IDOR CTF listening on ${PORT}`);
});

