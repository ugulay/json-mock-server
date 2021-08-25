const jsonServer = require('json-server');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const server = jsonServer.create();
const middlewares = jsonServer.defaults();

const router = jsonServer.router(path.join(__dirname, 'db.json'));
const adminsDB = JSON.parse(fs.readFileSync(
  path.join(__dirname, 'admins.json'), 'UTF-8'),
);

const port = process.env.PORT || 3080;
const SECRET_KEY = '123456789';
const expiresIn = '1h';

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);


// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
// server.use(jsonServer.bodyParser)


server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());


// Create Token
function createToken(payload) {
  jwt.sign(payload, SECRET_KEY, { expiresIn });
}


// Verify the token
function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY, (err, decode) => {
    return (decode !== undefined ? decode : err);
  });
}


// Check if the user exists in database
function isAuthenticated({ username, password }) {
  return adminsDB.users.findIndex((user) => {
    return (user.username === username) && (user.password === password) !== -1;
  });
}


// Check Request header for Bearer
function checkHeader({ header }) {
  if (header.authorization === undefined) return false;
  if (header.authorization.split(' ')[0] !== 'Bearer') {
    return false;
  }
  return true;
}


// JWT Login
server.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (isAuthenticated({ username, password }) === false) {
    const status = 401;
    const message = 'Incorrect username or password';
    res.status(status).json({ status: false, msg: message });
    return;
  }
  const accessToken = createToken({
    username,
  });
  res.status(200).json({ status: true, token: accessToken });
});


// Refresh token
server.post('/auth/refresh', async (req, res) => {
  if (!checkHeader({ header: req.headers })) {
    return res.status(401).send('token needed');
  }
  try {
    verifyToken(req.headers.authorization.split(' ')[1]);
    const accessToken = createToken({ username });

    return res.status(200).json({ status: true, token: accessToken });
  } catch (err) {
    return res.status(401).send('');
  }
});


// Check current token
server.post('/auth/check', async (req, res) => {
  if (!checkHeader({ header: req.headers })) {
    return res.status(401).send('token needed');
  }

  try {
    verifyToken(req.headers.authorization.split(' ')[1]);

    return res.status(200).send('');
  } catch (err) {
    return res.status(401).send('');
  }
});


server.use(/^(?!\/auth).*$/, (req, res, next) => {
  if (!checkHeader({ header: req.headers })) {
    return res.status(401).send('token needed');
  }
  try {
    verifyToken(req.headers.authorization.split(' ')[1]);
    next();
  } catch (err) {
    const status = 401;
    const message = 'Error: access_token is not valid';
    res.status(status).json({ status: false, msg: message });
  }
});


// Use default router
server.use(router);


server.listen(port, () => {
  console.log(`JSON Server is running at : ${port}`);
});
