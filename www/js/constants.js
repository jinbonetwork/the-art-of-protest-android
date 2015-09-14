angular.module('starter.constants', [])

	.constant('DevConfiguration',
	/**
	 * @ngdoc constant
	 * @name DevConfiguration
	 */
	{
		home: 'http://localhost:8100/home/home.html',
		api: 'https://public-api.wordpress.com/rest/v1.1/sites/theartofprotest.jinbo.net',
		filter: function (str) {
			return str.replace("theartofprotest.jinbo.net", "localhost:8100/home");
		}
	})

	.constant('ProdConfiguration',
	/**
	 * @ngdoc constant
	 * @name ProdConfiguration
	 */
	{
		home: 'http://theartofprotest.jinbo.net/home.html',
		api: 'https://public-api.wordpress.com/rest/v1.1/sites/theartofprotest.jinbo.net',
		filter: function (str) {
			return str;
		}
	})

	.service('ApiEndpoint',
	/**
	 * @ngdoc service
	 * @name ApiEndpoint
	 */
	function (ProdConfiguration, DevConfiguration) {
		// gulp 상에서 조정
		var MODE = 'DEV';
		var config = MODE == 'DEV' ? DevConfiguration : ProdConfiguration;

		this.home = config.home;
		this.api = config.api;
		this.filter = config.filter;
	});