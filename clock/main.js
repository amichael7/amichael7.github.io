/*
main.js
*/


function main() {
	const interval = 500

	var clock1Background = document.getElementById('clock1-background')
	var clock2Background = document.getElementById('clock2-background')
	var clock1Overlay = document.getElementById('clock1-overlay')
	var clock2Overlay = document.getElementById('clock2-overlay')

	clock1 = new Clock(clock1Background, clock1Overlay)
	clock2 = new Clock(clock2Background, clock2Overlay, 17)

	clock1.updateTime()
	clock2.updateTime()
	clock1.drawBackground()
	clock2.drawBackground()

	lastRefresh = 0
	setInterval(() => {			// Main loop
		clock1.updateTime()
		clock2.updateTime()

		if(backgroundRefresh(clock1) || backgroundRefresh(clock2)) {
			clock1.drawBackground()
			clock2.drawBackground()
		}

		clock1.drawOverlay()
		clock2.drawOverlay()
	}, interval)
}

/*
Determines whether to refresh the background
*/
function backgroundRefresh(clock) {
	// refresh if date changed
	var dateEqual = (clock.dateWidget.day == clock.time.getDate())
	var monthEqual = (clock.dateWidget.month == clock.time.getMonth())
	if(!dateEqual || !monthEqual) {
		return true
	}

	// refresh if AM / PM Changed
	if(clock.ampmWidget.value != (clock.time.getHours() < 12 ? 'AM' : 'PM')) {
		return true
	}

	// refresh if the weather needs to be updated
	return false
}

main()

