'use strict';

(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['moment', 'jquery'], function(moment, $) {
			return (root.ForecastIO = factory(moment, $));
		});
	} else if (typeof module === 'object' && module.exports) {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		module.exports = (root.ForecastIO = factory(require('moment'), require('jquery')));
	} else {
		// Browser globals (root is window)
		root.ForecastIO = factory(root.moment, root.$);
	}
}(this, function(moment) {

	/* 	By Ian Tearle 
		github.com/iantearle
		Forked and amended by
		Richard Bultitude
		github.com/rjbultitude
	*/

	//Forecast Class

	function ForecastIO(config) {
		//var PROXY_SCRIPT = '/proxy.php';
		console.log('config', config);
		if (!config) {
			console.log('You must pass ForecastIO configurations');
		}
		if (!config.PROXY_SCRIPT) {
			if (!config.API_KEY) {
				console.log('API_KEY or PROXY_SCRIPT must be set in ForecastIO config');
			}
		}
		this.API_KEY = config.API_KEY;
		this.url = (typeof config.PROXY_SCRIPT !== 'undefined') ? config.PROXY_SCRIPT : 'https://api.forecast.io/forecast/' + config.API_KEY + '/';
	}

	//Request data method with added callback
	//should return a promise
	ForecastIO.prototype.requestData = function requestData(latitude, longitude) {
		var requestUrl = this.url + '?url=' + latitude + ',' + longitude + '?units=auto';
		return $.ajax({
			url: requestUrl,
			success: function(data) {
				console.log('SUCCESS: ', data);
			},
			error: function(data) {
				console.log('ERROR: ', data);
			}
		});
	};

	/**
	 * Will return the current conditions
	 *
	 * @param float $latitude
	 * @param float $longitude
	 * @return \ForecastIOConditions|boolean
	 */
	ForecastIO.prototype.getCurrentConditions = function getCurrentConditions(latitude, longitude, appFn) {
		var content = this.requestData(latitude, longitude);
		$.when(content)
			.done(function(data) {
				console.log('data', data);
				var jsonData = JSON.parse(data);
				var currently = new ForecastIOConditions(jsonData.currently);

				appFn(currently);
			})
			.fail(function() {
				console.log('error retrieving data');
			});
	};

	/**
	 * Will return conditions on hourly basis for today
	 *
	 * @param type $latitude
	 * @param type $longitude
	 * @return \ForecastIOConditions|boolean
	 */
	ForecastIO.prototype.getForecastToday = function getForecastToday(latitude, longitude) {
		var data = this.requestData(latitude, longitude);
		if (data !== false) {
			var conditions = [];
			var today = moment().format('YYYY-MM-DD');
			for (var i = 0; i < data.hourly.data.length; i++) {
				var rawData = data.hourly.data[i];
				if (moment.unix(rawData.time).format('YYYY-MM-DD') === today) {
					conditions.push(new ForecastIOConditions(rawData));
				}
			}
			return conditions;
		} else {
			return false;
		}
	};

	/**
	 * Will return daily conditions for next seven days
	 *
	 * @param float $latitude
	 * @param float $longitude
	 * @return \ForecastIOConditions|boolean
	 */
	ForecastIO.prototype.getForecastWeek = function getForecastWeek(latitude, longitude) {
		var data = this.requestData(latitude, longitude);
		if (data !== false) {
			var conditions = [];
			for (var i = 0; i < data.daily.data.length; i++) {
				var rawData = data.daily.data[i];
				conditions.push(new ForecastIOConditions(rawData));
			}
			return conditions;
		} else {
			return false;
		}
	};

	function ForecastIOConditions(rawData) {
		ForecastIOConditions.prototype = {
			rawData: rawData
		};
		/**
		 * Will return the temperature
		 *
		 * @return String
		 */
		this.getTemperature = function() {
			return rawData.temperature;
		};
		/**
		 * Get the summary of the conditions
		 *
		 * @return String
		 */
		this.getSummary = function() {
			return rawData.summary;
		};
		/**
		 * Get the icon of the conditions
		 *
		 * @return String
		 */
		this.getIcon = function() {
			return rawData.icon;
		};
		/**
		 * Get the time, when $format not set timestamp else formatted time
		 * Disabled due to moment js not supporting CJS
		 *
		 * @param String $format
		 * @return String
		 */
		this.getTime = function(format) {
			format = 'feature not available';
			if (!format) {
				return rawData.time;
			} else {
				return moment.unix(rawData.time).format(format);
			}
		};
		/**
		 * Get the pressure
		 *
		 * @return String
		 */
		this.getPressure = function() {
			return rawData.pressure;
		};
		/**
		 * get humidity
		 *
		 * @return String
		 */
		this.getHumidity = function() {
			return rawData.humidity;
		};
		/**
		 * Get the wind speed
		 *
		 * @return String
		 */
		this.getWindSpeed = function() {
			return rawData.windSpeed;
		};
		/**
		 * Get wind direction
		 *
		 * @return type
		 */
		this.getWindBearing = function() {
			return rawData.windBearing;
		};
		/**
		 * get precipitation type
		 *
		 * @return type
		 */
		this.getPrecipitationType = function() {
			return rawData.precipType;
		};
		/**
		 * get the probability 0..1 of precipitation type
		 *
		 * @return type
		 */
		this.getPrecipitationProbability = function() {
			return rawData.precipProbability;
		};
		/**
		 * Get the cloud cover
		 *
		 * @return type
		 */
		this.getCloudCover = function() {
			return rawData.cloudCover;
		};
		/**
		 * get the min temperature
		 *
		 * only available for week forecast
		 *
		 * @return type
		 */
		this.getMinTemperature = function() {
			return rawData.temperatureMin;
		};
		/**
		 * get max temperature
		 *
		 * only available for week forecast
		 *
		 * @return type
		 */
		this.getMaxTemperature = function() {
			return rawData.temperatureMax;
		};
		/**
		 * get sunrise time
		 *
		 * only available for week forecast
		 *
		 * @return type
		 */
		this.getSunrise = function() {
			return rawData.sunriseTime;
		};
		/**
		 * get sunset time
		 *
		 * only available for week forecast
		 *
		 * @return type
		 */
		this.getSunset = function() {
			return rawData.sunsetTime;
		};
		/**
		 * get precipitation intensity
		 *
		 * @return number
		 */
		this.getPrecipIntensity = function() {
			return rawData.precipIntensity;
		};
		/**
		 * get dew point
		 *
		 * @return number
		 */
		this.getDewPoint = function() {
			return rawData.dewPoint;
		};
		/**
		 * get the ozone
		 *
		 * @return number
		 */
		this.getOzone = function() {
			return rawData.ozone;
		};
	}

	return ForecastIO;
}));