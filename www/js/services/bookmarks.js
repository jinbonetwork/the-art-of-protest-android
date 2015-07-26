angular.module('starter.services')

	.service('$bookmarkService', function ($log) {
		var DB_NAME = "bookmarks";
		var db = new PouchDB(DB_NAME);

		this.list = function () {
			return db.allDocs({
				include_docs: true
			});
		};

		this.allDemo = function (successCallback, errorCallback) {
			successCallback([
				{title: 'Bookmark1', id: 1},
				{title: 'Bookmark2', id: 2},
				{title: 'Book3', id: 3},
				{title: 'Indie', id: 4},
				{title: 'Rap', id: 5},
				{title: 'Cowbell', id: 6}
			]);
		};

		this.reset = function (notices) {
			db.destroy().then(function () {
				db = new PouchDB(DB_NAME);
				return db.bulkDocs(notices);
			}).catch($log.error);
		}
	});
