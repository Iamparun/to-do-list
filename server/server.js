const PORT = process.env.PORT ?? 8000;
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const app = express();
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//
require('dotenv').config();
//

app.use(cors());
app.use(express.json());

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - Token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden - Invalid token' });
    }
    let users = req.params;
    
    if (users.userEmail === user.email) {
      next();
    }else if(req.body.user_email===user.email){
next()
    }else if(req.headers.email===user.email){
      next()
          } else {
      return res.status(403).json({ error: 'Forbidden - Invalid token' });
    }
  });
};

app.get('/todos/:userEmail', verifyToken, async (req, res) => {
  const { userEmail } = req.params;
  try {
    const todos = await pool.query('SELECT * FROM todo WHERE user_email = $1', [userEmail]);
    res.json(todos.rows);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/todos', verifyToken, async (req, res) => {
  const { user_email, title, progress, date } = req.body;
  const id = uuidv4();
  try {
    const newToDo = await pool.query(
      'INSERT INTO todo(id, user_email, title, progress, date) VALUES($1, $2, $3, $4, $5)',
      [id, user_email, title, progress, date]
    );
    res.json(newToDo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/todos/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { user_email, title, progress, date } = req.body;
  try {


    const editToDo = await pool.query(
      'UPDATE todo SET user_email = $1, title = $2, progress = $3, date = $4 WHERE id = $5;',
      [user_email, title, progress, date, id]
    );

    res.json(editToDo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/todos/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const deleteToDo = await pool.query('DELETE FROM todo WHERE id = $1;', [id]);
    res.json(deleteToDo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const signUp = await pool.query(`INSERT INTO users (email, hashed_password) VALUES($1, $2)`, [email, hashedPassword]);

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1hr', issuer: 'your-app-name' });

    res.json({ email, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (users.rows.length===0) return res.status(400).json({ error: 'User does not exist!' });

    const success = await bcrypt.compare(password, users.rows[0].hashed_password);

    if (success) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1hr', issuer: 'your-app-name' });
      res.json({ email: users.rows[0].email, token });
    } else {
      res.status(401).json({ error: 'Login failed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));








