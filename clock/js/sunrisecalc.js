/*
sunrisecalc.js

Calculates the sunrise and sunset times.  This file
consists of a Sunrise Calculator (SunriseCalc) and 
a helper class (SunriseCalcHelper).  The SunriseCalc
class is designed to be the public facing API that 
neatly provides the sunrise and sunset, while the
SunriseCalcHelper provides most of the messier
math functionality.

Adapted from: https://www.esrl.noaa.gov/gmd/grad/solcalc/

Start (civil dawn):   -6 degrees
End (Golden hour):    +6 degrees
*/

function SunriseCalcHelper() {
	/*
	 * This static helper class provides all the methods
	 * and arithmetic functions required by the SunriseCalc
	 * class.  The interface conceals any methods not used
	 * directly by SunriseCalc providing a useful layer
	 * of abstraction.
	 */

	this.getJulianDay = getJulianDay
	this.calcEquationOfTime = calcEquationOfTime
	this.calcSunDeclination = calcSunDeclination
	this.calcHourAngleSunrise = calcHourAngleSunrise
	this.radToDeg = radToDeg


	function degToRad(angleDeg) {
		return (Math.PI * angleDeg / 180.0);
	}

	function radToDeg(angleRad) {
		return (180.0 * angleRad / Math.PI);
	}

	function calcObliquityCorrection(t) {
		var seconds = 21.448 - t*(46.8150 + t*(0.00059 - t*(0.001813)));
		var e0 = 23.0 + (26.0 + (seconds/60.0))/60.0;
		var omega = 125.04 - 1934.136 * t;
		var e = e0 + 0.00256 * Math.cos(degToRad(omega));
		return e;       // in degrees
	}

	function calcGeomMeanLongSun(t) {
	  var L0 = 280.46646 + t * (36000.76983 + t*(0.0003032))
	  return L0 % 360.0     // in degrees
	}

	function calcEccentricityEarthOrbit(t) {
	  var e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
	  return e;     // unitless
	}

	function calcGeomMeanAnomalySun(t) {
	  var M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
	  return M;     // in degrees
	}

	function calcSunApparentLong(t) {
		var o = calcSunTrueLong(t);
		var omega = 125.04 - 1934.136 * t;
		var lambda = o - 0.00569 - 0.00478 * Math.sin(degToRad(omega));
		return lambda;		// in degrees
	}


	function calcSunTrueLong(t) {
		var l0 = calcGeomMeanLongSun(t);
		var c = calcSunEqOfCenter(t);
		var O = l0 + c;
		return O;		// in degrees
	}


	function calcSunEqOfCenter(t) {
		var m = calcGeomMeanAnomalySun(t);
		var mrad = degToRad(m);
		var sinm = Math.sin(mrad);
		var sin2m = Math.sin(2*mrad);
		var sin3m = Math.sin(3*mrad);
		var C = sinm * (1.914602 - t * (0.004817 + 0.000014 * t)) + sin2m * (0.019993 - 0.000101 * t) + sin3m * 0.000289;
		return C;		// in degrees
	}

	function calcEquationOfTime(t) {
		var epsilon = calcObliquityCorrection(t);
		var l0 = calcGeomMeanLongSun(t);
		var e = calcEccentricityEarthOrbit(t);
		var m = calcGeomMeanAnomalySun(t);

		var y = Math.tan(degToRad(epsilon)/2.0);
		y *= y;

		var sin2l0 = Math.sin(2.0 * degToRad(l0));
		var sinm   = Math.sin(degToRad(m));
		var cos2l0 = Math.cos(2.0 * degToRad(l0));
		var sin4l0 = Math.sin(4.0 * degToRad(l0));
		var sin2m  = Math.sin(2.0 * degToRad(m));

		var Etime = y * sin2l0 - 2.0 * e * sinm + 4.0 * e * y * sinm * cos2l0 - 0.5 * y * y * sin4l0 - 1.25 * e * e * sin2m;
		return radToDeg(Etime)*4.0;   // in minutes of time
	}

	function calcSunDeclination(t) {
		var e = calcObliquityCorrection(t);
		var lambda = calcSunApparentLong(t);
		var sint = Math.sin(degToRad(e)) * Math.sin(degToRad(lambda));
		var theta = radToDeg(Math.asin(sint));
		return theta;		// in degrees
	}

	function calcHourAngleSunrise(lat, solarDec) {
		var latRad = degToRad(lat);
		var sdRad  = degToRad(solarDec);
		var HAarg = (Math.cos(degToRad(90.833))/(Math.cos(latRad)*Math.cos(sdRad))-Math.tan(latRad) * Math.tan(sdRad));
		var HA = Math.acos(HAarg);
		return HA;		// in radians (for sunset, use -HA)
	}


	function getJulianDay(time) {
		var month = time.getMonth() + 1
		var day = time.getDate()
		var year = time.getFullYear()

		var A = Math.floor(year/100)
		var B = 2 - A + Math.floor(A/4)
		var julianDay = Math.floor(365.25*(year + 4716)) + Math.floor(30.6001*(month+1)) + day + B - 1524.5
		return julianDay
	}

	function calcSunriseSetUTC(rise, jd, latitude, longitude) {
		var t = (jd - 2451545.0) / 36525.0;
		var eqTime = calcEquationOfTime(t);
		var solarDec = calcSunDeclination(t);	// +/- 6 degrees
		var hourAngle = calcHourAngleSunrise(latitude, solarDec);
		if (!rise) hourAngle = -hourAngle;
		var delta = longitude + radToDeg(hourAngle);
		var timeUTC = 720 - (4.0 * delta) - eqTime;	// in minutes
		return timeUTC
	}
}


