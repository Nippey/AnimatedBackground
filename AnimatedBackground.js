/////////////////
//   TODO
// change to relative coordinates
// add property changer
/////////////////

////////////////
//COMPATIBILITY
//
//Successfully tested with: (+: and following versions):
//	-Windows-
//IE		9 +
//Opera		11.64 +
//Safari	5.1 +
//Firefox	4.0 +
//Mathon	3.4.2 + 
//Chrome	5 +
//SeaMonkey	2.11 +
//Flock		/
//Navigator	/
//Lunascape	/
//
//	-Mac-
//Chrome	21 +
//iCab		5.0
//Firefox	15.0
//OmniWeb	622
//Stainless	0.8
//Opera		12.02
//Safari 	6.0
//Camino	/
////////////////

/* For Development */
//Use strict mode together with Object.seal() to prevent typos, etc when they come up!
"use strict";
var ABGscriptName = "AnimatedBackground.js";

/* Some helper Functions */
//Reduce Number to the given range
Number.prototype.clamp = function(min, max) {
	return Math.min(Math.max(this, min), max);
}
//Set Number to zero if exceeding given range
Number.prototype.valid = function(min, max) {
	return (this>max || this<min) ? 0 : this;
}
//Returns the width of an HTMLElement or the window's width as fallback
window.getWidth = HTMLElement.prototype.getWidth = function() {
	return Math.min( (this.width || this.scrollWidth || window.Infinity), (window.innerWidth || window.width));
}
//Returns the height of an HTMLElement or the window's height as fallback
window.getHeight = HTMLElement.prototype.getHeight = function() {
	return Math.min( (this.height || this.scrollHeight || window.Infinity), (window.innerHeight || window.height));
}

/**
 * Provides requestAnimationFrame in a cross browser way.
 * @author 		paulirish
 * @homepage	http://paulirish.com/
 *
 * Altered as it didn't work in Opera 12 RC & 12.50 Next
 * The fallback will work with 60FPS as the upper methods also are supposed to run with this framerate
 */
window.requestAnimationFrame = 
	window.requestAnimationFrame       ||
	window.webkitRequestAnimationFrame || 
	window.mozRequestAnimationFrame    || 
	window.oRequestAnimationFrame      || 
	window.msRequestAnimationFrame     || 
	function( callback ){ window.setTimeout(callback, 1000 / 60); };
	
/* **************************************************************** *\
 *	ResizeDetector "Class" 											*
 *																	*
 *	User functions:													*
 *																	*
 *	ResizeDetector ResizeDetector ( void )							*
 *		Constructor: Create a new instance by calling 				*
 *		"new ResizeDetector()"										*
 *																	*
 *	Boolean check ( )												*
 *		Check if the window has been resized since the 				*
 *		last call of this function									*
 *																	*
 *	User variables:													*
 *																	*
 *	Boolean increaseDetected 										*
 *		Will be set to true after calling the check() function if 	*
 *		the window got larger in at least one of the two dimensions	*
\* **************************************************************** */

//This class will tell you if a resize happened since its last call
function ResizeDetector(element) {
	this.element = element || window;
	this.oldWidth = this.element.getWidth();
	this.oldHeight = this.element.getHeight();
	this.increaseDetected = false;
}

//This function will return true if the window-size has changed since its last call
//If a resize has happened, you can query the property increaseDetected to check if
//at least one dimension has been increased.
ResizeDetector.prototype.check = function() {
	this.increaseDetected = false;
	var newWidth = this.element.getWidth(), newHeight = this.element.getHeight();
	if (this.oldWidth != newWidth || this.oldHeight != newHeight)
	{
		this.increaseDetected = ( (this.oldWidth < newWidth) || (this.oldHeight < newHeight) );
		this.oldWidth = newWidth;
		this.oldHeight = newHeight;
		return true;
	}
	else return false;
}

if (Object.seal) {
	Object.seal(ResizeDetector);
	Object.seal(ResizeDetector.prototype);
}

