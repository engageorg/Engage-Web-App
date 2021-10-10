import React , {useEffect, useLayoutEffect, useState} from 'react'
import firebase from 'firebase/app'
import 'firebase/firestore'
import Card from '../Card/card'
function Preloader(){
    return(
      <div className = "loader">
      <div className ="preloader">
      <div className ="box">
          <div className ="box__inner">
              <div className ="box__back-flap"></div>
              <div className ="box__right-flap"></div>
              <div className ="box__front-flap"></div>
              <div className ="box__left-flap"></div>
              <div className ="box__front"></div>
          </div>
      </div>
      <div className ="box">
          <div className ="box__inner">
              <div className ="box__back-flap"></div>
              <div className ="box__right-flap"></div>
              <div className ="box__front-flap"></div>
              <div className ="box__left-flap"></div>
              <div className ="box__front"></div>
          </div>
      </div>
      <div className ="line">
          <div className ="line__inner"></div>
      </div>
      <div className ="line">
          <div className ="line__inner"></div>
      </div>
      <div className ="line">
          <div className ="line__inner"></div>
      </div>
      <div className ="line">
          <div className ="line__inner"></div>
      </div>
      <div className ="line">
          <div className ="line__inner"></div>
      </div>
      <div className ="line">
          <div className ="line__inner"></div>
      </div>
      <div className ="line">
          <div className ="line__inner"></div>
      </div>
  </div>
  </div>
    )
  }
function AllLectures() {
    const [lectures, setLectures] = useState('')
    let lecturesArray = []
    const [isLoading, setLoading] = useState(false)
    useEffect(() => {
        firebase.firestore().collection("recordIndex").orderBy("createdAt", 'desc')
        .limit(10).get().then((result) => {
            result.forEach((doc) => {
                lecturesArray.push(doc.data())
            })
            setLectures(lecturesArray)
            setLoading(true)
        })
    }, [])
    return (
        <>
            {isLoading ? <Card lectures={lectures}/>: <Preloader/>}
        </>
    )
}

export default AllLectures