const express = require('express');
const routes = require('./routes/api');
const app = express();
const path = require('path')


require('dotenv').config()

const port = process.env.PORT || 5000;

app.use(express.json());

//handle CORS related issues that you might face when trying to access the API from different domains during development and testing:
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

if (true) {
  app.use(express.static(path.join(__dirname, '/frontendStatic/staticBuild')))

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontendStatic', 'staticBuild', 'index.html'))
  )
}

app.use('/api', routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});