/* **************************************************************** *\
 *	AnimatedBackground "Class" 										*
 *																	*
 *	Public functions:												*
 *																	*
 *	AnimatedBackground AnimatedBackground ( void )					*
 *		Constructor: Create a new instance by using "new"			*
 *	E.g.:   bg = new AnimatedBackground()							*
 *																	*
 *	AnimatedBackground createElementBackground ( HTMLElement )		*
 *		Create and start background animation of an HTMLElement by 	*
 *		supplying the HTMLElement to this function					*
 *	E.g.:   bg.createElementBackground( $("#bg") );					*
 *																	*
 *	AnimatedBackground createWebsiteBackground ( )					*
 *		Create and start background animation by simply calling 	*
 *		this function												*
 *	E.g.:   bg.createWebsiteBackground();							*
 *																	*
 *	AnimatedBackground setProperty ( )								*
 *		Change the animation settings of this instance by supplying	*
 *		an object to this function whose members represent the		*
 * 		settings to be changed 										*
 *  E.g.:   bg.setProperty( {hue:200, saturation:30} );				*
 *																	*
 *	AnimatedBackground start ( )									*
 *		Create and start background animation by simply calling 	*
 *		this function												*
 *	E.g.:   bg.start();												*
 *																	*
 *	AnimatedBackground stop ( )										*
 *		Create and start background animation by simply calling 	*
 *		this function												*
 *	E.g.:   bg.stop();												*
 *																	*
 *																	*
 *	Notes:															*
 *	Looks very good with circles instead of rectanges, but needs	*
 *	five times more processing power (in Opera 12.50)				*
\* **************************************************************** */

//Instantiate a new animated background
//Call createElementBackground or createWebsiteBackground to animate the element of your choice
function AnimatedBackground() {
	//Assign a unique ID to each instance of AnimatedBackground
	//Create 'static' variable available arcoss all instances
	//AnimatedBackground.staticID = AnimatedBackground.staticID || 0;
	//Assign local ID and increase static variable
	this.ID = AnimatedBackground.staticID++;
	
	//Load the external font file. If possible load the binary version, which is 24-times smaller.
	//If loading the binary font fails, the javascript version will be retrieved.
	var loadFailSafeFont = function() {
		//console.log("Binary font missing, loading failsafe variant.");
		AnimatedBackground.staticFontStatus = AnimatedBackground.FONT_MISSING;
		//Add a script tag to the DOM in order to load the JS-version of the font
		var scripts = document.getElementsByTagName("script");
		var path = "";
		for (var i in scripts)
			if (scripts[i].src.indexOf(ABGscriptName) != -1) {
				path = scripts[i].src.substr(0,scripts[i].src.indexOf(ABGscriptName));
				break;
			}
			
		var font = document.createElement("script");
		font.setAttribute("src", path+"fnt6x11.min.js");
		document.head.appendChild(font);	
	};
	try {
		if (!window.Uint8Array) throw "Switching to failsafe font.";
		if (AnimatedBackground.staticFontStatus == AnimatedBackground.FONT_UNLOADED) {
			AnimatedBackground.staticFontStatus = AnimatedBackground.FONT_LOADING;
			//Start XHR to load binary data
			var xhr = new XMLHttpRequest();
			xhr.open('GET', 'fnt6x11.bin', true);
			xhr.responseType = 'arraybuffer';
			xhr.addEventListener('load', function(e) {
				//Add font as static Byte-Array to the AnimatedBackground class
				AnimatedBackground.staticFont = new Uint8Array(e.target.response);
				AnimatedBackground.staticFontStatus = AnimatedBackground.FONT_LOADED;
			}, false);
			xhr.addEventListener('error', function(e) {
				loadFailSafeFont();
			}, false);
			xhr.send(null);
		}
	} catch (exp) {
		loadFailSafeFont();
	}
	
	//Settings
	//Colour
	this.hue = 100;							//Colour of the background [0..359]
	this.saturation = 70;					//Saturation of the background colour [0..100]
	this.staticLightnessBase = 50;			//Minimum static lightness value of the background colour [0..100]
	this.staticLightnessVariation = 10;		//Variation of the static lightness value (will always be added) [0..(100-BaseValue)]
	this.dynamicLightnessBase = 80;			//Minimum dynamic lightness value ...
	this.dynamicLightnessVariation = 15;	//Variation of the dynamic lightness value  ...

	//Size and Style
	this.drawingStyle = 2;					//Select among different drawing-styles as rectangles or circles
	this.noOfLightnessShades = 4;			//Number of different colours used for the background pattern
	this.blockSize = 6;						//Size of a single quadratic block
	//General Timing
	this.fadeAmount = 1;					//Alpha value the dynamic points will be faded WITHIN ONE SECOND
	//Path specific settings
	this.pathPauseBase = 10;
	this.pathPauseVariation = 10;
	this.pathLengthBase = 15;
	this.pathLengthVariation = 15;
	//END Settings

	
	//Global working variables
	this.stopAnimation = false;
	this.created = false;
	//Structural values and dimension
	this.lightnessShades = [];				//
	this.pattern = [];						//Contains the background pattern's lightness values
	this.containerElement = null;			//The parent element of the canvas elements
	this.sC = null; this.dC = null;			//The two canvas elements
	this.ctx = null;						//The drawing context
	this.cWidth = null; 
	this.cHeight = null;					//The size of the canvas elements
	this.rasterWidth = null; 
	this.rasterHeight = null;				//The size of the canvas in raster points
	this.rasterSize = this.blockSize + 1;	//The blocks are offset by 1 pixel resulting in a slightly bigger raster
	this.dynamicPoints = [];				//All dynamic points the be drawn on the dynamic canvas (Coordinates are in raster points!)
	this.resizeDetector = null;				//This will keep a reference to a resize detector
	//General animation values
	this.lastTimeMeasure = new Date().getTime();	//Will be used to get a fluent animation
	this.frameTime = 0;						//Saves the time passed between the last two frames
	this.frameSkippingValue = 4;			//Used to scale down the targeted 60FPS of requestAnimationFrame
	this.frameSkippingCounter = 0;			//Counts the frames to be skipped. New Frame will be drawn on 0
	this.resizedEvent = false;				//Will be true after resizing of the window occurred
	this.refreshBG = false;					//Redraw background completely
	//Specific animation values
	this.pathPauseCounter = 10;				//Counts the invervals to the start of the next line drawing action
	this.dotPauseCounter = 10;				//Counts the invervals to the start of the next dot drawing action

	//Listen to resize events in order to fit the canvas' size
	//Using lexical closure as setInterval or event handlers in general would change from AnimatedBackground's context to global window context
	//IE's ".attachEvent" is not needed anymore when using html5
	var that = this;
	window.addEventListener("resize", function() {
		that.resizedEvent = true;
	}, false);
	//No idea if it helps on opera mobile. It is possible to register a rezise handler there, but it will never be fired..
	window.addEventListener("touchstart", function() {
		that.resizedEvent = true;
	}, false);
	
	//Seal this instance of the class
	if (Object.seal)
		Object.seal(this);
	
	return this;
}

