/*
 * main.js
 */


function timeUntil(target) {
	// convert the time now to Australian time
	now = Date.parse(new Date().toLocaleString("en-US", {timeZone:'Australia/Sydney'}))
	ms = Date.now() % 1000

	var diff = target - now
	return Math.max(diff+ms, 0)
}

function zeroPad(n, padding) {
	n = n.toString();
	while (n.length < padding) {
		n = '0' + n;
	}
	return n;
}

function msToTimeString(milliseconds) {
	var dd = Math.floor(diff / 86400000)
	diff -= dd * 86400000
	var hh = Math.floor(diff / 3600000)
	diff -= hh * 3600000
	var mm = Math.floor(diff / 60000)
	diff -= mm * 60000
	var ss = Math.floor(diff / 1000)
	diff -= ss * 1000
	var ms = Math.floor(diff / 10)

	hh = zeroPad(hh, 2)		// formatting
	mm = zeroPad(mm, 2)
	ss = zeroPad(ss, 2)
	ms = zeroPad(ms, 2)

	timeStr = dd+':'+hh+':'+mm+':'+ss+':'+ms
	return timeStr
}


function main() {
	interval = 50

	// Calculate target timestamp
	target = new Date(Date.parse(new Date().toLocaleString("en-US", {timeZone:'Australia/Sydney'})))
	target.setFullYear(2020)
	target.setMonth(2)
	target.setDate(29)
	target.setHours(8)
	target.setMinutes(35)
	target.setSeconds(0)
	target = target.valueOf()

	var counter = document.getElementById('counter')	

	setInterval(() => {			// Main loop
		diff = timeUntil(target)
		count = msToTimeString(diff)
		counter.innerHTML  = count
	}, interval)
}

main()
