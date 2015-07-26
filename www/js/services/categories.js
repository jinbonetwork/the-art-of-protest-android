angular.module('starter.services')

	.service('$categoryCacheService', function ($log) {
		//PouchDB.debug.enable('*'); //TODO DELETEME

		var DB_NAME = "categories";
		var db = new PouchDB(DB_NAME);

		this.list = function () {
			return db.allDocs({
				include_docs: true
			});
		};

		this.reset = function (categories) {
			db.destroy()
				.then(function () {
					db = new PouchDB(DB_NAME);
					return db.bulkDocs(categories);
				})
				.catch($log.error);
		}
	})

	.service('$categoryService', function ($restService, $categoryCacheService) {
		this.retrieveAll = function (successCallback, errorCallback) {
			$categoryCacheService.list()
				.then(function (result) {
					var categories = _(result.rows).map(function (obj) {
						return obj.doc;
					});

					successCallback(categories);

					$restService.getCategories()
						.success(function (data, status, headers, config) {
							var isManual = function (category) {
								return category.parent == 2;
							};

							var manualCategories = _(data.categories)
								.filter(isManual)
								.map(function (obj) {
									//PouchDB ID 추가
									obj._id = obj.ID + "";
									return obj;
								});

							$categoryCacheService.reset(manualCategories);

							successCallback(manualCategories);
						})
						.error(function (data, status, headers, config) {
							errorCallback(status);
						});
				})
				.catch(errorCallback);
		};
	});