//Assign a unique ID to each instance of AnimatedBackground
//Create 'static' variable available arcoss all instances
AnimatedBackground.staticID = 0;

//Static values used to manage the external font file and its loading process
//Font will be loaded on first instantiation of the AnimatedBackground class
AnimatedBackground.FONT_UNLOADED = 0;
AnimatedBackground.FONT_LOADING = 1;
AnimatedBackground.FONT_LOADED = 2;
AnimatedBackground.FONT_MISSING = 3;
AnimatedBackground.staticFontStatus = AnimatedBackground.FONT_UNLOADED;
AnimatedBackground.staticFont = null;

//Static values to represent the different drawing modes
AnimatedBackground.DS_RECT = 0;			//Do the animation using rectangles: Primary Operation: FillRect()
AnimatedBackground.DS_CIRCLE_PRE = 1;	// .. using predrawn circles: Primary Operation: DrawImage()
AnimatedBackground.DS_CIRCLE = 2;		// .. using circles: Primary Operation: Arc()


//Measures the time since the last call of this function
//Saves this time in frameTime and returns this value
AnimatedBackground.prototype.measureFrameTime = function() {
	var elapsed = new Date().getTime() - this.lastTimeMeasure;
	this.lastTimeMeasure = new Date().getTime();
	this.frameTime = elapsed;
	return elapsed;
}

