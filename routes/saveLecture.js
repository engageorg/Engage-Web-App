const express = require("express")
const router = express.Router();
const firebase = require("firebase/app");
require("firebase/firestore");
require("firebase/storage");

require('dotenv').config();


const firebaseConfig = {
    apiKey:process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket:process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID,
  };
  console.log(firebaseConfig)
  
if (firebase.apps.length === 0) {
   firebase.initializeApp(firebaseConfig);
}

const database = firebase.firestore()


router.get("/", (req,res) => {
    let lecturesArray = []
    firebase.firestore().collection("recordIndex").orderBy("createdAt", 'desc')
    .limit(10).get().then((result) => {
      result.forEach((doc) => {
        lecturesArray.push(doc.data())
      })
      res.send(lecturesArray)
    })
})

router.get("/:id", (req,res) => {
  console.log(req.params)
  var storageRef = firebase.storage().ref();
  let recordingString;
  let audio
  firebase
  .firestore()
  .collection("events")
  .where(firebase.firestore.FieldPath.documentId(), "==", req.params.id)
  .get()
  .then((snap) => {
    snap.forEach((doc) => {
      console.log(doc.data());
      recordingString = doc.data().recordingString;
    });
    storageRef
    .child(req.params.id)
    .getDownloadURL()
    .then((url) => {
      audio = url
      res.send({audio, recordingString})
    })
  })
  .catch((err) => {
    console.log(err);
  });

})


router.post("/", (req,res) => {
    //console.log(req.body.lectureData)
    let id
    const recordingString = req.body.lectureData.recording;
    const audioString = req.body.lectureData.audio;
    const name= req.body.lectureData.name
    const creator= req.body.lectureData.creator
    const type= req.body.lectureData.type
    const language= req.body.lectureData.language
    const imageString= req.body.lectureData.image
    database
    .collection("events")
    .add({
      recordingString:recordingString,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      name: name,
      creator: creator,
      type: type,
    })
    .then((result) => {
      id = result.id;
      firebase
        .firestore()
        .collection("recordIndex")
        .add({
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          name: name,
          creator: creator,
          type: type,
          language: language,
          id:id,
        })
        .then((result) => {
          console.log("Recording Tally Saved");
        });
      console.log("Recording Saved");
      var storageRef = firebase.storage().ref();
      var audioRef = storageRef.child(`/audio/${id}`);
      var imageRef = storageRef.child(`/images/${id}`);
      audioRef
        .putString(audioString, "data_url")
        .then((snapshot) => {
          res.send(true)
        })
        .catch((e) => {
          console.log(e);
        });
        //console.log(imageString)
        imageRef
        .putString(imageString,  "data_url")
        .then((snapshot) => {
          console.log("THUMNAIL SAVED")
        })
        .catch((e) => {
          console.log(e);
        });
    //   axios.post("http://localhost:5000/savelecture", {
    //     lectureData,
    //   });
    });
})


module.exports = router;