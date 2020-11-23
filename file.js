
async function setup  () {

    const model = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);
     
    // Pass in a video stream to the model to obtain an array of detected faces from the MediaPipe graph.
    // For Node users, the `estimateFaces` API also accepts a `tf.Tensor3D`, or an ImageData object.
    console.log(model)
    const video = document.getElementById("now");
    const predictions = await model.estimateFaces({ input: video });
    if (predictions.length > 0) {
        /*
        `predictions` is an array of objects describing each detected face, for example:
    
        [
          {
            faceInViewConfidence: 1, // The probability of a face being present.
            boundingBox: { // The bounding box surrounding the face.
              topLeft: [232.28, 145.26],
              bottomRight: [449.75, 308.36],
            },
            mesh: [ // The 3D coordinates of each facial landmark.
              [92.07, 119.49, -17.54],
              [91.97, 102.52, -30.54],
              ...
            ],
            scaledMesh: [ // The 3D coordinates of each facial landmark, normalized.
              [322.32, 297.58, -17.54],
              [322.18, 263.95, -30.54]
            ],
            annotations: { // Semantic groupings of the `scaledMesh` coordinates.
              silhouette: [
                [326.19, 124.72, -3.82],
                [351.06, 126.30, -3.00],
                ...
              ],
              ...
            }
          }
        ]
        */
    
        for (let i = 0; i < predictions.length; i++) {
          const keypoints = predictions[i].scaledMesh;
    
          // Log facial keypoints.

          console.log(keypoints.length, keypoints[0][0]);
        }
      }
}
// Prefer camera resolution nearest to 1280x720.
var constraints = {video: { width: 1280, height: 720 } }; 

async function setupCamera () {
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(mediaStream) {
            const video = document.getElementById("now");
            video.srcObject = mediaStream;
    video.onloadedmetadata = function(e) {
        video.play();
    };
    })
    .catch(function(err) { console.log(err.name + ": " + err.message); }); // always check for errors 
}
setupCamera();
document.getElementById("now").onloadeddata = function () {
    setup();
}