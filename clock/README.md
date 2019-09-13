# Clocks

This program is designed to display the time in Sydney and time in California.

## Todo:

### [ ] Manual Set time

Allow for dragging hands with Voronoi
http://bencentra.com/code/2014/12/05/html5-canvas-touch-events.html

* create a timeout
* Create a reset button

* Double click to reset
* Reset functionality


### [ ] Sunrise and sunset mode

* Night mode
* Alter the weather icons


### [ ] Weather widget

__***Note: this is not possible without a server because of CORS restrictions in-browser__

https://stackoverflow.com/questions/18949074/calculating-sunrise-sunset-times-in-javascript
https://www.esrl.noaa.gov/gmd/grad/solcalc/

__US Weather:__

* [Weather Forecast Overview](https://api.weather.gov/points/39.7456,-97.0892)
* [Linked Forecast](https://api.weather.gov/gridpoints/TOP/31,80/forecast)
* [Icon API](https://api.weather.gov/icons/land/day/sct?size=medium)
* [Icon codes](https://api.weather.gov/icons)

__Australian Weather:__
* [All feeds feed](http://www.bom.gov.au/catalogue/data-feeds.shtml)
* [Sydney Weather Feed (XML)](ftp://ftp.bom.gov.au/anon/gen/fwo/IDN11050.xml)
* [Icon Guide](http://reg.bom.gov.au/info/forecast_icons.shtml)

