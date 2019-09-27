/*
main.js
*/


const CONFIG = {
	'interval': 250,
	'_grassValley': {
		'location': 'California, USA',
		'timezone': 'America/Los_Angeles',
		'latitude': 39.2188492, 
		'longitude': -121.0887236
	},
	'clock1': {
		'location': 'Chicago, USA',
		'timezone': 'America/Chicago',
		'latitude': 41.8339042,
		'longitude': -88.0121579
	},
	'clock2': {
		'location': 'Sydney, Australia',
		'timezone': 'Australia/Sydney',
		'latitude': -33.8473567,
		'longitude': 150.6517798
	}
}

function main() {

	var interval = 	CONFIG['interval']

	var clock1Background = document.getElementById('clock1-background')
	var clock2Background = document.getElementById('clock2-background')
	var clock1Overlay = document.getElementById('clock1-overlay')
	var clock2Overlay = document.getElementById('clock2-overlay')

	clock1 = new Clock(clock1Background, clock1Overlay, CONFIG['clock1'])
	clock2 = new Clock(clock2Background, clock2Overlay, CONFIG['clock2'])

	clock1.updateTime()
	clock2.updateTime()
	clock1.background.draw()
	clock2.background.draw()

	document.getElementById('clock1-desc').innerHTML  = CONFIG['clock1']['location']
	document.getElementById('clock2-desc').innerHTML  = CONFIG['clock2']['location']


	setInterval(() => {			// Main loop
		clock1.updateTime()
		clock2.updateTime()

		if(backgroundRefresh(clock1) || backgroundRefresh(clock2)) {
			clock1.background.draw()
			clock2.background.draw()
		}

		clock1.overlay.draw()
		clock2.overlay.draw()
	}, interval)
}

/*
Determines whether to refresh the background
*/
function backgroundRefresh(clock) {
	// refresh if date changed
	var dateEqual = (clock.background.dateWidget.day == clock.time.getDate())
	var dayOfWkEqual = (clock.background.dateWidget.dayOfWk == clock.time.getDay())
	if(!dateEqual || !dayOfWkEqual)
		return true

	// refresh if AM / PM Changed
	if(clock.background.ampmWidget.value != (clock.time.getHours() < 12 ? 'AM' : 'PM'))
		return true

	// refresh if the night mode needs to be activated or deactivated
	var sunriseWidget = clock.background.sunriseWidget
	if(sunriseWidget.date != clock.time.getDate())	// recalc on day change
		return true
	var isDaylight = sunriseWidget.sunrise < clock.time && sunriseWidget.sunset > clock.time
	if (isDaylight && sunriseWidget.isNight())
		return true
	var isNight = sunriseWidget.sunrise > clock.time || sunriseWidget.sunset < clock.time
	if (isNight && sunriseWidget.isDay())
		return true
	return false
}

main()

/*
Clock object: all the paramaters and methods necessary to draw a clock
*/
function Clock(background, overlay, config) {
	// variable definitions
	this.height = background.height
	this.overlayCtx = overlay.getContext('2d')
	this.backgroundCtx = background.getContext('2d')
	this.radius = radius = (this.height/2) * 0.9
	
	this.backgroundCtx.translate(this.height/2, this.height/2)
	this.overlayCtx.translate(this.height/2, this.height/2)

	this.time
	this.timezone = config['timezone']
	this.latitude = config['latitude']
	this.longitude = config['longitude']

	this.background = new ClockBackground(this.backgroundCtx, this.radius, this.height, this.timezone, this.latitude, this.longitude)
	this.overlay = new ClockOverlay(this.overlayCtx, this.radius, this.height)

	// function definitions
	this.updateTime = updateTime

	function updateTime() {
		var d = new Date().toLocaleString("en-US", {timeZone:this.timezone})
		this.time = new Date(Date.parse(d))

		this.background.updateTime(this.time)
		this.overlay.updateTime(this.time)
	}

	// getRadius() is a static used in the constructor method
	function getRadius(height, ctx) {
		// get radius
		radius = height / 2
		ctx.translate(radius, radius)
		radius *= 0.90
		return radius
	}
}



