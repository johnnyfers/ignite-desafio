const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers
  const user = users.find(user => user.username === username)

  if (!user) return res.status(404).json({ error: 'user not found' })

  req.user = user

  return next()

}

app.post('/users', (req, res) => {
  const { name, username } = req.body
  const id = uuidv4()

  const userExists = users.some((user) => user.username === username)

  if (userExists) return res.status(400).json({ error: 'User already exists' })

  const user = {
    id,
    name,
    username,
    todos: []
  }

  users.push(user)

  res.status(201).json(user).header('username', username)

});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req

  return res.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body
  const { user } = req
  const id = uuidv4()


  const todo = {
    id,
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date(),
  }

  user.todos.push(todo)

  return res.status(201).json(todo)


});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body
  const { user } = req
  const { id } = req.params

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {
    return res.status(404).json({ error: 'Not Found' })
  }

  todo.title = title
  todo.deadline = new Date(deadline)


  return res.status(201).json(todo)


});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const { user } = req
  const { id } = req.params

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {
    return res.status(404).json({ error: 'Not Found' })
  }

  todo.done = true

  return res.json(todo)

});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { user } = req
  const { id } = req.params

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Not Found' })
  }

  user.todos.splice(todoIndex, 1)

  return res.status(204).json()

});

module.exports = app;