import { useRef, useEffect } from 'react'
import * as faceapi from 'face-api.js'

function ReconhecimentoFacial() {
  const imageRef = useRef()
  const videoRef = useRef()
  const canvasRef = useRef()

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
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.ssdMobilenetv1.loadFromUri("/models")

    ]).then(() => {
      console.log('Done Load');
      faceMyDetect()
    })
      .catch((e) => console.log(e))
  }


  function loadLabeledImages() {
    const labels = ['miguel', 'vando']
    return Promise.all(
      labels.map(async label => {
        const descriptions = []
        for (let i = 1; i <= 2; i++) {
          const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/joaomiiiguel/face-id-tester/main/public/images/${label}.jpeg`)
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
          descriptions.push(detections.descriptor)
        }

        return new faceapi.LabeledFaceDescriptors(label, descriptions)
      })
    )
  }

  const faceMyDetect = async () => {
    setInterval(async () => {
      //image cadastrada
      const resultRef = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withFaceDescriptor()
      //Webcan de rec
      const queryRef = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withFaceDescriptor()

      const labeledFaceDescriptors = await loadLabeledImages()


      const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.5)

      const displayResized = {
        width: 350,
        height: 230
      }

      //Add o box na webcan
      canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(videoRef.current)
      faceapi.matchDimensions(canvasRef.current, displayResized)

      const bestMatch = await faceMatcher.findBestMatch(queryRef?.descriptor)

      const box = { x: (queryRef.detection.box.x / 1.7), y: (queryRef.detection.box.y / 2), width: 100, height: 100 }
      const queryDrawBoxes = new faceapi.draw.DrawBox(box, { label: bestMatch.label })
      queryDrawBoxes.draw(canvasRef.current)

    }, 2000)
  }

  return (
    <div className='flex flex-row w-full h-full'>
      <div className="flex items-center w-full">
        <video crossOrigin="anonymous" ref={videoRef} autoPlay></video>
      </div>
      <canvas ref={canvasRef} className="absolute" />
    </div>
  )

}

export default ReconhecimentoFacial;