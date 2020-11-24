
const NUM_KEYPOINTS = 468;
const NUM_IRIS_KEYPOINTS = 5;
const GREEN = '#32EEDB';
const RED = "#FF2C35";
const BLUE = "#157AB3";
const BLACK = "#000000";


function distance(a, b) {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}


function drawPath(ctx, points, closePath) {
  const region = new Path2D();
  region.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    region.lineTo(point[0], point[1]);
  }

  if (closePath) {
    region.closePath();
  }
  ctx.stroke(region);
}


async function renderPrediction() {
  const predictions = await model.estimateFaces({
    input: video,
    returnTensors: false,
    flipHorizontal: false,
    predictIrises: true
  });
  var canvas = document.getElementById("output");
  canvas.width = 1280
  canvas.height = 720
  var ctx = canvas.getContext('2d');
  // ctx.drawImage(
  //     video, 0, 0, 1028, 720, 0, 0, canvas.width, canvas.height);

  if (predictions.length > 0) {
    console.log("still here")
    predictions.forEach(prediction => {
      const keypoints = prediction.scaledMesh;
       if (false) { // stat,triangulate
        ctx.strokeStyle = GREEN;
        ctx.lineWidth = 2.5;

        for (let i = 0; i < TRIANGULATION.length / 3; i++) {
          const points = [
            TRIANGULATION[i * 3], TRIANGULATION[i * 3 + 1],
            TRIANGULATION[i * 3 + 2]
          ].map(index => keypoints[index]);

          drawPath(ctx, points, true);
        }
      } else {
        ctx.fillStyle = GREEN;

        for (let i = 0; i < NUM_KEYPOINTS; i++) {
          const x = keypoints[i][0];
          const y = keypoints[i][1];
          ctx.beginPath();
          ctx.arc(x, y, 5/* radius */, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      if(keypoints.length > NUM_KEYPOINTS) {
        ctx.strokeStyle = RED;
        ctx.lineWidth = 1;

        const leftCenter = keypoints[NUM_KEYPOINTS];
        const leftDiameterY = distance(
          keypoints[NUM_KEYPOINTS + 4],
          keypoints[NUM_KEYPOINTS + 2]);
        const leftDiameterX = distance(
          keypoints[NUM_KEYPOINTS + 3],
          keypoints[NUM_KEYPOINTS + 1]);

        ctx.beginPath();
        ctx.ellipse(leftCenter[0], leftCenter[1], leftDiameterX / 2, leftDiameterY / 2, 0, 0, 2 * Math.PI);
        ctx.stroke();

        if(keypoints.length > NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS) {
          const rightCenter = keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS];
          const rightDiameterY = distance(
            keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 2],
            keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 4]);
          const rightDiameterX = distance(
            keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 3],
            keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 1]);

          ctx.beginPath();
          ctx.ellipse(rightCenter[0], rightCenter[1], rightDiameterX / 2, rightDiameterY / 2, 0, 0, 2 * Math.PI);
          ctx.stroke();
          let yOffset = rightCenter[1] - (keypoints[27][1] + keypoints[23][1])/2;
          let xOffset = rightCenter[0] - (keypoints[133][0] + keypoints[130][0])/2;
          console.log("left: ",xOffset,leftCenter[1],"right: ",rightCenter[0]-keypoints[0][0],rightCenter[1])
          document.getElementById("helloworld").setAttribute('transform',"translate("+(-xOffset)*1.5+","+(yOffset)*2+")")
        }
      }
    });
  }
  requestAnimationFrame(renderPrediction);
};
var model;
async function importLib  () {

    model = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);
     
    // Pass in a video stream to the model to obtain an array of detected faces from the MediaPipe graph.
    // For Node users, the `estimateFaces` API also accepts a `tf.Tensor3D`, or an ImageData object.
    console.log(model)
    const video = document.getElementById("now");
      renderPrediction();
    // const predictions = await model.estimateFaces({ input: video });
    // if (predictions.length > 0) {
    //     /*
    //     `predictions` is an array of objects describing each detected face, for example:
    
    //     [
    //       {
    //         faceInViewConfidence: 1, // The probability of a face being present.
    //         boundingBox: { // The bounding box surrounding the face.
    //           topLeft: [232.28, 145.26],
    //           bottomRight: [449.75, 308.36],
    //         },
    //         mesh: [ // The 3D coordinates of each facial landmark.
    //           [92.07, 119.49, -17.54],
    //           [91.97, 102.52, -30.54],
    //           ...
    //         ],
    //         scaledMesh: [ // The 3D coordinates of each facial landmark, normalized.
    //           [322.32, 297.58, -17.54],
    //           [322.18, 263.95, -30.54]
    //         ],
    //         annotations: { // Semantic groupings of the `scaledMesh` coordinates.
    //           silhouette: [
    //             [326.19, 124.72, -3.82],
    //             [351.06, 126.30, -3.00],
    //             ...
    //           ],
    //           ...
    //         }
    //       }
    //     ]
    //     */
    
    //     for (let i = 0; i < predictions.length; i++) {
    //       const keypoints = predictions[i].scaledMesh;
    
    //       // Log facial keypoints.

    //       console.log(keypoints.length, keypoints[0][0]);
    //     }
    //   }
}
var video;
async function setupCamera (constraints) {
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(mediaStream) {
            video = document.getElementById("now");
            video.srcObject = mediaStream;
    video.onloadedmetadata = function(e) {
        video.play();
      };
      
    video.onloadeddata =  () => {importLib()};

    })
    
    .catch(function(err) { console.log(err.name + ": " + err.message); }); // always check for errors 

  }

let main = () => {
  // Prefer camera resolution nearest to 1280x720.
  var constraints = {video: { width: 1280, height: 720 } }; 
  setupCamera(constraints);
}

main();