//Initialise the background pattern
//Uses object vars: 	containerElement, sC, dC, ctx, rasterWidth, rasterHeight, rasterSize, cWidth, cHeight, ID
//                  	hue, saturation, staticLightnessBase, staticLightnessVariation
//Uses own functions:	initCanvas
AnimatedBackground.prototype.initBackground = function(parentElement) {
	//
	parentElement = parentElement || this.containerElement;
	this.containerElement = parentElement;
	
	//Some basic settings
	//parentElement.style.backgroundColor = "hsl(" + this.hue + ", " + this.saturation + "%, " + (this.staticLightnessBase + this.staticLightnessVariation/2) + "%)";
	//parentElement.style.zIndex = "-3";
	
	//Some basic variables
	this.rasterWidth = Math.ceil(parentElement.getWidth() / this.rasterSize);
	this.rasterHeight = Math.ceil(parentElement.getHeight() / this.rasterSize);
	
	this.cWidth = this.rasterWidth * this.rasterSize;
	this.cHeight = this.rasterHeight * this.rasterSize;
	
	//Initialise static and dynamic canvas
	var oldC = this.sC;
	this.sC = this.initCanvas("static_canvas_"+this.ID, -2);
	this.dC = this.initCanvas("dynamic_canvas_"+this.ID, -1);	
	
	//Create background pattern colours
	for (var i = 0; i < this.noOfLightnessShades; i++)
		this.lightnessShades[i] = Math.floor(this.staticLightnessBase + i / (this.noOfLightnessShades-1) * this.staticLightnessVariation);	//=> noOfLightnessShades must be >= 2
	if (this.noOfLightnessShades == 1)
		this.lightnessShades[0] = Math.floor(this.staticLightnessBase + this.staticLightnessVariation/2);
	
	//Create pattern data
	for (var x = 0; x < this.rasterWidth; x++) {
		if (typeof(this.pattern[x]) == "undefined")
			this.pattern[x] = new Array();
		for (var y = this.pattern[x].length; y < this.rasterHeight; y++) {
			this.pattern[x][y] = Math.floor(Math.random() * this.noOfLightnessShades);
		}
	}
	
	//
	this.sC.style.backgroundColor = "hsl(" + this.hue + ", " + this.saturation + "%, 70%)";
	//Get drawing context of static canvas
	this.ctx = this.sC.getContext("2d");
	///Drawing will only happen there, where the canvas is still empty this prevents flickering/complete refresh on resize operations
	this.ctx.globalCompositeOperation = "source-over";	//Default is source-over
	
	//The following is now declared as style of the canvas element
	//Fill the gaps between the block which will later be seen as light grid
	//this.ctx.globalCompositeOperation = "destination-over";
	//this.ctx.fillStyle = "hsl(" + this.hue + ", " + this.saturation + "%, 70%)";
	//this.ctx.fillRect(0, 0, this.cWidth, this.cHeight);
	
	if (oldC)
		this.drawBackground({width:oldC.width, height:oldC.height});
	else
		this.drawBackground();
		
	//Change (back) to the dynamic canvas in the foreground for later operations
	this.ctx = this.dC.getContext("2d");
	this.ctx.globalCompositeOperation = "source-over";	//Default is source-over
}

//Draw the boxes with a random colour
AnimatedBackground.prototype.drawBackground = function(predrawn) {

	//This is a temporary canvas for computational intensive drawing tasks
	var miniCanvas, miniCtx;
	if (this.drawingStyle == AnimatedBackground.DS_CIRCLE_PRE) {
		miniCanvas = document.createElement("canvas");
		miniCanvas.width = this.blockSize; miniCanvas.height = this.blockSize;
		miniCtx = miniCanvas.getContext("2d");
	}
	
	if (console.time) console.time("drawing");
	for (var shade = 0; shade < this.noOfLightnessShades; shade++) {
		switch (this.drawingStyle) {
			case AnimatedBackground.DS_RECT:
				this.ctx.fillStyle = "hsl(" + this.hue + ", " + this.saturation + "%, " + this.lightnessShades[shade] + "%)";
				break;
			case AnimatedBackground.DS_CIRCLE_PRE:
				miniCtx.clearRect(0,0,this.blockSize,this.blockSize);
				miniCtx.fillStyle = "hsl(" + this.hue + ", " + this.saturation + "%, " + this.lightnessShades[shade] + "%)";
				miniCtx.beginPath();
				miniCtx.arc(this.blockSize/2, this.blockSize/2, this.blockSize / 2, 2 * Math.PI, false);
				miniCtx.fill();
				break;
			case AnimatedBackground.DS_CIRCLE:
				this.ctx.fillStyle = "hsl(" + this.hue + ", " + this.saturation + "%, " + this.lightnessShades[shade] + "%)";
				this.ctx.beginPath();
				break;
		}
		
		for (var x = 0; x < this.rasterWidth; x++) for (var y = 0; y < this.rasterHeight; y++) {
			//Skip if the current area is pre drawn by a previous canvas initialisation
			if (!this.refreshBG && predrawn && x*this.rasterSize < predrawn.width && y*this.rasterSize < predrawn.height) continue;
			//this.ctx.fillStyle = "hsl(" + this.hue + ", " + this.saturation + "%, " + this.lightnessShades[this.pattern[x][y]] + "%)";
			if (this.pattern[x][y] == shade) {
				switch (this.drawingStyle) {
					case AnimatedBackground.DS_RECT:
						this.ctx.fillRect(x*this.rasterSize, y*this.rasterSize, this.blockSize, this.blockSize);
						break;
					case AnimatedBackground.DS_CIRCLE_PRE:
						this.ctx.drawImage(miniCanvas, x*this.rasterSize, y*this.rasterSize);
						break;
					case AnimatedBackground.DS_CIRCLE:
						this.ctx.moveTo(x*this.rasterSize, y*this.rasterSize);
						this.ctx.arc(x*this.rasterSize+this.blockSize/2, y*this.rasterSize+this.blockSize/2, this.blockSize / 2, 2 * Math.PI, false);
						break;
				}
			}
		}
		
		switch (this.drawingStyle) {
			case AnimatedBackground.DS_CIRCLE:
				this.ctx.fill();
				break;
		}
	}
	if (console.time) console.timeEnd("drawing");
}

