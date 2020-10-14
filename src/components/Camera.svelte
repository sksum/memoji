<script>
	import * as faceapi from 'face-api.js';
    import { onMount } from 'svelte';
    let video,canvas;
    onMount (()=> {
        // Promise.all ([
        //     faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
        //     faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        //     faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        //     faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        // ]).then(startVideo);
        faceapi.nets.tinyFaceDetector.loadFromUri('./models')
        .then(faceapi.nets.faceLandmark68Net.loadFromUri('./models'))
        .then(faceapi.nets.faceRecognitionNet.loadFromUri('./models'))
        .then(faceapi.nets.faceExpressionNet.loadFromUri('./models'))
        .then(()=>startVideo(),err => console.log(err))
    

        //spark-ar features to add :->  faceLandmark68Net not enough !!
// Cheek

// Position an object on a precise location on the user’s cheeks, such as the center of a cheek or a cheekbone.

// Chin

// Position an object on the tip of the user’s chin.

// Eyeball

// Position an object on a location on the user’s eyes (such as the center of an eyeball). This patch is used for iris tracking.

// Eyebrow

// Position an object on a precise location on the user’s eyebrows, such as the middle of an eyebrow.

// Eyelid

// Position an object on a precise location on the user’s eyelid (such as the inside or outside corner of an eye) and track the degree the eye is open.

// Forehead

// Position an object on the center or top of the user’s forehead.

// Nose

// Position an object on a precise location on the user’s nose, such as a nostril or the tip of the nose.


        video.addEventListener('play', () => {
            const displaySize = {width: video.width, height: video.height}
            faceapi.matchDimensions(canvas, displaySize)
            setInterval(async () => {
                const detections = await faceapi.detectAllFaces(video, 
                new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                // .withFaceExpressions()

                const resizedDetections =  faceapi.resizeResults(detections,displaySize)
                canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height)
                faceapi.draw.drawDetections(canvas, resizedDetections);
                faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            },100)
        })

    })
    
    const startVideo = () => {
        navigator.getUserMedia(
            {video:{}},
            stream => (video.srcObject = stream),
            err => console.error(err)
        );
    }


</script>

<video bind:this={video} id = "camera" height = "560" width ="720" autoplay muted></video>
<canvas bind:this={canvas}></canvas>

<style>
    canvas{
        position: absolute;
    }
</style>