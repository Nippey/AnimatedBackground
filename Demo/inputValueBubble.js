/* Source: http://css-tricks.com/value-bubbles-for-range-inputs/ */
/* Modified. */

var offset = -15;
var sliderCrop = 11;

function modifyOffset() {
	var el, newPoint, newPlace, siblings, k, outputTag;
	width    = this.offsetWidth;
	newPoint = (this.value - this.getAttribute("min")) / (this.getAttribute("max") - this.getAttribute("min"));
	if (newPoint < 0) { newPlace = 0;  }
	else if (newPoint > 1) { newPlace = width; }
	else { newPlace = (width-sliderCrop) * newPoint;}
	
	siblings = this.parentNode.children;
	for (var i = 0; i < siblings.length; i++) {
		if ( (siblings[i].getAttribute("for") == this.name) && (siblings[i].nodeName == "OUTPUT")) {
			outputTag = siblings[i];
			break;
		}
	}
	
	if (outputTag) {
		outputTag.style.left       = newPlace + "px";
		outputTag.style.marginLeft = offset + "px";
		outputTag.innerHTML        = this.value;
	}
}

function modifyMinMax(rangeElement) {
	if (rangeElement.name == "") return;
	var siblings = rangeElement.parentNode.querySelectorAll("span[for="+rangeElement.name+"]");
	for(var sibling in siblings) {
		if (siblings[sibling].className == "minOutput")
			siblings[sibling].style.marginLeft=offset+"px";
		else if (siblings[sibling].className == "maxOutput") {
			siblings[sibling].style.marginLeft=offset+"px";
			siblings[sibling].style.left= (parseInt(rangeElement.offsetWidth)-sliderCrop)+"px";
		}
	}
}

function modifyInputs() {
	var inputs = document.getElementsByTagName("input");
	for (var i = 0; i < inputs.length; i++) {
		if (inputs[i].getAttribute("type") == "range") {
			inputs[i].onchange = modifyOffset;
			modifyMinMax(inputs[i]);
			
			// the following taken from http://stackoverflow.com/questions/2856513/trigger-onchange-event-manually
			if ("fireEvent" in inputs[i]) {
				inputs[i].fireEvent("onchange");
			} else {
				var evt = document.createEvent("HTMLEvents");
				evt.initEvent("change", false, true);
				inputs[i].dispatchEvent(evt);
			}
		}
	}
}

/* End of source: http://css-tricks.com/value-bubbles-for-range-inputs/ */
