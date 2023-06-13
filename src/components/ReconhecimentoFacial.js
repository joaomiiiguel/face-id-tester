import { useRef, useEffect } from 'react'
import * as faceapi from 'face-api.js'
import { useSelector, useDispatch } from 'react-redux'

function ReconhecimentoFacial() {
  const videoRef = useRef()
  const canvasRef = useRef()
  const isLogged = useSelector((state) => state.user.isLogged)

  // LOAD FROM USEEFFECT
  useEffect(() => {
      startVideo()
      videoRef && loadModels()
  }, [])


  // OPEN YOU FACE WEBCAM
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream
      })
      .catch((err) => {
        console.log(err)
      })
  }
  // LOAD MODELS FROM FACE API

  const loadModels = () => {
    Promise.all([
      // THIS FOR FACE DETECT AND LOAD FROM YOU PUBLIC/MODELS DIRECTORY
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models")

    ]).then(() => {
      faceMyDetect()
    })
  }

  const faceMyDetect = () => {
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(videoRef.current,
        new faceapi.TinyFaceDetectorOptions())

      // DRAW YOU FACE IN WEBCAM
      canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(videoRef.current)
      faceapi.matchDimensions(canvasRef.current, {
        width: 300,
        height: 250
      })

      const resized = faceapi.resizeResults(detections, {
        width: 300,
        height: 250
      })

      faceapi.draw.drawDetections(canvasRef.current, resized)
    }, 1000)
  }

  return (
    <div className='flex flex-col w-full items-center justify-between h-[400px]'>
      <div className="flex items-center ">
        <video crossOrigin="anonymous" ref={videoRef} autoPlay></video>
      </div>
      <canvas ref={canvasRef} width="400" height="400"  className="absolute" />
    </div>
  )

}

export default ReconhecimentoFacial;