const express = require("express");
const router = express.Router();
const firebase = require("firebase/app");
require("firebase/firestore");
require("firebase/storage");

require("dotenv").config();

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

const database = firebase.firestore();
var image
router.get("/",(req, res) => {
  let lecturesArray = []
  firebase.firestore().collection("recordIndex").orderBy("createdAt", 'desc')
  .limit(10).get().then((result) => {
    result.forEach((doc) => {
      lecturesArray.push(doc.data())
    })
    res.send(lecturesArray)
  })
  // firebase
  //   .firestore()
  //   .collection("recordIndex")
  //   .orderBy("createdAt", "desc")
  //   .limit(10)
  //   .get()
  //   .then((result) => {
  //     // result.forEach((doc) => {
  //     //   lecturesArray.push(doc.data());
  //     // });
  //     // result.forEach( (doc) => {
  //     //   storageRef
  //     //     .child(`/images/${doc.data().id}`)
  //     //     .getDownloadURL()
  //     //     .then((url) => {
  //     //       lecture = doc.data()

  //     //       lecture = {
  //     //         ...lecture,
  //     //         image: url,
  //     //       };
  //     //       lecturesArray.push(lecture);

  //     //     })
  //     //     .catch((e) => {
  //     //       console.log(e);
  //     //     });
  //     //     res.send(lecturesArray);    
  //     // })
  //     result.forEach((doc) => {
  //       lecturesArray.push(doc.data())
  //       //lecturesArray[lecturesArray-1] = {...lecturesArray[lecturesArray.length-1] ,image:getThumnail(lecturesArray[lecturesArray.length-1].id)}
  //     })   
  //   });
  //   res.send(lecturesArray); 
});

router.get("/:id", (req, res) => {
  console.log(req.params);
  var storageRef = firebase.storage().ref();
  let recordingString;
  let audio;
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
        .child(`/audio/${req.params.id}`)
        .getDownloadURL()
        .then((url) => {
          audio = url;
          res.send({ audio, recordingString });
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/", (req, res) => {
  let id;
  const recordingString = req.body.lectureData.recording;
  const audioString = req.body.lectureData.audio;
  const name = req.body.lectureData.name;
  const creator = req.body.lectureData.creator;
  const type = req.body.lectureData.type;
  const language = req.body.lectureData.language;
  const imageString = image;
  console.log(image)
  database
    .collection("events")
    .add({
      recordingString: recordingString,
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
          id: id,
          imageThumnail:image
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
          res.send(true);
        })
        .catch((e) => {
          console.log(e);
        });
      imageRef
        .putString(imageString, "data_url")
        .then((snapshot) => {
          console.log("THUMNAIL SAVED");
        })
        .catch((e) => {
          console.log(e);
        });
    });
});

router.post("/thum", (req, res) => {
  image = req.body.imageString
});


async function getThumnail (id) {
  var storageRef = firebase.storage().ref();
  await storageRef
  .child(`/images/${id}`)
  .getDownloadURL()
  .then((url) => {
    return url
  })
  .catch((e) => {
    console.log(e);
  });
}

module.exports = router;
