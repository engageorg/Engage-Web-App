const api = require('./routes/api');
const path = require('path')
const savedata = require('./routes/saveFile')
const express = require('express')
const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
  cors:{
    origin:'*'
  }
})

require('dotenv').config()

const port = process.env.PORT || 5000;
app.use(express.json({limit: '50mb'}));
app.use(express.json());
//app.use(express.json({limit: '50mb'}));
//handle CORS related issues that you might face when trying to access the API from different domains during development and testing:
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

if (true) {
  app.use(express.static(path.join(__dirname, '/frontendStatic')))

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontendStatic', 'index.html'))
  )
}


io.on('connection', socket => {
  
  socket.on("join-class", ({classid}) => {
      socket.join(classid)
  })

  socket.on("emitData", (classid,data) => {
    io.to(classid).emit("receiveData", data)
  })
  socket.on("sendStream", (data) => {
    io.to(data.classid).emit("emitStream", data )
  })
  socket.on("answerCall", (data) => {
    io.emit("callAccepted", data)
  })
})

app.use('/api', api);
app.use('/savedata', savedata);


http.listen(port, () => {
  console.log(`Server running on port ${port}`);
});