import express from 'express';
import cors from 'cors';
import Joi from 'joi';
import { MongoClient } from 'mongodb';

const mongoClient = new MongoClient('mongodb://localhost:27017');

let db;

mongoClient.connect().then(() => {
	db = mongoClient.db('chatUol');
});

const schema = Joi.object().keys({
  name: Joi.string().min(1).required(),
});

const schemaMessage = Joi.object().keys({
  to: Joi.string().min(1).required(),
  text: Joi.string().min(1).required(),
  type: Joi.string().valid('message', 'private_message'),

});

const app = express();
app.use(express.json());
app.use(cors());

app.post('/participants', (req, res) => {
  const data = new Date();
  const hora = data.getHours();
  const min = data.getMinutes();
  const seg = data.getSeconds();

  const result = schema.validate(req.body, Joi.messages);

  if (result.error) {
    
    res.send(result.error.details);
  }else{
    db.collection("logarBD").findOne({
    name: req.body.name
  }).then(user => {
     if(user !== null) res.sendStatus(409);
     else{
        db.collection("messageBD").insertOne({
        from: req.body.name,
        to: 'Todos',
        text: 'entra na sala...',
        type: 'status',
        time: hora + ':' + min + ':' + seg,
      });
      db.collection("logarBD").insertOne({...req.body, lastStatus: Date.now()});
      res.sendStatus(201);
     }
     
  });
  }
});

app.get('/participants', (req, res) => {
  db.collection("logarBD").find().toArray().then(user => res.send(user))
});

app.post('/messages', (req, res) => {
  const data = new Date();
  const hora = data.getHours();
  const min = data.getMinutes();
  const seg = data.getSeconds();

  const result = schemaMessage.validate(req.body, Joi.messages);

  if (result.error) {
    res.sendStatus(422);
  } else{ 
      db.collection("loginBD").findOne({
        name: req.headers.user
      }).then(user => {
        if(user === null) res.sendStatus(422);
        else{
          db.collection("messageBD").insertOne({
            from: req.headers.user,
            to: req.body.to,
            text: req.body.text,
            type: req.body.type,
            time: hora + ':' + min + ':' + seg,
          });
          res.sendStatus(201);
        }
      });
    }
});

app.get('/messages', (req, res) => {
  const numMessages = req.query.limit === undefined ? 2 : req.query.limit;
  db.collection("messageBD").find({$or:[{to: req.headers.user},{type: 'message'}]}).toArray().then(user => res.send(user.slice(-numMessages).reverse()));
});

app.listen(5000);