//Initialise a new canvas (or change the size of an existing canvas) and insert
// it into the background container. The container is expected to be exclusively
// for the canvas elements. The created HTMLCanvasElement will be returned.
//Uses object vars: containerElement, cWidth, cHeight
//Uses functions:	-
AnimatedBackground.prototype.initCanvas = function(id, zIndex) {
	//Initialise canvas
	var c;
	if (! (c = document.getElementById(id)) ) {
		//This part creates a new canvas and appends is to the HTMLElement saved in <containerElement>
		c = document.createElement("canvas");
		c.setAttribute("style", "display:block; position:absolute; top:0px; left:0px; z-index:"+zIndex);
		c.setAttribute("id", id);
		//This might be up to <rasterSize> pixels bigger, but this way we have always a complete raster
		c.width = this.cWidth;
		c.height = this.cHeight;
		
		//In the first version, the script always tried to add the canvas as the first element,
		// by using a container exclusively for the canvases, we don't have to care about it
		// Aditionally we are working with z-indices now.
		this.containerElement.appendChild(c);
	} else {
		//This part reuses an existing canvas as source for the new canvas. In order
		// to prevent flickering, a new element is created, the content is copied over
		// and the old canvas will be removed a bit later in the cleanUp function after
		// the redraw of the browser has happened
		var newC = c.cloneNode(true);
		newC.width = this.cWidth;
		newC.height = this.cHeight;
		//Add to DOM
		c.id = "old_" + c.id;
		this.containerElement.insertBefore(newC, c);
		//Transfer contents from old to new canvas (resizing will delete contents)
		if (!this.refreshBG) {
			var newCtx = newC.getContext("2d");
			newCtx.drawImage(c, 0, 0, c.width, c.height);
		}
		c = newC;
	}
	return c;
}

//Create dots at random coordinates and add them to the points-list
//Uses object vars: 	rasterSize, cWidth, cHeight
//                  	dynamicLightnessBase, dynamicLightnessVariation, dynamicPoints
//Uses own functions:	-
AnimatedBackground.prototype.drawDots = function() {
	//Randomly choose a block of the canvas
	var x = Math.floor(Math.random() * this.rasterWidth);
	var y = Math.floor(Math.random() * this.rasterHeight);
	//Paint it with a random colour (in a certain range of course)
	var light = Math.floor(this.dynamicLightnessBase + Math.random() * this.dynamicLightnessVariation);
	//Add the new randomly chosen point to the array
	this.dynamicPoints.push({x:x, y:y, light:light, alpha:1});
}

