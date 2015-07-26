angular.module('starter.services')

	.service('$documentCacheService', function ($log) {
		var DB_NAME = "documents";
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

	.service('$documentService', function ($restService, $documentCacheService) {
		this.retrieveAll = function (successCallback, errorCallback) {
			$documentCacheService.list()
				.then(function (result) {
					var docs = _(result.rows).map(function (obj) {
						return obj.doc;
					});

					successCallback(docs);

					$restService.getDocuments()
						.success(function (data, status, headers, config) {
							var posts = _(data.posts)
								.map(function (obj) {
									//PouchDB ID 추가
									obj._id = obj.ID + "";
									return obj;
								});

							$documentCacheService.reset(posts);

							successCallback(posts);
						})
						.error(function (data, status, headers, config) {
							errorCallback(data);
						});
				});
		};

		this.retrieve = function (docId, successCallback, errorCallback) {
			$documentCacheService.get(docId)
				.then(function (result) {
					successCallback(result);

					$restService.getDocument(docId)
						.success(function (data, status, headers, config) {
							data._id = data.ID + "";
							$documentCacheService.put(data);

							successCallback(data);
						})
						.error(function (data, status, headers, config) {
							errorCallback(data);
						});
				})
				.catch(errorCallback);
		};
	});
