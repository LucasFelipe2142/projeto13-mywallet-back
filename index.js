import express from 'express';
import cors from 'cors';
import Joi from 'joi';

const schema = Joi.object().keys({
  name: Joi.string().min(1).required(),
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
    res.send(messageAPI);
  }
});

app.listen(5000);
