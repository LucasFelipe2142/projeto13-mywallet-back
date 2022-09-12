import express from "express";
import cors from "cors";
import Joi from "joi";
import { postCadastro, getCadastro } from "./cadastro.js";
import { postLogin, Delete } from "./login.js";
import { postAddRemove, getAddRemove } from "./addRemove.js";

const app = start();

async function validaCadastro(req, res, next) {
  const validation = schemaRegistration.validate(req.body, {
    abortEarly: true,
  });

  if (validation.error) {
    return res.sendStatus(422);
  }

  next();
}

async function validaAddRemove(req, res, next) {
  const validation = schemaAddorRemove.validate(req.body, {
    abortEarly: true,
  });

  if (validation.error) {
    return res.sendStatus(422);
  }

  next();
}

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

app.post("/cadastro", validaCadastro, postCadastro);

app.get("/cadastro", getCadastro);

app.post("/login", postLogin);

app.delete("/logout/:token", Delete);

app.post("/add_or_remove_value", validaAddRemove, postAddRemove);

app.get("/add_or_remove_value", getAddRemove);

app.listen(5000);

function start() {
  const app = express();
  app.use(express.json());
  app.use(cors());
  return app;
}
