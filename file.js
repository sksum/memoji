
const NUM_KEYPOINTS = 468;
const NUM_IRIS_KEYPOINTS = 5;
const GREEN = '#32EEDB';
const RED = "#FF2C35";
const BLUE = "#157AB3";
const BLACK = "#000000";
const REB_In = [107,55];
const REB_Middle = [105,52];
const REB_Out = [156,124];
const LEB_In = [336,285];
const LEB_Middle = [334,282];
const LEB_Out = [383,353];
const avgScale = 3;


let stackYOffset = [];
let stackXOffset = [];

function distance(a, b) {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}

function average(queue) {
  let avg = 0 ;
  for (let i of queue) avg += i;
  avg = avg / queue.length;
  return avg;
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
       if (document.getElementById("tria").checked) { // stat,triangulate
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


          //getDistance from cam:
          let noseSize = distance(keypoints[6],keypoints[4])
          console.log("distane from camera ",noseSize);

          //iris handling
          let yOffset = rightCenter[1] - (keypoints[27][1] + keypoints[23][1])/2;
          let xOffset = rightCenter[0] - (keypoints[133][0] + keypoints[130][0])/2;
          
          //stabilize
          stackXOffset.push(xOffset);
          if (stackXOffset.length >= avgScale) stackXOffset.shift();

          stackYOffset.push(yOffset);
          if (stackYOffset.length >= avgScale) stackYOffset.shift();
          xOffset = average(stackXOffset);
          yOffset = average(stackYOffset);

          document.getElementById("eyeGroup").setAttribute('transform',"translate("+(-xOffset)*1.5+","+(yOffset)*2+")")
          const c = 1;
          // eyebrows handling
          let yDistR = (keypoints[REB_Middle[0]][1] + keypoints[REB_Middle[1]][1]) /2  -  rightCenter[1];
          document.getElementById("righteyebrow").setAttribute('transform',"translate("+0+","+((yDistR/2 +16))+")")
          
          let yDistL = (keypoints[LEB_Middle[0]][1] + keypoints[LEB_Middle[1]][1]) /2  -  leftCenter[1];
          document.getElementById("lefteyebrow").setAttribute('transform',"translate("+0+","+((yDistL/2 + 16))+")")
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