/*
 * widgets.js
 */

function AMPMWidget(ctx, clockRadius, time) {
	/*
	 * This widget simply displays either "AM" or
	 * "PM" on the clock's face.  The widget handles
	 * its own position and sizing etc.
	 */
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
	this.dayOfWk

	this.draw = draw 		// function definitions
	this.update = update

	function update(time) {
		this.day = time.getDate()
		this.dayOfWk = time.getDay()
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
		this.ctx.fillText(getDayOfWkStr(this.dayOfWk), -distFromCenter, fontSize*0.7)
	}

	function getDayOfWkStr(dayOfWk) {
		const dayOfWkStr = ['SUN','MON','TUE','WED','THU','FRI','SAT']
		return dayOfWkStr[dayOfWk]
	}
}


function SunriseWidget(ctx, clockRadius, timezone, latitude, longitude) {
	this.ctx = ctx 			// variable definitions
	this.clockRadius = clockRadius

	this.timezone = timezone
	this.latitude = latitude
	this.longitude = longitude

	this.date
	this.sunrise
	this.sunset
	this.mode

	this.draw = draw 		// function definitions
	this.update = update
	this.isDay = isDay
	this.isNight = isNight


	function update(time) {
		this.date = time.getDate()

		var sc = new SunriseCalc(time, latitude, longitude)
		
		// sunrise
		var rise = sc.calcSunrise()
		this.sunrise = convertTimeToTZ(rise, this.timezone)

		// sunset
		var set = sc.calcSunset()
		this.sunset = convertTimeToTZ(set, this.timezone)

		if(time > this.sunrise && time < this.sunset) {
			this.mode = 'day'
		} else {
			this.mode = 'night'
		}
		
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
		img.src = this.isNight() ? 'img/night.png' : 'img/day.png';
	}

	function isDay() {
		return this.mode === 'day'
	}

	function isNight() {
		return this.mode === 'night'
	}

	function convertTimeToTZ(time, timezone) {
		/*
		 * Static method to convert a UTC timestamp
		 * to a given timezone.
		 */
		t = time.toLocaleString("en-US", {timeZone:timezone})
		t = new Date(Date.parse(t))

		// correct inadvertent date shifting
		var d = new Date().toLocaleString("en-US", {timeZone:timezone})
		d = new Date(Date.parse(d))
		t.setDate(d.getDate())
		t.setFullYear(d.getFullYear())
		t.setMonth(d.getMonth())
		
		return t
	}
}
