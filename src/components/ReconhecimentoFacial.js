import { useRef, useEffect, useState, useCallback } from 'react'
import * as faceapi from 'face-api.js'

function ReconhecimentoFacial({ setUserRecon, stopVideo, onError }) {
  const imageRef = useRef()
  const videoRef = useRef()
  const canvasRef = useRef()
  const streamRef = useRef()
  const intervalRef = useRef()
  const faceMatherRef = useRef()

  const [isLoading, setIsLoading] = useState(true)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [error, setError] = useState(null)

  // Configurações
  const DETECTION_INTERVAL = 1000 // Reduzido para melhor performance
  const FACE_MATCH_THRESHOLD = 0.5
  const DISPLAY_SIZE = { width: 320, height: 240 }
  const LABELS = ['miguel', 'vando', 'tibor']

  // Cleanup function para parar tudo
  const cleanup = useCallback(() => {
    // Para o intervalo de detecção
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Para o stream de vídeo
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    // Limpa o canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }

    // Limpa o vídeo
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  // Iniciar o vídeo
  const startVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          frameRate: { ideal: 15, max: 15 } // Limitado para economia de recursos
        },
        audio: false
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      const errorMsg = 'Erro ao acessar a webcam: ' + err.message
      setError(errorMsg)
      onError?.(errorMsg)
      console.error(err)
    }
  }, [onError])

  // Carregar modelos do Face API
  const loadModels = useCallback(async () => {
    try {
      setIsLoading(true)

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models")
      ])

      console.log('Modelos carregados com sucesso')
      setModelsLoaded(true)
    } catch (err) {
      const errorMsg = 'Erro ao carregar modelos: ' + err.message
      setError(errorMsg)
      onError?.(errorMsg)
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [onError])

  // Carregar imagens rotuladas
  const loadLabeledImages = useCallback(async () => {
    if (faceMatherRef.current) return faceMatherRef.current

    try {
      const labeledDescriptors = await Promise.all(
        LABELS.map(async label => {
          const descriptions = []

          // Tenta carregar múltiplas imagens por pessoa para melhor precisão
          for (let i = 1; i <= 2; i++) {
            try {
              const img = await faceapi.fetchImage(
                `https://raw.githubusercontent.com/joaomiiiguel/face-id-tester/main/public/images/${label}.jpeg`
              )
              const detection = await faceapi
                .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({
                  inputSize: 192,
                  scoreThreshold: 0.5
                }))
                .withFaceLandmarks()
                .withFaceDescriptor()

              if (detection) {
                descriptions.push(detection.descriptor)
              }
            } catch (err) {
              console.warn(`Erro ao carregar imagem ${i} para ${label}:`, err)
            }
          }

          if (descriptions.length === 0) {
            console.warn(`Nenhuma descrição facial encontrada para ${label}`)
            return null
          }

          return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
      )

      // Filtra descritores válidos
      const validDescriptors = labeledDescriptors.filter(desc => desc !== null)

      if (validDescriptors.length === 0) {
        throw new Error('Nenhum descritor facial válido foi carregado')
      }

      const faceMatcher = new faceapi.FaceMatcher(validDescriptors, FACE_MATCH_THRESHOLD)
      faceMatherRef.current = faceMatcher

      return faceMatcher
    } catch (err) {
      console.error('Erro ao carregar imagens rotuladas:', err)
      throw err
    }
  }, [])

  // Função principal de detecção facial
  const detectFaces = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) return

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({
          inputSize: 192, // Menor = mais rápido
          scoreThreshold: 0.5 // Threshold para detectar rostos
        }))
        .withFaceLandmarks()
        .withFaceDescriptor()

      // Limpa o canvas
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

      if (detection) {
        const faceMatcher = await loadLabeledImages()
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor)

        // Atualiza o usuário reconhecido
        const recognizedUser = bestMatch.distance < FACE_MATCH_THRESHOLD ? bestMatch.label : 'desconhecido'
        setUserRecon(recognizedUser)

        // Capitaliza a primeira letra do nome
        const capitalizedName = bestMatch.label.charAt(0).toUpperCase() + bestMatch.label.slice(1)

        // Desenha o box de detecção
        const box = detection.detection.box
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: `${capitalizedName}`
        })
        drawBox.draw(canvasRef.current)
      } else {
        setUserRecon('nenhum_rosto_detectado')
      }
    } catch (err) {
      console.error('Erro na detecção facial:', err)
      setError('Erro durante a detecção: ' + err.message)
    }
  }, [modelsLoaded, loadLabeledImages, setUserRecon])

  // Iniciar detecção contínua
  const startDetection = useCallback(() => {
    if (intervalRef.current) return

    intervalRef.current = setInterval(detectFaces, DETECTION_INTERVAL)
  }, [detectFaces])

  // Configurar canvas
  const setupCanvas = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return

    canvasRef.current.width = DISPLAY_SIZE.width
    canvasRef.current.height = DISPLAY_SIZE.height

    faceapi.matchDimensions(canvasRef.current, DISPLAY_SIZE)
  }, [])

  // Effect principal
  useEffect(() => {
    const initialize = async () => {
      await startVideo()
      await loadModels()
    }

    initialize()

    return cleanup
  }, [startVideo, loadModels, cleanup])

  // Effect para iniciar detecção quando modelos estiverem carregados
  useEffect(() => {
    if (modelsLoaded && videoRef.current) {
      setupCanvas()
      startDetection()
    }
  }, [modelsLoaded, setupCanvas, startDetection])

  // Effect para parar quando stopVideo for chamado
  useEffect(() => {
    if (stopVideo) {
      cleanup()
    }
  }, [stopVideo, cleanup])

  // Handler para quando o vídeo estiver pronto
  const handleVideoPlay = useCallback(() => {
    if (modelsLoaded) {
      setupCanvas()
      startDetection()
    }
  }, [modelsLoaded, setupCanvas, startDetection])

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center p-4">
          <p className="text-red-600 font-semibold">Erreur de reconnaissance faciale</p>
          <p className="text-red-500 text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col items-center w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10 rounded-lg">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Chargement des modèles...</p>
          </div>
        </div>
      )}

      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          crossOrigin="anonymous"
          onPlay={handleVideoPlay}
          className="rounded-lg"
          style={{ width: DISPLAY_SIZE.width, height: DISPLAY_SIZE.height }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 rounded-lg"
        />
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Status: {modelsLoaded ? 'Détection...' : 'Chargement...'}
        </p>
      </div>
    </div>
  )
}

export default ReconhecimentoFacial