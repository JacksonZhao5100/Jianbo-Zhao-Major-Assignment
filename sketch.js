// Dynamic background color variables
let dayLength = 1000; // Duration of a day (in frames)
let sunriseColor, noonColor, sunsetColor, nightColor;

// Tree animation variables
let growthSpeed = 0.4;
let maxSize = 40;
let circleSizes = [];
let noiseOffsets = [];
let shapes = [];
let swayNoiseOffset; // Noise offset for sway effect

class randomNoisyShape {
  // The constructor will take a type of shape as an argument - circle or square
  constructor(type) {
    this.type = type;
    // Randomise the x and y position of the shape. These are limited to 80% of the width and height
    this.x = random(0.8);
    this.y = random(0.8);

    // Randomise the size of the shape between 5% and 20% of the width
    this.size = random(0.05, 0.2);
    // Randomise the colour of the shape
    this.colour = [random(190, 200), random(150, 255), random(200, 255)];
    // Randomise the noise scale between 0.1 and 0.35 - this will decide how much the shape will move. 
    // Try changing the range to see how it affects the shape's movement.
    this.noiseScale = random(0.1, 0.35);
    // Randomise the noise offset - this is where along the noise function the noise will start to be taken from.
    this.noiseLocation = random(10);
  }

  display() {
    // Use the instance colour to fill the shape.
    fill(this.colour);
    noStroke();
    // Get the smaller dimension of the canvas.
    let minDimension = min(width, height);  // Use the smaller dimension to maintain the aspect ratio.
    // Calculate the size of the shape based on the smaller dimension.
    // Remember the sizes were made in percentages, so this will scale correctly no matter what the width.
    let size = this.size * minDimension;  

    // We have 2 noise values, one for the x and one for the y. We will sample the yNoise
    // from slightly further along the noise function by adding 10 to the x noise offset.
    let xNoise = noise(this.noiseLocation);  
    let yNoise = noise(this.noiseLocation + 10);  

    // The x position is the x value of the shape plus the xNoise value multiplied by the 
    // noise scale and the width of the canvas - same idea for the y position.
    let x = (this.x + xNoise * this.noiseScale) * windowWidth;
    let y = (this.y + yNoise * this.noiseScale) * windowHeight;

    // Draw the shape based on the type
    switch (this.type) {
      case 'circle':
        ellipse(x, y-(windowHeight/2), size, size);
        break;
    }
    // Increment the noise offset each frame so we sample the next part of the noise function.
    this.noiseLocation += 0.01;
  }
}