function ClockOverlay(ctx, radius, height) {
	/* 
	 * ClockOverlay handles the hands of the clock
	 * since they are drawn much more frequently
	 * than the background components.
	 */
	this.ctx = ctx
	this.radius = radius
	this.height = height
	this.time

	this.draw = draw 		// function definitions
	this.clear = clear
	this.updateTime = updateTime

	function draw() {
		this.clear()
		
		drawCenter(this.ctx, this.radius)
		drawHourHand(this.ctx, this.radius, this.time)
		drawMinuteHand(this.ctx, this.radius, this.time)
		drawSecondHand(this.ctx, this.radius, this.time)
	}

	function clear() {
		r = this.radius
		h = this.height
		this.ctx.clearRect(-r, -r, h, h);
	}

	function updateTime(time) {
		this.time = time
	}

	function drawCenter(ctx, radius) {
		// center of the clock
		ctx.beginPath()
		ctx.arc(0, 0, radius * 0.05, 0, 2 * Math.PI)
		ctx.fill()
	}

	function drawHourHand(ctx, radius, time) {
		var hour = time.getHours() % 12
		var minute = time.getMinutes()
		var second = time.getSeconds()
		hour = (hour*Math.PI/6)+(minute*Math.PI/(6*60))+(second*Math.PI/(360*60))
		var l= radius*0.5
		var w = radius*0.04
		_drawHand(ctx, hour, l, w)
	}

	function drawMinuteHand(ctx, radius, time) {
		var minute = time.getMinutes()
		var second = time.getSeconds()
		minute = (minute*Math.PI/30)+(second*Math.PI/(30*60))
		var l= radius*0.8
		var w = radius*0.03
		_drawHand(ctx, minute, l, w)
	}

	function drawSecondHand(ctx, radius, time) {
		var second = time.getSeconds()
		second = (second*Math.PI/30)
		var l= radius*0.9
		var w = radius*0.01
		_drawHand(ctx, second, l, w)
	}


	// static method for drawing the hand
	function _drawHand(ctx, pos, length, width) {
		ctx.beginPath()
		ctx.lineWidth = width
		ctx.lineCap = 'round'
		ctx.moveTo(0,0)
		ctx.rotate(pos)
		ctx.lineTo(0, -length)
		ctx.stroke()
		ctx.rotate(-pos)
	}
}


function ClockBackground(ctx, radius, height, timezone, lat, lon) {
	/*
	 * ClockBackground handles all the functionality associated
	 * with the backround:
	 *		- Drawing numbers
	 *		- Drawing the face
	 *		- Drawing widgets
	 *		- Handling night mode
	 */ 
	this.ctx = ctx
	this.radius = radius
	this.height = height
	this.time

	this.ampmWidget = new AMPMWidget(this.ctx,this.radius)
	this.dateWidget = new DateWidget(this.ctx, this.radius)
	this.sunriseWidget = new SunriseWidget(this.ctx, this.radius, timezone, lat, lon)

	// Object function definitions
	this.draw = draw
	this.clear = clear
	this.updateTime = updateTime

	function draw() {
		this.clear()

		drawFace(this.ctx,this.radius)		// internal functions
		drawNumbers(this.ctx,this.radius)
		// draw widgets
		drawWidget(this.ampmWidget, this.time)
		drawWidget(this.dateWidget, this.time)
		drawWidget(this.sunriseWidget, this.time)
	}

	function clear() {
		r = this.radius
		h = this.height
		this.ctx.clearRect(-r, -r, h, h);
	}

	function updateTime(time) {
		this.time = time
	}

	function drawFace(ctx, radius) {
		// draw ring around clock
		ctx.beginPath()
		ctx.arc(0, 0, radius, 0, 2 * Math.PI)
		ctx.lineWidth = radius*0.02
		ctx.stroke()
	}

	function drawNumbers(ctx, radius) {
		ctx.font = radius * 0.15 + 'px arial'
		ctx.textBaseline = 'middle'
		ctx.textAlign = 'center'
		for(var i = 1; i < 13; i++){
			var ang = i * Math.PI / 6
			ctx.rotate(ang)
			ctx.translate(0, -radius * 0.85)
			ctx.rotate(-ang)
			ctx.fillText(i.toString(), 0, 0)
			ctx.rotate(ang)
			ctx.translate(0, radius * 0.85)
			ctx.rotate(-ang)
		}
	}

	function drawWidgets(time) {
		this.ampmWidget.update(time)
		this.ampmWidget.draw()

		this.dateWidget.update(time)
		this.dateWidget.draw()

		this.sunriseWidget.update(time)
		this.sunriseWidget.draw()
	}

	function drawWidget(widget, time) {
		widget.update(time)
		widget.draw()
	}
}