angular.module('starter.services')

	.service('$categoryCacheService', function (pouchDB, $log) {
		var DB_NAME = "categories";
		var db = pouchDB(DB_NAME);

		this.list = function () {
			return db.allDocs({
				include_docs: true
			});
		};

		this.reset = function (categories) {
			db.destroy()
				.then(function () {
					db = pouchDB(DB_NAME);
					return db.bulkDocs(categories);
				})
				.catch($log.error);
		}
	})

	.service('$categoryService', function ($restService, $categoryCacheService) {
		this.retrieveAll = function (successCallback, errorCallback) {
			$categoryCacheService.list()
				.then(function (result) {
					var categoryOrder = function (categories) {
						return categories.order;
					};

					var categories = _.chain(result.rows)
						.map(function (obj) {
							return obj.doc;
						})
						.sortBy(categoryOrder)
						.value();

					successCallback(categories);

					$restService.getPostsByCategory()
						.success(function (data, status, headers, config) {
							var categories = _.chain(data.posts)
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

							$categoryCacheService.reset(categories);

							successCallback(categories);
						})
						.error(function (data, status, headers, config) {
							errorCallback(status);
						});
				})
				.catch(errorCallback);
		};
	});