/*
Clock object: all the paramaters and methods necessary to draw a clock
*/
function Clock(background, overlay, offset) {
	// variable definitions
	this.height = background.height
	this.overlayCtx = overlay.getContext('2d')
	this.backgroundCtx = background.getContext('2d')
	this.radius = radius = (this.height/2) * 0.9
	
	this.backgroundCtx.translate(this.height/2, this.height/2)
	this.overlayCtx.translate(this.height/2, this.height/2)

	this.color = '#888'
	this.offset = offset == null ? 0 : offset
	this.time = new Date()

	this.ampmWidget = new AMPMWidget(this.backgroundCtx,this.radius)
	this.dateWidget = new DateWidget(this.backgroundCtx, this.radius)
	this.weatherWidget = new WeatherWidget(this.backgroundCtx, this.radius)

	// function definitions
	this.drawBackground = drawBackground
	this.drawOverlay = drawOverlay
	this.drawFace = drawFace
	this.drawNumbers = drawNumbers
	this.drawTime = drawTime
	this.drawHourHand = drawHourHand
	this.drawMinuteHand = drawMinuteHand
	this.drawSecondHand = drawSecondHand
	this.updateTime = updateTime
	this.clearOverlay = clearOverlay
	this.clearBackground = clearBackground
	this.drawWidgets = drawWidgets


	// this is the main method
	function drawBackground() {
		this.clearBackground()
		this.drawFace()
		this.drawNumbers()
		this.drawWidgets()
	}

	function drawOverlay() {
		this.clearOverlay()
		this.drawTime()
	}


	function updateTime() {
		this.time = new Date()
		var hr = this.time.getHours() + this.offset
		this.time.setHours(hr)
	}

	function drawFace() {
		// draw ring around clock
		this.backgroundCtx.beginPath()
		this.backgroundCtx.arc(0, 0, this.radius, 0, 2 * Math.PI)
		this.backgroundCtx.lineWidth = this.radius*0.02
		this.backgroundCtx.strokeStyle = this.color
		this.backgroundCtx.stroke()

		// center of the clock
		this.backgroundCtx.beginPath()
		this.backgroundCtx.arc(0, 0, this.radius * 0.05, 0, 2 * Math.PI)
		this.backgroundCtx.fillStyle = this.color
		this.backgroundCtx.fill()
	}

	function drawWidgets() {
		this.ampmWidget.update(this.time)
		this.ampmWidget.draw()

		this.dateWidget.update(this.time)
		this.dateWidget.draw()

		this.weatherWidget.update(this.time)
		this.weatherWidget.draw()
	}


	function drawNumbers() {
		this.backgroundCtx.font = this.radius * 0.15 + 'px arial'
		this.backgroundCtx.textBaseline = 'middle'
		this.backgroundCtx.textAlign = 'center'
		for(var i = 1; i < 13; i++){
			var ang = i * Math.PI / 6
			this.backgroundCtx.rotate(ang)
			this.backgroundCtx.translate(0, -this.radius * 0.85)
			this.backgroundCtx.rotate(-ang)
			this.backgroundCtx.fillText(i.toString(), 0, 0)
			this.backgroundCtx.rotate(ang)
			this.backgroundCtx.translate(0, this.radius * 0.85)
			this.backgroundCtx.rotate(-ang)
		}
	}

	function drawTime(){
		this.drawHourHand()
		this.drawMinuteHand()
		this.drawSecondHand()		
	}

	function drawHourHand(context) {
		var hour = this.time.getHours() % 12
		var minute = this.time.getMinutes()
		var second = this.time.getSeconds()
		hour = (hour*Math.PI/6)+(minute*Math.PI/(6*60))+(second*Math.PI/(360*60))
		var l= this.radius*0.5
		var w = this.radius*0.04
		drawHand(this.overlayCtx, hour, l, w)
	}

	function drawMinuteHand(context) {
		var minute = this.time.getMinutes()
		var second = this.time.getSeconds()
		minute = (minute*Math.PI/30)+(second*Math.PI/(30*60))
		var l= this.radius*0.8
		var w = this.radius*0.03
		drawHand(this.overlayCtx, minute, l, w)
	}

	function drawSecondHand() {
		var second = this.time.getSeconds()
		second = (second*Math.PI/30)
		var l= this.radius*0.9
		var w = this.radius*0.01
		drawHand(this.overlayCtx, second, l, w)
	}

	function clearBackground() {
		this.backgroundCtx.clearRect(-this.radius, -this.radius, this.height, this.height);
	}

	function clearOverlay() {
		this.overlayCtx.clearRect(-this.radius, -this.radius, this.height, this.height);
	}


	// static method for drawing the hand
	function drawHand(ctx, pos, length, width) {
		ctx.beginPath()
		ctx.lineWidth = width
		ctx.lineCap = 'round'
		ctx.moveTo(0,0)
		ctx.rotate(pos)
		ctx.lineTo(0, -length)
		ctx.stroke()
		ctx.rotate(-pos)
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


function AMPMWidget(ctx, clockRadius, time) {
	this.ctx = ctx 			// variable definitions
	this.clockRadius = clockRadius
	this.value

	this.draw = draw 		// function definitions
	this.update = update

	function update(time) {
		this.value = time.getHours() < 12 ? 'AM' : 'PM'
	}

	function draw() {
		var radius = this.clockRadius * 0.2
		var distFromCenter = this.clockRadius*0.4

		// draw widget border
		this.ctx.beginPath()
		this.ctx.arc(distFromCenter, 0, radius, 0, 2 * Math.PI)
		this.ctx.lineWidth = radius*0.02
		ctx.stroke()

		// draw widget text
		this.ctx.font = radius * 0.6 + 'px arial'
		this.ctx.textBaseline = 'middle'
		this.ctx.textAlign = 'center'
		this.ctx.fillText(this.value, distFromCenter, 0)
	}
}


function DateWidget(ctx, clockRadius, time) {
	this.ctx = ctx 			// variable definitions
	this.clockRadius = clockRadius
	this.day
	this.month

	this.draw = draw 		// function definitions
	this.update = update

	function update(time) {
		this.day = time.getDate()
		this.month = time.getMonth()
	}
	
	function draw() {
		var radius = this.clockRadius * 0.2
		var distFromCenter = this.clockRadius*0.4
		
		// draw widget border
		this.ctx.beginPath()
		this.ctx.arc(-distFromCenter, 0, radius, 0, 2 * Math.PI)
		this.ctx.lineWidth = radius*0.02
		ctx.stroke()


		fontSize = radius*0.75
		this.ctx.font = fontSize + 'px arial'
		this.ctx.textBaseline = 'middle'
		this.ctx.textAlign = 'center'
		this.ctx.fillText(this.day.toString(), -distFromCenter,-fontSize*0.3)
		this.ctx.font = fontSize*0.70 + 'px arial'
		this.ctx.textBaseline = 'middle'
		this.ctx.textAlign = 'center'
		this.ctx.fillText(getMonthStr(this.month), -distFromCenter, fontSize*0.7)
	}

	function getMonthStr(month) {
		const monthStr = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
		return monthStr[month]
	}
}


function WeatherWidget(ctx, clockRadius) {
	this.ctx = ctx 			// variable definitions
	this.clockRadius = clockRadius

	this.draw = draw 		// function definitions
	this.update = update

	function update() {
		// body
	}

	function draw() {
		var radius = this.clockRadius * 0.25
		var distFromCenter = this.clockRadius*0.4

		// draw widget border
		this.ctx.beginPath()
		this.ctx.arc(0, -distFromCenter, radius, 0, 2*Math.PI)
		this.ctx.lineWidth = radius*0.02
		this.ctx.stroke()

		// draw the widget
		this.ctx.arc(0,-distFromCenter, radius-2, 0, Math.PI*2) // you can use any shape
		var img = new Image()
		img.onload = () => {
			ctx.clip()
			ctx.drawImage(img, -radius, -distFromCenter-radius, radius*2, radius*2);
		}
		img.src = 'weather.png';
	}
}
