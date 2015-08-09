angular.module('starter.services', [])

	.factory('$localStorage', ['$window', function ($window) {
		return {
			set: function (key, value) {
				$window.localStorage[key] = value;
			},
			get: function (key, defaultValue) {
				return $window.localStorage[key] || defaultValue;
			},
			setObject: function (key, value) {
				$window.localStorage[key] = JSON.stringify(value);
			},
			getObject: function (key) {
				return JSON.parse($window.localStorage[key] || '{}');
			}
		}
	}])

	.service('$restService', function ($http, $log) {
		var apiRoot = "https://public-api.wordpress.com/rest/v1.1/sites/theartofprotest.jinbo.net";

		this.getCategories = function () {
			return $http({
				method: 'GET',
				url: apiRoot + "/categories",
				params: {
					'fields': 'ID,name,parent'
				}
			});
		};

		this.getNotices = function () {
			return $http({
				method: 'GET',
				url: apiRoot + "/posts/",
				params: {
					'category': 'notice',
					'status': 'publish'
				}
			});
		};

		this.getNotice = function (noticeId) {
			return $http({
				method: 'GET',
				url: apiRoot + "/posts/" + noticeId
			})
		};

		this.getDocuments = function () {
			return $http({
				method: 'GET',
				url: apiRoot + "/posts/",
				params: {
					'type': 'page',
					'category': 'manual',
					'status': 'publish'
				}
			})
		};

		this.getDocument = function (documentId) {
			return $http({
				method: 'GET',
				url: apiRoot + "/posts/" + documentId
			});
		};
	})

	.service('$db', function () {
		this.documents = new PouchDB('documents');
		this.bookmarks = new PouchDB('bookmarks');
	});
