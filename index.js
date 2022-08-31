import express from 'express';
import cors from 'cors';
import Joi from 'joi';

const schema = Joi.object().keys({
  name: Joi.string().min(1).required(),
});

const schemaMessage = Joi.object().keys({
  to: Joi.string().min(1).required(),
  text: Joi.string().min(1).required(),
  type: Joi.string().valid('message', 'private_message'),

});

const login = [];

const messageAPI = [];

const app = express();
app.use(express.json());
app.use(cors());

app.post('/participants', (req, res) => {
  const data = new Date();
  const hora = data.getHours();
  const min = data.getMinutes();
  const seg = data.getSeconds();

  const result = schema.validate(req.body, Joi.messages);
  const ok = true;

  if (result.error) {
    res.send(result.error.details);
    ok = false;
  } else {
    for (let i = 0; i < login.length; i++) {
      if (req.body.name === login[i].name) {
        res.sendStatus(409);
        ok = false;
      }
    }
  }

  if (ok) {
    messageAPI.push({
      from: req.body.name,
      to: 'Todos',
      text: 'entra na sala...',
      type: 'status',
      time: hora + ':' + min + ':' + seg,
    });
    login.push({...req.body, lastStatus: Date.now()});
    res.sendStatus(201);
  }
});

app.get('/participants', (req, res) => {
  res.send(login);
});

app.get('/messages', (req, res) => {
  const data = new Date();
  const hora = data.getHours();
  const min = data.getMinutes();
  const seg = data.getSeconds();
  let aux = false;

  const result = schemaMessage.validate(req.body, Joi.messages);

  for (let i = 0; i < login.length; i++) {
    if (req.headers.user === login[i].name) {
      aux = true;
    }
  }

  if (result.error) {
    res.sendStatus(422);
  } else
  if (!aux) res.sendStatus(422);
  else {
    messageAPI.push({
      from: req.headers.user,
      to: req.body.to,
      text: req.body.text,
      type: req.body.type,
      time: hora + ':' + min + ':' + seg,
    });
    res.sendStatus(201);
  }
});

app.listen(5000);
