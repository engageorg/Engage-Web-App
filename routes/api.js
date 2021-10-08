const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.get('/todos', (req, res, next) => {
  res.send("HELLO")
});

router.post('/compile', async(req, res, next) => {
  const body  = {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    ...req.body
  }
  console.log(body)
  fetch('https://api.jdoodle.com/v1/execute', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json())
  .then(json => res.send(json));

});


module.exports = router;