// link webcam to index
const video = document.getElementById('video')

// pass array of models for face detection through promise then start video
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
    // get permission to use webcam, accept object in callback
    navigator.getUserMedia( 
        // callback element that we want is video
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
}

video.addEventListener('playing', () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = {width: video.width, height: video.height}
    // match canvas to displaySize
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
        // link all face API models to webcam, landmarks to track face shape and expressions
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        // resize window when face detected
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        // clear canvas before redraw
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        // draw dots on face
        faceapi.draw.drawDetections(canvas, resizedDetections) 
        // ABOVE THIS POINT DRAWS RECTANGLE WITH %MATCH
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    }, 100)
})