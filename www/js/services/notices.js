angular.module('starter.services')

	.service('$noticeCacheService', function ($log) {
		var DB_NAME = "notices";
		var db = new PouchDB(DB_NAME);

		this.list = function () {
			return db.allDocs({
				include_docs: true
			});
		};

		this.get = function (id) {
			return db.get(id);
		};

		this.put = function (obj) {
			return db.upsert(obj._id, function (doc) {
				return doc.modified != obj.modified;
			});
		};

		this.reset = function (notices) {
			db.destroy()
				.then(function () {
					db = new PouchDB(DB_NAME);
					return db.bulkDocs(notices);
				})
				.catch($log.error);
		}
	})

	.service('$noticeService', function ($restService, $noticeCacheService) {
		this.retrieveAll = function (successCallback, errorCallback) {
			$noticeCacheService.list()
				.then(function (result) {
					var notices = _(result.rows).map(function (obj) {
						return obj.doc;
					});

					successCallback(notices);

					$restService.getNotices()
						.success(function (data, status, headers, config) {
							var posts = _(data.posts)
								.map(function (obj) {
									//PouchDB ID 추가
									obj._id = obj.ID + "";
									return obj;
								});

							$noticeCacheService.reset(posts);

							successCallback(posts);
						})
						.error(function (data, status, headers, config) {
							errorCallback(data);
						});
				})
				.catch(errorCallback);
		};

		this.retrieve = function (noticeId, successCallback, errorCallback) {
			$noticeCacheService.get(noticeId)
				.then(function (result) {
					successCallback(result);

					$restService.getNotice(noticeId)
						.success(function (data, status, headers, config) {
							data._id = data.ID + "";
							$noticeCacheService.put(data);

							successCallback(data);
						})
						.error(function (data, status, headers, config) {
							errorCallback(data);
						});
				})
				.catch(errorCallback);
		};
	});
