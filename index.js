import express from "express";
import cors from "cors";
import Joi from "joi";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";
dotenv.config();

const mongoClient = new MongoClient(process.env.URI);

let db;

const app = start();

mongoClient.connect().then(() => {
  db = mongoClient.db("walletBD");
});

const schema = Joi.object().keys({
  name: Joi.string().min(1).required(),
});

const schemaRegistration = Joi.object().keys({
  name: Joi.string().min(1).required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
  password: Joi.string().min(6).required(),
});

const schemaAddorRemove = Joi.object().keys({
  type: Joi.valid("add", "remove").required(),
  description: Joi.string().min(1).required(),
  valor: Joi.string().min(1).required(),
});

app.post("/cadastro", async (req, res) => {
  const result = schemaRegistration.validate(req.body, { abortEarly: true });

  if (result.error) {
    res.sendStatus(404);
  } else {
    db.collection("usersBD")
      .findOne({
        email: req.body.email,
      })
      .then((user) => {
        if (user !== null) res.sendStatus(409);
        else {
          const password = bcrypt.hashSync(req.body.password, 10);
          db.collection("usersBD").insertOne({
            ...req.body,
            password: password,
          });
          res.sendStatus(201);
        }
      });
  }
});

app.get("/cadastro", (req, res) => {
  db.collection("usersBD")
    .find()
    .toArray()
    .then((user) => {
      res.send(user);
    });
});

app.post("/login", async (req, res) => {
  db.collection("usersBD")
    .findOne({
      email: req.body.email,
    })
    .then((user) => {
      if (user === null) return res.send(404);
      else if (user && bcrypt.compareSync(req.body.password, user.password)) {
        const token = uuid();
        db.collection("sessionsBD")
          .insertOne({
            token: token,
            userId: user._id,
          })
          .then(() => {
            delete user.password;
            res.send(token);
          });
      } else {
        res.send(404);
      }
    });
});

app.post("/add_or_remove_value", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const result = schemaAddorRemove.validate(req.body, { abortEarly: true });

  if (result.error) {
    res.sendStatus(404);
  } else {
    db.collection("sessionsBD")
      .findOne({
        token: token,
      })
      .then((value) => {
        if (value === null) return res.send(404);
        else {
          db.collection("valorsBD")
            .insertOne({
              ...req.body,
              userId: value.userId,
            })
            .then((value) => {
              res.send({
                ...req.body,
                userId: value.userId,
              });
            });
        }
      });
  }
});

app.listen(5000);

function start() {
  const app = express();
  app.use(express.json());
  app.use(cors());
  return app;
}
