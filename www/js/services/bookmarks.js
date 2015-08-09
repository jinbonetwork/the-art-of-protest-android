angular.module('starter.services')

	.service('$bookmarkDb', function ($log) {
		var DB_NAME = "bookmarks";
		var db = new PouchDB(DB_NAME);

		this.list = function () {
			return db.allDocs({
				include_docs: true
			});
		};

		this.put = function (id, title, excerpt) {
			return db.put({
				"_id": id,
				"type": "document",
				"title": title,
				"excerpt": excerpt
			});
		};

		this.get = function (id) {
			return db.get(id);
		};

		this.remove = function (id, rev) {
			return db.remove(id, rev);
		};

		this.reset = function (notices) {
			db.destroy()
				.then(function () {
					db = new PouchDB(DB_NAME);
					return db.bulkDocs(notices);
				})
				.catch($log.error);
		};
	})

	.service('$bookmarkService', function ($bookmarkDb) {
		this.retrieveAll = function (successCallback, errorCallback) {
			$bookmarkDb.list()
				.then(function (result) {
					var bookmarks = _(result.rows).map(function (obj) {
						return obj.doc;
					});

					successCallback(bookmarks);
				})
				.catch(errorCallback);
		};

		this.add = function (docId, title, excerpt, successCallback, errorCallback) {
			$bookmarkDb.put(docId + "", title, excerpt)
				.then(function (result) {
					successCallback(result.id, result.rev);
				})
				.catch(errorCallback);
		};

		this.remove = function (docId, docRev, successCallback, errorCallback) {
			$bookmarkDb.remove(docId + "", docRev)
				.then(function (result) {
					successCallback();
				})
				.catch(errorCallback);
		};

		this.exists = function (docId, successCallback, errorCallback) {
			$bookmarkDb.get(docId + "")
				.then(function (result) {
					successCallback(true, result._rev);
				})
				.catch(function (err) {
					if (err.status == 404) {
						successCallback(false);
					} else {
						errorCallback(err)
					}
				});
		}
	});