//Create lines at random coordinates and add them to the points-list
//Uses object vars: 	rasterSize, cWidth, cHeight, pathLengthBase, pathLengthVariation
//                  	dynamicLightnessBase, dynamicLightnessVariation, dynamicPoints
//Uses own functions:	-
AnimatedBackground.prototype.drawLines = function() {
	//Wait several round before starting the next path
	if (0 >= this.pathPauseCounter--)
	{
		//Choose a random value (in a certain range) to wait for the creation of the next line
		this.pathPauseCounter = this.pathPauseBase + Math.random() * this.pathPauseVariation;
		//Randomly choose a block of the canvas and paint it with a random colour (in a certain range of course)
		var x = Math.floor(Math.random() * this.rasterWidth);
		var y = Math.floor(Math.random() * this.rasterHeight);
		//Paint it with a random colour (in a certain range of course)
		//var light = Math.floor(dynamicLightnessBase + Math.random() * dynamicLightnessVariation);
		var light = this.dynamicLightnessBase + this.dynamicLightnessVariation;
		//Make up a random direction
		var x_dir = Math.floor(Math.random()*3)-1;
		var y_dir = Math.floor(Math.random()*3)-1;
		//If both directions are zero, we would only see a long-shining dot, so just abort here and wait for the next call
		if ( (x_dir == 0) && (y_dir == 0) ) return;
		//Add the new randomly chosen point to the array
		var pathLength = this.pathLengthBase + Math.random() * this.pathLengthVariation;
		for (var len = 0; len < pathLength; len++)
			//Points with an alpha value > 1 will be invisible until the alpha value will be below 1. 
			// This way we can create a moving line within a single call of this function
			this.dynamicPoints.push({x: x+x_dir*len, y: y+y_dir*len, light:light, alpha:(1+len/10)});
	}
}

//Draw the supplied text to a random position on the canvas
//If no text is supplied: Credit the author :)
//Uses object vars: 	rasterWidth, rasterHeight, rasterSize, dynamicLightnessBase, dynamicLightnessVariation, dynamicPoints
//Uses external vars:	font6x11
//Uses own functions:	valid
AnimatedBackground.prototype.drawText = function(text) {
	var font;
	//Check if (external) font has been loaded
	if ( (AnimatedBackground.staticFontStatus != AnimatedBackground.FONT_LOADED) && typeof(font6x11) == 'undefined') {
		console.log("Text effects deactivated: Couldn't load font");
		return;
	}
	
	if (!text || text.length == 0)
		text = "[by Nippey]";
	var x = Math.floor(Math.random() * (this.rasterWidth-text.length*6));
	var y = Math.floor(Math.random() * (this.rasterHeight-11));
	var light = this.dynamicLightnessBase + this.dynamicLightnessVariation;

	for ( var i = 0, code = text.charCodeAt(0); i < text.length; i++, code = text.charCodeAt(i) ) {	//Scan through the text-string
		for ( var line = 0; line < 11; line ++ ) {								//Scan through the lines of the character
			for ( var bit = 0, mask = 0x80; bit < 6; bit++, mask/=2 ) {			//Scan through the bits of one line
				if (AnimatedBackground.staticFontStatus == AnimatedBackground.FONT_LOADED)
					(AnimatedBackground.staticFont[code*11+line] & mask) && this.dynamicPoints.push({x: x+(i*6+bit), y: y+line, light:light, alpha:1});
				else
					(font6x11[code*11+line] & mask) && this.dynamicPoints.push({x: x+(i*6+bit), y: y+line, light:light, alpha:1});
			}
		}
	}
}

//Draw the points in the points-list and reduce each point's alpha value on each access. Completely transparent points will be removed
//Uses object vars: 	ctx, hue, saturation, blockSize, fadeAmount, dynamicPoints
//Uses own functions:	valid
AnimatedBackground.prototype.fadeOut = function() {
	//Calculate fadeAmount based on the frame rate
	var fadeAmount = this.fadeAmount*this.frameTime/1000;
	//Redraw each of the last <lastPointPos> Points with a smaller alpha value
	this.ctx.clearRect(0, 0, this.cWidth, this.cHeight);
	//this.ctx.beginPath();
	for (var i = 0; i < this.dynamicPoints.length; i++) {
		switch (this.drawingStyle) {
			case AnimatedBackground.DS_RECT:
				this.ctx.fillStyle = "hsla(" + this.hue + ", " + this.saturation + "%, " + this.dynamicPoints[i].light + "%, " + this.dynamicPoints[i].alpha.valid(0, 1).toFixed(4) + ")";
				this.ctx.fillRect(this.dynamicPoints[i].x * this.rasterSize, this.dynamicPoints[i].y * this.rasterSize, this.blockSize, this.blockSize);
				break;
			case AnimatedBackground.DS_CIRCLE_PRE:
			case AnimatedBackground.DS_CIRCLE:
				this.ctx.fillStyle = "hsla(" + this.hue + ", " + this.saturation + "%, " + this.dynamicPoints[i].light + "%, " + this.dynamicPoints[i].alpha.valid(0, 1).toFixed(4) + ")";
				this.ctx.beginPath();
				this.ctx.moveTo(this.dynamicPoints[i].x * this.rasterSize, this.dynamicPoints[i].y * this.rasterSize);
				this.ctx.arc(this.dynamicPoints[i].x * this.rasterSize + this.blockSize / 2, this.dynamicPoints[i].y * this.rasterSize + this.blockSize / 2, this.blockSize / 2, 2 * Math.PI, false);
				this.ctx.fill();
				break;
		}
		
		if ( this.dynamicPoints[i].alpha > 0)
			this.dynamicPoints[i].alpha = Math.max(this.dynamicPoints[i].alpha - fadeAmount, 0);
		else 
			this.dynamicPoints.splice(i--,1);
	}
	//this.ctx.fill();
}

