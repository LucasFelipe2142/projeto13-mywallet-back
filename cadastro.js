import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const mongoClient = new MongoClient(process.env.URI);

let db;

mongoClient.connect().then(() => {
  db = mongoClient.db("walletBD");
});

export async function postCadastro(req, res) {
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

export async function getCadastro(req, res) {
  db.collection("usersBD")
    .find()
    .toArray()
    .then((user) => {
      res.send(user);
    });
}