function SunriseCalc(time, latitude, longitude) {
	/*
	 * Calculator which reports the sunrise and sunset
	 * times for a given date and latitude-longitude pair.
	 *
	 * This class conceals much of the math required
	 * to conduct the calculation and relies instead on
	 * a helper class to perform most of the arithmetic.
	 */
	this.time = time
	this.latitude = latitude
	this.longitude = longitude

	helper = new SunriseCalcHelper()

	this.calcSunrise = calcSunrise 		// function definitions
	this.calcSunset = calcSunset
	this.calcCivilDawn = calcCivilDawn
	this.calcCivilDusk = calcCivilDusk
	this.calcSunriseGoldenHour = calcSunriseGoldenHour
	this.calcSunsetGoldenHour = calcSunsetGoldenHour

	function calcSunrise(offset) {
		if (offset == null)		offset = 0
		var jd = helper.getJulianDay(this.time)	

		// Calculation pass 1
		var t = (jd - 2451545.0) / 36525.0;
		var eqTime = helper.calcEquationOfTime(t);
		var solarDec = helper.calcSunDeclination(t) + offset;
		var hourAngle = helper.calcHourAngleSunrise(this.latitude, solarDec);
		var delta = this.longitude + helper.radToDeg(hourAngle);
		var timeUTC = 720 - (4.0 * delta) - eqTime;	// in minutes
		
		// Calculation pass 2
		t = ((jd + timeUTC / 1440.0) - 2451545.0) / 36525.0;
		eqTime = helper.calcEquationOfTime(t);
		solarDec = helper.calcSunDeclination(t) + offset;	// +/- 6 degrees
		hourAngle = helper.calcHourAngleSunrise(this.latitude, solarDec);
		delta = this.longitude + helper.radToDeg(hourAngle);
		timeUTC = 720 - (4.0 * delta) - eqTime;	// in minutes


		minutes = timeUTC % 1440.0
		var hr = Math.floor(minutes / 60.0) + 1
		var min = Math.round(minutes % 60.0)
		// alert(hr + ":" + min)

		yr = this.time.getFullYear()
		mon = this.time.getMonth()
		day = this.time.getDate()
		return new Date(Date.UTC(yr, mon, day, hr, min, 0))
	}


	function calcSunset(offset) {
		if (offset == null)		offset = 0
		var jd = helper.getJulianDay(this.time)

		// Calculation pass 1
		var t = (jd - 2451545.0) / 36525.0;
		var eqTime = helper.calcEquationOfTime(t);
		var solarDec = helper.calcSunDeclination(t) + offset;
		var hourAngle = -helper.calcHourAngleSunrise(this.latitude, solarDec);
		var delta = this.longitude + helper.radToDeg(hourAngle);
		var timeUTC = 720 - (4.0 * delta) - eqTime;	// in minutes
		
		// Calculation pass 2
		t = ((jd + timeUTC / 1440.0) - 2451545.0) / 36525.0;
		eqTime = helper.calcEquationOfTime(t);
		solarDec = helper.calcSunDeclination(t) + offset;	// +/- 6 degrees
		hourAngle = -helper.calcHourAngleSunrise(this.latitude, solarDec);
		delta = this.longitude + helper.radToDeg(hourAngle);
		timeUTC = 720 - (4.0 * delta) - eqTime;	// in minutes


		minutes = timeUTC % 1440.0
		var hr = Math.floor(minutes / 60.0) + 1
		var min = Math.round(minutes % 60.0)
		// alert(hour + ":" + minute)

		yr = this.time.getFullYear()
		mon = this.time.getMonth()
		day = this.time.getDate()
		return new Date(Date.UTC(yr, mon, day, hr, min, 0))
	}

	function calcCivilDawn() {
		return this.calcSunrise(-6)
	}

	function calcCivilDusk() {
		return this.calcSunset(-6)
	}

	function calcSunriseGoldenHour() {
		return this.calcSunrise(6)
	}

	function calcSunsetGoldenHour() {
		return this.calcSunset(6)
	}
}