//Removes the leftovers from the resize operation
//Uses object vars: 	ID
//Uses own functions:	-
AnimatedBackground.prototype.cleanUp = function() {
	var oldC = document.getElementById("old_static_canvas_"+this.ID);
	oldC.parentNode.removeChild(oldC);
	var oldC = document.getElementById("old_dynamic_canvas_"+this.ID);
	oldC.parentNode.removeChild(oldC);
}

//Called regularily in order to manage rendering of the dynamic background
//Uses object vars: 	resizedEvent, frameSkippingCounter
//Uses own functions:	liveBackground, initBackground, cleanUp, drawDots, drawLines, fadeOut
AnimatedBackground.prototype.liveBackground = function() {	
	//Using lexical closure as setInterval or event handlers in general would change from AnimatedBackground's context to global window context
	var that = this;
	//setTimeout(function() {that.liveBackground();}, this.frameTime);
	if (!this.stopAnimation)
		window.requestAnimationFrame( function() {that.liveBackground();} );
	
	//Skip rendering if this frame should be skipped
	this.frameSkippingCounter--;
	if ( this.frameSkippingCounter > 0)
		return;
	//We get here on (this.frameSkippingCounter == 0), so set it again
	this.frameSkippingCounter = this.frameSkippingValue;

	//Calculate time since last frame
	/*var elapsedTime =*/ this.measureFrameTime();
	
	
	//Adapt canvas-sizes on a resize-event of the browser window
	//if (this.resizedEvent || this.refreshBG) {
	if (this.resizeDetector.check() || this.refreshBG) {
		this.resizedEvent = false;
		this.initBackground();
		this.cleanUp();
		this.refreshBG = false;
	}
	//Do the usual drawing stuff
	this.drawDots();
	this.drawLines();
	this.fadeOut();
}

//Add the animated backround to the given HTMLElement
//The top-element requires the attribute "position:{relative|absolute|fixed};"  -  "position:static;" won't work
//Uses object vars: 	frameTime
//Uses own functions:	initBackground, liveBackground
AnimatedBackground.prototype.createElementBackground = function(htmlElement) {
	if (this.created) throw "This AnimatedBackground instance has already been assigned to a DOM Element!";
	this.created = true;
	this.resizeDetector = new ResizeDetector(htmlElement);
	
	//Initialise background and start interval
	this.refreshBG = false;	//Refreshing is unnecessary if the Animator hasn't been started yet 
	this.initBackground(htmlElement);
	this.liveBackground();
	return this;
}

//Add the animated background to the complete Page
//A top element for the canvases is automatically created
//Uses object vars: 	frameTime
//Uses own functions:	initBackground, liveBackground
AnimatedBackground.prototype.createWebsiteBackground = function() {
	if (this.created) throw "This AnimatedBackground instance has already been assigned to a DOM Element!";
	this.created = true;
	this.resizeDetector = new ResizeDetector();

	//Create background container for complete websize background
	var bgContainer = document.createElement("div");
	bgContainer.setAttribute("style", "position:fixed; top:0px; left:0px; width:100%; height:100%; overflow:hidden; z-index:-4");
	if (document.body.firstChild)
		document.body.insertBefore(bgContainer, document.body.firstChild);
	else
		document.body.appendChild(bgContainer);
	//Initialise background and start interval
	this.refreshBG = false;	//Refreshing is unnecessary if the Animator hasn't been started yet 
	this.initBackground(bgContainer);
	this.liveBackground();
	return this;
}

