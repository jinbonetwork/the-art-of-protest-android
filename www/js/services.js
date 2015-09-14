angular.module('starter.services', ['starter.constants'])

	.factory('$localStorage',
	/**
	 * @ngdoc factory
	 * @name $localStorage
	 * @param {$window} $window
	 */
	function ($window) {
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
	})

	.service('$restService',
	/**
	 * @ngdoc service
	 * @name $restService
	 * @param {$http} $http
	 * @param {$q} $q
	 * @param {$log} $log
	 * @param {ApiEndpoint} ApiEndpoint
	 */
	function ($http, $q, $log, ApiEndpoint) {
		var home = ApiEndpoint.home;
		var apiRoot = ApiEndpoint.api;

		/**
		 * 첫 화면의 컨텐츠를 가져온다.
		 * @returns {Promise}
		 */
		this.getHome = function () {
			return $http({
				method: 'GET',
				url: home
			});
		};

		this.getPostVersion = function () {
			return $http({
				method: 'GET',
				url: apiRoot + "/posts/",
				params: {
					'order_by': 'modified',
					'status': 'publish',
					'number': 1,
					'fields': 'modified'
				}
			});
		};

		/**
		 * 카테고리 목록과 각 카테고리에 속한 문서 목록을 함께 가져온다.
		 * @returns {Promise}
		 */
		this.getPostsByCategory = function () {
			return $http({
				method: 'GET',
				url: apiRoot + "/posts/",
				params: {
					'type': 'page',
					'category': 'manual',
					'status': 'publish',
					'fields': 'ID,title,modified,categories,menu_order',
					'number': 100
				}
			});
		};

		/**
		 * @returns {Promise}
		 */
		this.getNotices = function () {
			return $http({
				method: 'GET',
				url: apiRoot + "/posts/",
				params: {
					'category': 'notice',
					'status': 'publish',
					'order': 'desc',
					'order_by': 'date'
				}
			});
		};

		/**
		 * @returns {Promise}
		 */
		this.getNotice = function (noticeId) {
			return $http({
				method: 'GET',
				url: apiRoot + "/posts/" + noticeId
			})
		};

		/**
		 * 서버로부터 목록을 내려받는다.
		 * @returns {Promise}
		 */
		this.getPosts = function () {
			return $http({
				method: 'GET',
				url: apiRoot + "/posts/",
				params: {
					'type': 'page',
					'category': 'manual',
					'status': 'publish',
					'fields': 'ID,URL,attachment_count,attachments,content,date,excerpt,featured_image,menu_order,modified,tags,title',
					'number': 100
				}
			})
		};

		/**
		 * 서버로부터 항목을 내려받는다.
		 * @param {Number} postId 내려받을 항목의 ID
		 * @returns {Promise}
		 */
		this.getPost = function (postId) {
			return $http({
				method: 'GET',
				url: apiRoot + "/posts/" + postId
			});
		};
	});
