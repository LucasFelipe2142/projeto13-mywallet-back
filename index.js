import express from 'express';
import cors from 'cors';
import Joi from 'joi';
import { MongoClient } from 'mongodb';
import dotenv from "dotenv";
dotenv.config();

const mongoClient = new MongoClient(process.env.URI);

let db;

const app = newFunction();

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
  db.collection("messageBD").find({$or:[{to: req.headers.user},{type: 'message'},{type: 'status'},{from: req.headers.user}]}).toArray().then(user => res.send(user.slice(-numMessages).reverse()));
});

app.post('/status', (req, res) => {

  db.collection("logarBD").findOne({
    name: req.headers.user
  }).then(user => {
     if(user === null) res.sendStatus(404);
     else{
      db.collection("logarBD").update({name: req.headers.user},{$set:{lastStatus: Date.now()}})
      res.sendStatus(200);
     }
     
  });
  
});

setInterval(()=>{
  db.collection("logarBD").find().toArray().then(list => {
     if(list !== null){
      for(let i=0; i<list.length; i++){
        if(Date.now() - list[i].lastStatus > 10000){
          const data = new Date();
          const hora = data.getHours();
          const min = data.getMinutes();
          const seg = data.getSeconds();
          db.collection("messageBD").insertOne({
            from: list[i].name,
            to: 'Todos',
            text: 'sai da sala...',
            type: 'status',
            time: hora + ':' + min + ':' + seg,
          });
          db.collection("logarBD").remove({name:list[i].name});
        }
      }
     }    
  });
}, 15000);

app.listen(5000);

function newFunction() {
  const app = express();
  app.use(express.json());
  app.use(cors());
  return app;
}

