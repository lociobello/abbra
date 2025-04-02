let mic;
let font;
let textString = "abbra cadabra";
let textContainer;
let micStarted = false; // Track if the mic has been started
let startButton;

function preload() {
  font = loadFont("assets/Abbra_01032025-abbravariableVF.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  mic = new p5.AudioIn();

  // Create an HTML element for the text
  textContainer = createDiv(textString);
  textContainer.style("font-family", "Abbra_01032025"); // Use the font name directly
  textContainer.style("position", "absolute");
  textContainer.style("top", "50%");
  textContainer.style("left", "50%");
  textContainer.style("transform", "translate(-50%, -50%)");
  textContainer.style("text-align", "center");
  textContainer.style("white-space", "nowrap");

  // Create a button to start the microphone
  startButton = createButton("Start Microphone");
  startButton.position(width / 2 - 50, (height / 4) * 3);
  startButton.mousePressed(startMic);

  // Ensure the button is visible and mic is reset on reload
  micStarted = false;
  startButton.show();
}

function startMic() {
  // Resume the audio context to ensure microphone works after reload
  getAudioContext()
    .resume()
    .then(() => {
      mic.start();
      micStarted = true;
      startButton.hide(); // Hide the button after starting the mic
    });
}

function draw() {
  background(214, 255, 161);

  if (!micStarted) {
    return; // Do nothing until the mic is started
  }

  let micLevel = pow(mic.getLevel(), 0.6); // Apply a nonlinear mapping to amplify low volume effects

  let baseSize = 50;
  let baseWeight = 300;
  let maxSize = 300;
  let maxWeight = 900;
  let baseOpticalSize = 8; // Base optical size
  let maxOpticalSize = 100; // Maximum optical size

  let charArray = textString.split("");
  let smoothLevels = new Array(charArray.length).fill(0);

  let updatedHTML = ""; // To update the HTML content dynamically

  for (let i = 0; i < charArray.length; i++) {
    let char = charArray[i] === " " ? "&nbsp;" : charArray[i]; // Replace spaces with non-breaking spaces
    let noiseFactor = noise(i * 1, frameCount * 0.05); // Add Perlin noise for randomness
    smoothLevels[i] = lerp(smoothLevels[i], micLevel * noiseFactor, 0.1); // Smooth variation to reduce jitter
    let charSize = map(smoothLevels[i], 0, 0.02, baseSize, maxSize);
    let charWeight = map(smoothLevels[i], 0, 0.02, baseWeight, maxWeight);
    let charOpticalSize = map(smoothLevels[i], 0, 0.02, baseOpticalSize, maxOpticalSize);

    // Wrap each character in a span with dynamic styles
    updatedHTML += `<span style="
      font-size: ${charSize}px; 
      font-variation-settings: 'wght' ${charWeight}, 'opsz' ${charOpticalSize}; 
      line-height: 0; 
      display: inline-block;
      transform-origin: center bottom; /* Scale from the bottom center */
      transform: scale(1); /* Ensure scaling happens from the baseline */
    ">${char}</span>`;
  }

  // Update the HTML content of the text container
  textContainer.html(updatedHTML);
}
