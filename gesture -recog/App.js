import React,{useRef,useEffect,useState} from 'react'
import Webcam from 'react-webcam'; 
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import './App.css';
import {drawHand} from './Hand'

import * as fp from "fingerpose";
import victory from "./img/victory.png";
import thumbs_up from "./img/thumbs_up.png";


const App = () => {
  const webcamRef=useRef(null);
  const canvasRef=useRef(null);

  // const [emoji, setEmoji] = useState(null);
  const [data,setData]=useState("")
  const images = { thumbs_up: thumbs_up, victory: victory };
  
  

  const detectHand =async (net)=>{
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const hand = await net.estimateHands(video);
      //  console.log(hand)

      if(hand.length > 0)
      {
        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture,
          fp.Gestures.ThumbsUpGesture,
        ])
        const gesture=await GE.estimate(hand[0].landmarks, 4)
        // console.log(gesture)
        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
            // console.log(gesture.gestures);

          const confidence = gesture.gestures.map(
            (prediction) => prediction.confidence
          );
          const maxConfidence = confidence.indexOf(
             Math.max.apply(null, confidence)
            
          ); 
           let ges=gesture.gestures[maxConfidence].name;
           
           setData(ges)
         console.log(ges)
        }
      
      }

      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand,ctx)


     
  
  }
  }
  const runHandpose=async ()=>{
    const net=await handpose.load();
    // console.log("handpose loaded")
    setInterval( ()=>{
      detectHand(net)
    },10)
  };



  useEffect(()=>{runHandpose()},[]);

  

  return (
    <>
    <Webcam 
    ref={webcamRef}

    style={{
      position:'absolute',
      marginLeft:'auto',
      marginRight:'auto',
      left:0,
      right:0,
      top:'50px',
      textAlign:'center',
      width:650,
      height:500,
      border:'5px solid white',
      
    }}
  
    />
     <canvas
          ref={canvasRef}
          style={{
            position:'absolute',
            marginLeft:'auto',
            marginRight:'auto',
            left:0,
            right:0,
            top:'50px',
            textAlign:'center',
            width:650,
            height:500,
            border:'5px solid white',
          }}
        />
      
    </>
  )
}

export default App;