class Cloud {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(windowWidth/40, windowWidth/20); //The size of the clouds changes with the size of window
  }

  move() {
    this.x += 1;
    if (this.x > width + this.size) {
      this.x = -this.size;
    }
  }

  show() {
    noStroke();
    
    // Get current background color
    let timeOfDay = frameCount % dayLength;
    let currentBgColor;
    
    if (timeOfDay < dayLength / 4) { // Sunrise
      let sunriseProgress = sin(map(timeOfDay, 0, dayLength / 2, -HALF_PI, HALF_PI));
      currentBgColor = color(
        lerp(red(nightColor), red(sunriseColor), sunriseProgress),
        lerp(green(nightColor), green(sunriseColor), sunriseProgress),
        lerp(blue(nightColor), blue(sunriseColor), sunriseProgress)
      );
    } else if (timeOfDay < dayLength / 2) { // Daytime
      let dayProgress = sin(map(timeOfDay, dayLength / 4, dayLength / 2, -HALF_PI, HALF_PI));
      currentBgColor = color(
        lerp(red(sunriseColor), red(noonColor), dayProgress),
        lerp(green(sunriseColor), green(noonColor), dayProgress),
        lerp(blue(sunriseColor), blue(noonColor), dayProgress)
      );
    } else if (timeOfDay < (3 * dayLength) / 4) { // Sunset
      let sunsetProgress = sin(map(timeOfDay, dayLength / 2, (3 * dayLength) / 4, -HALF_PI, HALF_PI));
      currentBgColor = color(
        lerp(red(noonColor), red(sunsetColor), sunsetProgress),
        lerp(green(noonColor), green(sunsetColor), sunsetProgress),
        lerp(blue(noonColor), blue(sunsetColor), sunsetProgress)
      );
    } else { // Night
      let nightProgress = sin(map(timeOfDay, (3 * dayLength) / 4, dayLength, -HALF_PI, HALF_PI));
      currentBgColor = color(
        lerp(red(sunsetColor), red(nightColor), nightProgress),
        lerp(green(sunsetColor), green(nightColor), nightProgress),
        lerp(blue(sunsetColor), blue(nightColor), nightProgress)
      );
    }
    
    // Create gradient effect for each cloud element
    for (let i = 0; i <= this.size; i += 2) {
      // Make cloud color lighter than background
      let cloudColor = color(
        min(red(currentBgColor) + 40, 255),
        min(green(currentBgColor) + 40, 255),
        min(blue(currentBgColor) + 40, 255)
      );
      
      // Create gradient from top to bottom
      let alpha = map(i, 0, this.size, 255, 180);
      cloudColor.setAlpha(alpha);
      fill(cloudColor);

      // Draw cloud shapes with gradient
      let yOffset = map(i, 0, this.size, 0, this.size * 0.2);
      ellipse(this.x, this.y + yOffset, this.size - i);
      ellipse(this.x + this.size * 0.5, this.y + this.size * 0.2 + yOffset, (this.size - i) * 0.8);
      ellipse(this.x - this.size * 0.5, this.y + this.size * 0.2 + yOffset, (this.size - i) * 0.8);
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Initialize dynamic background colors
  nightColor = color(20, 24, 82);      // Night color (deep blue)
  sunriseColor = color(255, 160, 80);  // Sunrise color (orange)
  noonColor = color(135, 206, 250);    // Daytime color (light blue)
  sunsetColor = color(255, 99, 71);    // Sunset color (orange-red)
  shapes.push(new randomNoisyShape('circle'));
  shapes.push(new randomNoisyShape('circle'));
  shapes.push(new randomNoisyShape('circle'));
  shapes.push(new randomNoisyShape('circle'));
  shapes.push(new randomNoisyShape('circle'));
  shapes.push(new randomNoisyShape('circle'));
  shapes.push(new randomNoisyShape('circle'));
  shapes.push(new randomNoisyShape('circle'));

  // Initialize tree parameters
  let totalCircles = 6 + 4 * 2 + 3 * 2 + 2 * 2;
  swayNoiseOffset = random(1000); // Initialize noise offset for sway effect
  for (let i = 0; i < totalCircles; i++) {
    circleSizes.push(0);          // Initial size of all circles is 0
    noiseOffsets.push(random(1000)); // Random noise offset for each circle
  }

  initaliseClouds();
}

function draw() {
  // Calculate current background color (transitioning from night to sunrise, daytime, and then sunset)

  let scaleFactor = min(windowWidth, windowHeight) / 700; //scaleFactor is used to reshape the sizes of the fruit and the tree as the window grows and shrinks.

  let timeOfDay = frameCount % dayLength;
  let r, g, b;
  if (timeOfDay < dayLength / 4) { // Sunrise
    let sunriseProgress = sin(map(timeOfDay, 0, dayLength / 2, -HALF_PI, HALF_PI));
    r = lerp(red(nightColor), red(sunriseColor), sunriseProgress);
    g = lerp(green(nightColor), green(sunriseColor), sunriseProgress);
    b = lerp(blue(nightColor), blue(sunriseColor), sunriseProgress);
  } else if (timeOfDay < dayLength / 2) { // Daytime
    let dayProgress = sin(map(timeOfDay, dayLength / 4, dayLength / 2, -HALF_PI, HALF_PI));
    r = lerp(red(sunriseColor), red(noonColor), dayProgress);
    g = lerp(green(sunriseColor), green(noonColor), dayProgress);
    b = lerp(blue(sunriseColor), blue(noonColor), dayProgress);
  } else if (timeOfDay < (3 * dayLength) / 4) { // Sunset
    let sunsetProgress = sin(map(timeOfDay, dayLength / 2, (3 * dayLength) / 4, -HALF_PI, HALF_PI));
    r = lerp(red(noonColor), red(sunsetColor), sunsetProgress);
    g = lerp(green(noonColor), green(sunsetColor), sunsetProgress);
    b = lerp(blue(noonColor), blue(sunsetColor), sunsetProgress);
  } else { // Night
    let nightProgress = sin(map(timeOfDay, (3 * dayLength) / 4, dayLength, -HALF_PI, HALF_PI));
    r = lerp(red(sunsetColor), red(nightColor), nightProgress);
    g = lerp(green(sunsetColor), green(nightColor), nightProgress);
    b = lerp(blue(sunsetColor), blue(nightColor), nightProgress);
  }
  background(r, g, b, 10); // Set background color

  // Use a for-of loop to display the shapes.
  for (let shape of shapes) {
    shape.display();
  }
  // Clouds move across the window
  for (let cloud of clouds){
    cloud.move();
    cloud.show();
  }

  // Draw tree animation
  drawBaseStructure(scaleFactor);
  drawCircles(scaleFactor);

  // Control growth of circle sizes
  for (let i = 0; i < circleSizes.length; i++) {
    if (circleSizes[i] < maxSize*scaleFactor) {
      circleSizes[i] += growthSpeed*scaleFactor;
    }
  }
}

// Draw the base structure (flowerpot)
function drawBaseStructure(scaleFactor) {
  fill(150, 180, 100); // Pot color
  noStroke();
  rectMode(CENTER);
  rect(width / 2, height - 150*scaleFactor, 350*scaleFactor, 80*scaleFactor);

  fill(80, 160, 90); // Green semi-circles
  for (let i = 0; i < 5; i++) {
    arc(width / 2 - 120 + i * 60, height - 150*scaleFactor, 60*scaleFactor, 60*scaleFactor, PI, 0);
  }

  fill(200, 60, 60); // Red semi-circles
  for (let i = 0; i < 4; i++) {
    arc(width / 2 - 90 + i * 60, height - 150*scaleFactor, 60*scaleFactor, 60*scaleFactor, 0, PI);
  }

  // The circle refreshes, to change the speed of this the number after framecount needs to be changed.
  if (frameCount % 500 === maxSize){
    resetCircleSize();
  }
}

// Draw circles for tree trunk and branches with noise-based sway
function drawCircles(scaleFactor) {
  let currentIndex = 0;
  let circleSize = 50*scaleFactor;

  drawVerticalCircles(width / 2, height - 200*scaleFactor, 6, circleSize, currentIndex, scaleFactor);
  currentIndex += 6;

  drawHorizontalCircles(width / 2, height - 450*scaleFactor, 4, circleSize, -1, currentIndex, scaleFactor);
  currentIndex += 4;
  drawHorizontalCircles(width / 2, height - 450*scaleFactor, 4, circleSize, 1, currentIndex, scaleFactor);
  currentIndex += 4;

  drawHorizontalCircles(width / 2, height - 350*scaleFactor, 3, circleSize, -1, currentIndex, scaleFactor);
  currentIndex += 3;
  drawHorizontalCircles(width / 2, height - 350*scaleFactor, 3, circleSize, 1, currentIndex, scaleFactor);
  currentIndex += 3;

  drawHorizontalCircles(width / 2, height - 550*scaleFactor, 2, circleSize, -1, currentIndex, scaleFactor);
  currentIndex += 2;
  drawHorizontalCircles(width / 2, height - 550*scaleFactor, 2, circleSize, 1, currentIndex, scaleFactor);

  // The circle refreshes, to change the speed of this the number after framecount needs to be changed.
  if (frameCount % 500 === maxSize){
    resetCircleSize();
  }
}

// Draw vertical circles (trunk) with sway effect
function drawVerticalCircles(x, y, count, size, indexStart, scaleFactor) {
  let sway = map(noise(swayNoiseOffset + frameCount * 0.01), 0, 1, -5*scaleFactor, 5*scaleFactor); // Calculate sway

  for (let i = 0; i < count; i++) {
    let noiseX = map(noise(noiseOffsets[indexStart + i] + frameCount * 0.01), 0, 1, -10*scaleFactor, 10*scaleFactor);
    let noiseY = map(noise(noiseOffsets[indexStart + i] + 1000 + frameCount * 0.01), 0, 1, -10*scaleFactor, 10*scaleFactor);
    let circleSize = circleSizes[indexStart + i];
    drawColoredCircle(x + noiseX + sway, y - i * size * 1.2 + noiseY, circleSize);
    // Set the first circle as golden
    let isGolden = (i === 3); // Change this index to make a different circle golden

    drawColoredCircle(x + noiseX + sway, y - i * size * 1.2 + noiseY, circleSize, isGolden);

    if (i > 0) {
      drawLine(x + sway, y - (i - 1) * size * 1.2, x + sway, y - i * size * 1.2);
    }
  }
}

// Draw horizontal circles (branches) with sway effect
function drawHorizontalCircles(x, y, count, size, direction, indexStart, scaleFactor) {
  let sway = map(noise(swayNoiseOffset + frameCount * 0.01), 0, 1, -5*scaleFactor, 5*scaleFactor); // Calculate sway

  for (let i = 1; i <= count; i++) {
    let noiseX = map(noise(noiseOffsets[indexStart + i - 1] + frameCount * 0.01), 0, 1, -10*scaleFactor, 10*scaleFactor);
    let noiseY = map(noise(noiseOffsets[indexStart + i - 1] + 1000 + frameCount * 0.01), 0, 1, -10*scaleFactor, 10*scaleFactor);
    let xPos = x + i * size * 1.2 * direction + noiseX + sway;
    let circleSize = circleSizes[indexStart + i - 1];
    drawColoredCircle(xPos, y + noiseY, circleSize);
    

    drawLine(x + sway, y, xPos, y + noiseY);
  }
}

// Draw a circle with alternating red and green halves, and one with gold
function drawColoredCircle(x, y, size, isGolden = false) {
  noStroke();
  if (isGolden) {
    fill(255, 215, 0); // Gold color for the top half
    arc(x, y, size, size, PI, 0);
    fill(218, 165, 32); // Darker gold for the bottom half
    arc(x, y, size, size, 0, PI);
  } else {
    fill(200, 60, 60); // Red top half
    arc(x, y, size, size, PI, 0);
    fill(80, 160, 90); // Green bottom half
    arc(x, y, size, size, 0, PI);
  }
}


// Draw connecting line for branches
function drawLine(x1, y1, x2, y2) {
  stroke(100, 50, 50, 150);
  strokeWeight(3);
  line(x1, y1, x2, y2);
}

// Initialise Clouds
function initaliseClouds(){
  clouds = []; // This clears the excisiting clouds
  for (let i = 0; i < 5; i++){
    clouds.push(new Cloud(random(width), random(windowWidth/40,windowWidth/10)));
  }
}

// The circles get reset with this function.
function resetCircleSize(){
  for (let i = 0; i < circleSizes.length; i++) {
    circleSizes[i] = 0;
  }
}

// Adjust canvas size on window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initaliseClouds(); // The clouds get reset everytime the canvas gets adjusted.
}

