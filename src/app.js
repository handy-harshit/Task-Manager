require('./db/mongoose');

const express = require('express');

const indexRouter = require('./routers/indexRouter');
const userRouter = require('./routers/userRouter');
const taskRouter = require('./routers/taskRouter');

const app = express();

app.use(express.json());
app.use('/', indexRouter);
app.use('/users', userRouter);
app.use('/tasks', taskRouter);

module.exports = app;