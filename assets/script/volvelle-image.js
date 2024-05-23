//this is the code for the simplified p5.js version
//this code is adapted from code written by Logan Franken ("html5 circle puzzle")
//Franken's code is available here: https://github.com/loganfranken/Circle-Puzzle
//Franken's code was "translated" into p5.js for questions of accessibility

let psim1 = [ "assets/img/simoes-words-1.png", [1, 0.85, 0.684, 0.53, 0.373], "words" ];
let psim2 = [ 'assets/img/simoes-words-2.png', [1, 0.84, 0.684, 0.53, 0.373], "words" ];
let psim3 = [ 'assets/img/simoes-words-3.png', [1, 0.84, 0.684, 0.53, 0.373], "words-center" ];
let psim4 = [ 'assets/img/simoes-img-1.png', [1, 0.62, 0.433], "img" ];
let psim5 = [ 'assets/img/simoes-img-2.png', [1, 0.62, 0.433], "img" ];

let canvas;
let userVolvelleArray = [1, 0.75, 0.5, 0.23];
let puzzleDiv = document.getElementById("puzzle-canvas-wrapper");
let puzzleDivIMG = document.getElementById("puzzle-canvas-wrapper-img");
let puzzleDivWordsCentered = document.getElementById("puzzle-canvas-wrapper-words-centered");


//add this in order to make it valid p5.js, but we are not using it in this sketch:
function setup(){

	canvas = createCanvas(1500,1500);
	//canvas.parent(puzzleDiv);

	//////////////////////////////////////////////////////////////////////////////////////////
	//
	// 		Launch the Puzzle when the DOM is ready
	// 		for now, display the first of the volvelles:
	//
	//
	window.addEventListener('load', createRotatingVolvelle (psim1), false);

};

//we are not using the p5.js native draw() loop at all for the volvelles,
//instead, they are redrawn only when the user drags them:
function draw(){
	cursor('pointer');
};



function createRotatingVolvelle(img){


	//console.log(window.innerWidth);
	if (window.innerWidth < 1300){
		console.log("window inner width is small:", window.innerWidth);
		img = psim4;
	}

	console.log("img is:", img);
	if(img[2] === "img"){
		canvas.parent(puzzleDivIMG);
	}else if (img[2] === "words-center"){
		canvas.parent(puzzleDivWordsCentered);
	}else{
		//console.log("going into the puzzleDIV assingment:");
		canvas.parent(puzzleDiv);
	}
	let volvellePercentages = img[1];
	let array = img[1];
	let volvelleImage = new Image();
	volvelleImage.src = img[0];
	volvelleImage.onload = function() {
		let theVolvelle = new volvelle(canvas, volvelleImage, volvellePercentages);
	}
}



