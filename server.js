const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'FLAG{SET_THIS_IN_ENV}';

// Users and docs
const users = {
  1336: { id: 1336, name: 'user-1336' },
  1337: { id: 1337, name: 'user-1337' },
  1338: { id: 1338, name: 'user-1338' },
  1000: { id: 1000, name: 'ceo-1000' }
};

const documents = {
  1336: `Performance Review for user-1336: Great teamwork and delivery.`,
  1337: `Performance Review for user-1337: Solid performance across sprints.`,
  1338: `Performance Review for user-1338: Reliable contributor and code quality.`,
  1000: `Performance Review for CEO-1000: Confidential. ${FLAG}`
};

// Login page
app.get('/', (_req, res) => {
  res.send(`
    <h2>Internal Portal — Login</h2>
    <form method="POST" action="/login">
      <label>User ID:</label>
      <input name="userId" value="1337" />
      <button type="submit">Login</button>
    </form>
    <p>Available users: 1336, 1337, 1338; CEO: 1000</p>
    <p>After login, the portal redirects to /documents?id=&lt;your-id&gt;.</p>
  `);
});

// Fake login: sets uid cookie and redirects to "own" doc
app.post('/login', (req, res) => {
  const userId = parseInt(req.body.userId, 10);
  if (!users[userId]) {
    return res.status(401).send('Invalid user');
  }
  res.cookie('uid', String(userId), { httpOnly: false });
  return res.redirect(`/documents?id=${userId}`);
});

// VULNERABLE: checks only that someone is logged in, not ownership of id
app.get('/documents', (req, res) => {
  const uid = req.cookies.uid;
  if (!uid) {
    return res.status(401).send('Please login first at /.');
  }
  const id = parseInt(req.query.id, 10);
  if (!id) return res.status(400).send('Missing id parameter.');
  const doc = documents[id];
  if (!doc) return res.status(404).send('Document not found.');
  res.send(`
    <h3>Performance Review</h3>
    <p>${doc}</p>
    <p>Hint: This page uses the id query parameter.</p>
  `);
});

app.listen(PORT, () => {
  console.log(`IDOR CTF listening on ${PORT}`);
});
