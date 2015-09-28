angular.module('starter.services')

	.service('CategoryDao',
	/**
	 * @ngdoc service
	 * @name CategoryDao
	 * @param {PouchDB} pouchDB
	 * @param {$log} $log
	 */
	function (pouchDB, $log) {
		var DB_NAME = "categories";
		var db = pouchDB(DB_NAME);

		this.list = function () {
			return db.allDocs({
				include_docs: true
			});
		};

		this.reset = function (categories) {
			return db.destroy()
				.then(function () {
					db = pouchDB(DB_NAME);
					return db.bulkDocs(categories);
				})
				.catch($log.error);
		}
	})

	.factory('CategoryUpdater',
	/**
	 * @ngdoc factory
	 * @name CategoryUpdater
	 * @param {RestService} RestService
	 * @param {CategoryDao} CategoryDao
	 */
	function (RestService, CategoryDao) {

		/**
		 * 카테고리의 정렬기준을 반환한다.
		 * @param category
		 * @returns {Number}
		 */
		var categoryOrder = function (category) {
			return category.order;
		};

		return {
			/**
			 * 서버로부터 새로 목록을 내려받아 캐시한다.
			 * @returns {Promise}
			 */
			update: function () {
				return RestService.getPostsByCategory()
					.then(function (response) {
						var categories = _.chain(response.data.posts)
							.groupBy(function (post) {
								var title = Object.keys(post.categories)[0];
								return post.categories[title].ID;
							})
							.map(function (posts) {
								var head = posts[0];
								var categoryTitle = Object.keys(head.categories)[0];
								var category = head.categories[categoryTitle];
								var order = _.chain(posts).map(function (p) {
									return p.menu_order
								}).min().value();

								return {
									"ID": category.ID + "", // PouchDB를 위해 String 처리
									"title": categoryTitle,
									"posts": _(posts).sortBy(function (p) {
										return p.menu_order
									}),
									"order": order
								};
							})
							.sortBy(categoryOrder)
							.value();

						return CategoryDao.reset(categories);
					});
			}
		};
	})

	.factory('CategoryService',
	/**
	 * @ngdoc factory
	 * @name CategoryService
	 * @param {CategoryDao} CategoryDao
	 */
	function (CategoryDao) {

		/**
		 * 카테고리의 정렬기준을 반환한다.
		 * @param category
		 * @returns {Number}
		 */
		var categoryOrder = function (category) {
			return category.order;
		};

		return {
			/**
			 * 캐시된 목록을 가져온다.
			 * @returns {Promise}
			 */
			list: function () {
				return CategoryDao.list()
					.then(function (result) {
						return _.chain(result.rows)
							.map(function (obj) {
								return obj.doc;
							})
							.sortBy(categoryOrder)
							.value();
					});
			}
		};
	});
