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
					'category': 'notice',
					'status': 'publish'
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

	.service('$categoryService', function ($log) {
		//PouchDB.debug.enable('*'); //TODO DELETEME

		var db = new PouchDB('categories');

		this.all = function () {
			return db.allDocs({
				include_docs: true
			});
		};

		this.reset = function (categories) {
			db.destroy().then(function () {
				db = new PouchDB("categories");
				return db.bulkDocs(categories);
			}).catch($log.error);
		}
	})

	.service('$db', function () {
		this.notices = new PouchDB('notices');
		this.documents = new PouchDB('documents');
		this.bookmarks = new PouchDB('bookmarks');
	});