/*
//////////////////////////////////////////////////////////////////////////////////////////
//
// 		allow users to upload their own image to create a digital rotating volvelle
// 		1. create a scaled down (800x800px ) version of the image that the user uploads
//		2. and then create the volvelle:
//		* user volvelle needs to be a square image and centered
//
//
document.getElementById("uploadButton").addEventListener("change", function(e) {
		let img = document.createElement('img');
    img.src = URL.createObjectURL(e.target.files[0]);
		img.onload = function() { //use a canvas to scale the image to 800x800:
      // Create a canvas element just for resizing the image:
      let resizingCanvas = document.createElement('canvas');
      let ctx = resizingCanvas.getContext('2d');
      // Set the maximum width to 600 pixels
      let maxWidth = 800;
      // Calculate the scaled-down dimensions
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }
      // Set the canvas dimensions
      resizingCanvas.width = width;
      resizingCanvas.height = height;
      // Draw the image on the canvas with scaled dimensions
      ctx.drawImage(img, 0, 0, width, height);
      // Get the scaled-down image data URL
      let scaledDataUrl = resizingCanvas.toDataURL();
      let scaledImg = document.createElement('img');
      scaledImg.src = scaledDataUrl;
			//overwrite the volvelle that is currently on the canvas:
			scaledImg.onload = function () {
				let userVolvelle = new volvelle(canvas, scaledImg, userVolvelleArray);
			}
		}
});
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//		Code adapted from Logan Franken, converted to p5.js
//
//

function volvelle(canvas, image, volvellePercentages){
	const full_rotation = (Math.PI * 2);
	const rotation_speed = 50;
	this.isDragging = false;
	this.activeCircle = null;
	this.circles = [];
	this.draw = function(){
		clear();
		for(let i=0; i<this.circles.length; i++){
			this.circles[i].draw(); //not to be confused with the p5.js draw() method
		}
	};
	this.rotateCircle = function(circle, rotation){
		circle.rotation += rotation; //rotates THAT circle,
		this.draw(); //and then "draws" the stuff on the canvas again, but JUST that circle:
	}

	let numCircles = volvellePercentages.length;
	//numCircles: number of circles is equal to the number of parameters
	//we pass in the array that defines the cutpoint for the circles (as percentage
	//of radius)

	// Use the smallest possible radius to ensure image fits
	let maxRadius = min(width, height, image.width, image.height)/2; //!!!
	//here we calculate maxRadius, ie. the maximum radius of the circular image,
	// ie: width/2.

	// Calculate Puzzle Circle dimensions
	let centerX = width/2;
	let centerY = height/2;

	// Create the Puzzle Circles
	let currRadius = maxRadius; // so eg. we start with maxRadius = currRadius = 100:
	for(let i=0; i<numCircles; i++){ // so then we go through i=0 until numCircles = 5:
		let rotation = random() * full_rotation; //add a random rotation to the each circle of the image:
		//this.circles[i] = new PUZZLE.PuzzleCircle(centerX, centerY, currRadius, image, rotation);

		this.circles[i] = new volvelleCircle(centerX, centerY, maxRadius*volvellePercentages[i], image, rotation);

		// this creates a new PuzzleCircle given the centerX and centerY which are constant,
		// the image, which is constant, and a randomly generated rotation, which
		// essentially shifts the image by a specific amount in order to make it
		// into a puzzle.
		// what it basically does is that it draws a puzzle circle, largest to smallest,
		// center to that radius, then pops it into an array by index: the first element
		// is the largest, the second the second largest, etc.
	}

	// Display the Puzzle Circles
	this.draw(); //draw the puzzle canvas, which then calls draw puzzle circles.
	// ^^ i guess here it somehow draws the puzzle circles on top of eachother?
	let self = this; //why this?
	let lastCursorX = null;

	//handle mouse and touch events:
	canvas.mousePressed(startDragging);
	canvas.mouseMoved(isDragging);
	canvas.mouseReleased(endDragging);
	canvas.touchStarted(startDragging);
	canvas.touchMoved(isDragging);
	canvas.touchEnded(endDragging);

	function startDragging(){
		//event.preventDefault();
		// Determine the circle that the User clicked
		for(var i=self.circles.length - 1; i>=0; i--){
			//this checks if mouse click happened on top of "me"
			if(self.circles[i].isInside(mouseX, mouseY)){
				self.activeCircle = self.circles[i]; //check which is the activeCircle, ie. which circle was touched -> rotated
				self.isDragging = true;
				return;
			}
		}
	}

	function endDragging(){
		//event.preventDefault();
		// Reset the dragging state
		self.isDragging = false;
		lastCursorX = null;
	}

	function isDragging(){
		//event.preventDefault();
		if(!self.isDragging){return;}
		// First Mouse Move since Mouse Down, so just the cache cursor position and leave
		if(lastCursorX == null){
			lastCursorX = mouseX;
			return;
		}
		// Calculate rotation distance
		let cursorXDiff = mouseX - lastCursorX;
		let rotation = -(cursorXDiff/rotation_speed);
		// If we're on the upper half of the circle, then we need to do the inverse calculation
		// of the rotation
		if(mouseY < self.activeCircle.y){
			rotation = (full_rotation) - rotation;
		}
		self.rotateCircle(self.activeCircle, rotation);
		// Cache the cursor position
		lastCursorX = mouseX;
	}//end isDragging

}//close createVolvelle()

function volvelleCircle(x, y, radius, image, rotation){
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.image = image;
	this.rotation = rotation;
	this.isInside = function(x, y){
		let xDist = this.x - x;
		let yDist = this.y - y;
		return ((xDist * xDist) + (yDist * yDist)) < (this.radius * this.radius);
	}
	this.draw = function(){
		drawingContext.save();
		drawingContext.globalCompositeOperation = 'source-over';
		// Move canvas to center or Circle to simplify rotation
		drawingContext.translate(this.x, this.y);
		drawingContext.rotate(this.rotation);
		// Draw the circle
		drawingContext.beginPath();
		drawingContext.arc(0, 0, this.radius, 0, Math.PI * 2, false);
		drawingContext.clip();
		// Draw the image
		drawingContext.drawImage(this.image,
			-(this.image.width/2),
			-(this.image.height/2));
		// End composition
		drawingContext.restore();
	}
}//close volvelleCircle()