//Change the variable properties of the animation and refresh it, if necessary
//Uses object vars: 	<ALL CHANGEABLE>
AnimatedBackground.prototype.setProperty = function(props) {
	//0: Refresh nothing;  1:Refresh BG; 2:Refresh FG; 3:Refresh ALL
	//Note: Foreground is refreshed each frame anyway and old values will fade away over the next frames
	//      So: 'Refresh FG' won't do anything now
	var availableProps = {
		hue:{refresh:1,min:0,max:360}, saturation:{refresh:1,min:0,max:100}, 
		staticLightnessBase:{refresh:1,min:0,max:100}, staticLightnessVariation:{refresh:1,min:0,max:100}, 
		dynamicLightnessBase:{refresh:2,min:0,max:100}, dynamicLightnessVariation:{refresh:2,min:0,max:100}, 
		blockSize:{refresh:3,min:0,max:100}, fadeAmount:{refresh:2,min:0.1,max:10}, 
		pathPauseBase:{refresh:2,min:0,max:100}, pathPauseVariation:{refresh:2,min:0,max:100}, 
		pathLengthBase:{refresh:2,min:0,max:100}, pathLengthVariation:{refresh:2,min:0,max:100}, 
		drawingStyle:{refresh:3,min:0,max:2}, noOfLightnessShades:{refresh:3,min:1,max:10} };
	var keys = Object.keys(props);

	for (var k in keys) {
		var key = keys[k];
		if ( availableProps.hasOwnProperty(key) && this[key] != props[key]) {
			this[key] = props[key];
			if (key == "blockSize") this.rasterSize = this.blockSize + 1;
			if (key == "noOfLightnessShades") this.pattern = [];
			this.refreshBG |= (availableProps[key].refresh & 0x01);
		} else console.log("Unknown property: " + key);
	}
	return this;
}

//
//Uses object vars: 	<ALL CHANGEABLE>
AnimatedBackground.prototype.getProperty = function(props) {
	var availableProps = {
		hue:{refresh:1,min:0,max:360,step:10}, saturation:{refresh:1,min:0,max:100}, 
		staticLightnessBase:{refresh:1,min:0,max:100}, staticLightnessVariation:{refresh:1,min:0,max:100}, 
		dynamicLightnessBase:{refresh:2,min:0,max:100}, dynamicLightnessVariation:{refresh:2,min:0,max:100}, 
		blockSize:{refresh:3,min:0,max:100}, fadeAmount:{refresh:2,min:0.1,max:10,step:0.1}, 
		pathPauseBase:{refresh:2,min:0,max:100}, pathPauseVariation:{refresh:2,min:0,max:100}, 
		pathLengthBase:{refresh:2,min:0,max:100}, pathLengthVariation:{refresh:2,min:0,max:100}, 
		drawingStyle:{refresh:3,min:0,max:2}, noOfLightnessShades:{refresh:3,min:1,max:10} };
	
	props = props || availableProps;	//If no argument defined, get all
	var keys = Object.keys(props);
	var returnObject = {};
	
	for (var key in keys) {
		if ( availableProps.hasOwnProperty(keys[key]) ) {
			returnObject[keys[key]] = {min:availableProps[keys[key]].min, max:availableProps[keys[key]].max, value:this[keys[key]], step:availableProps[keys[key]].step };
		} else console.log("Unknown property: " + keys[key]);
	}
	return returnObject;
}

//Resumes a previously stopped animation
//Uses object vars: 	created, stopAnimation
//Uses own functions:	liveBackground
AnimatedBackground.prototype.start = function() {
	if (!this.created) throw "This AnimatedBackground instance is not assigned to a DOM Element! Use createElementBackground or createWebsiteBackground";
	if (!this.stopAnimation) throw "This instance of AnimatedBackground is already running!";
	this.stopAnimation = false;
	this.measureFrameTime();
	this.liveBackground();
	return this;
}

//Stops a running animation
//Uses object vars: 	stopAnimation
//Uses own functions:	liveBackground
AnimatedBackground.prototype.stop = function() {
	if (this.stopAnimation) throw "This instance of AnimatedBackground is already stopped!";
	this.stopAnimation = true;
	return this;
}

//Returns the current running state of the Background
//Uses object vars: 	created, stopAnimation
AnimatedBackground.prototype.isRunning = function() {
	return (this.created && !this.stopAnimation);
}


if (Object.seal) {
	Object.seal(AnimatedBackground);
	Object.seal(AnimatedBackground.prototype);
}