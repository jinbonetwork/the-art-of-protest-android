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
			var MODE = 'PROD';
			var config = MODE == 'DEV' ? DevConfiguration : ProdConfiguration;

			this.home = config.home;
			this.api = config.api;

			/**
			 * 프록시 개발 환경일경우 지정된 경로를 프록시로 바꾸어주는 함수
			 */
			this.filter = config.filter;
		});
