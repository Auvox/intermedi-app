const express = require('express');
const cors = require('cors');

export async function jsonHandlerUsuarios(req, res) {

  app.use(cors());
  
  // Middleware do Express para ler JSON simples vindo do app mobile
  app.use(express.json()); 

  const buffers = [];

  for await (const chunk of requests){
    buffers.push(chunk);
  }

  try {
    req.body = JSON.parse(Buffer.concat(buffers).toString);
  }
  catch(err){
    console.log("Não foi possível terminar a ação"+ err.message);
  }

  res.setHeader("Content-Type", "application/json")
}

module.exports = { jsonHandlerUsuarios };