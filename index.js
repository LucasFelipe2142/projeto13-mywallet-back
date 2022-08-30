import express from 'express';
import cors from 'cors';
import Joi from 'joi';

const schema = Joi.object().keys({
  name: Joi.string().min(1).required(),
});

const login = [
  {
    name: 'jorge',
  },
  {
    name: 'lucas',
  },
  {
    name: 'farlei',
  },
  {
    name: 'carine',
  },
];

const app = express();
app.use(express.json());
app.use(cors());

app.post('/participants', (req, res) => {
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
    login.push({...req.body, lastStatus: Date.now()});
    res.send(login);
  }
});

app.listen(5000);
