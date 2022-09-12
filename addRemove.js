import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mongoClient = new MongoClient(process.env.URI);

let db;

mongoClient.connect().then(() => {
  db = mongoClient.db("walletBD");
});

export async function postAddRemove(req, res) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const now = new Date();
  const day = now.getDay() < 10 ? `0${now.getDay()}` : now.getDay();
  const month = now.getMonth() < 10 ? `0${now.getMonth()}` : now.getMonth();

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
            description:
              req.body.description[0].toUpperCase() +
              req.body.description.substring(1),
            userId: value.userId,
            date: `${day}/${month}`,
          })
          .then(() => {
            res.sendStatus(201);
          });
      }
    });
}

export async function getAddRemove(req, res) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  db.collection("sessionsBD")
    .findOne({
      token: token,
    })
    .then((value) => {
      if (value === null) return res.send(404);
      else {
        db.collection("valorsBD")
          .find({ userId: value.userId })
          .toArray()
          .then((user) => res.send(user));
      }
    });
}
