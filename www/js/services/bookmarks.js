angular.module('starter.services')

	.service('BookmarkDao',
		/**
		 * @ngdoc service
		 * @name BookmarkDao
		 * @param {PouchDB} pouchDB
		 * @param {$log} $log
		 */
		function (pouchDB, $log) {
			var DB_NAME = "bookmarks";
			var db = pouchDB(DB_NAME);

			this.list = function () {
				return db.allDocs({
					include_docs: true
				});
			};

			/**
			 * @param {Number} id
			 * @param {String} title
			 * @param {String} excerpt
			 * @returns {Promise}
			 */
			this.put = function (id, title, excerpt) {
				return db.put({
					"_id": id + "",
					"type": "document",
					"title": title,
					"excerpt": excerpt
				});
			};

			/**
			 * @param {Number} id
			 * @returns {Promise}
			 */
			this.get = function (id) {
				return db.get(id + "");
			};

			/**
			 * @param {Number} id
			 * @param {String} rev
			 * @returns {Promise}
			 */
			this.remove = function (id, rev) {
				return db.remove(id + "", rev);
			};

			this.reset = function (notices) {
				db.destroy()
					.then(function () {
						db = pouchDB(DB_NAME);
						return db.bulkDocs(notices);
					})
					.catch($log.error);
			};
		})

	.factory('BookmarkService',
		/**
		 * @ngdoc factory
		 * @name BookmarkService
		 * @param {BookmarkDao} BookmarkDao
		 * @param {$q} $q
		 */
		function (BookmarkDao, $q) {
			return {
				/**
				 * @returns {Promise}
				 */
				list: function () {
					return BookmarkDao.list()
						.then(function (result) {
							return result.rows.map(function (obj) {
								return obj.doc;
							});
						});
				},

				/**
				 * 북마크를 추가한다.
				 * @param {Number} postId
				 * @param {String} title
				 * @param {String} excerpt
				 * @returns {Promise}
				 */
				add: function (postId, title, excerpt) {
					return BookmarkDao.put(postId, title, excerpt)
						.then(function (result) {
							return {
								"id": result.id,
								"rev": result.rev
							};
						});
				},

				/**
				 * 북마크를 제거한다.
				 * @param {Number} postId
				 * @param {String} docRev
				 * @returns {Promise}
				 */
				remove: function (postId, docRev) {
					return BookmarkDao.remove(postId, docRev)
				},

				/**
				 * 페이지가 북마크되어있는지 확인한다.
				 * @param {Number} postId 확인할 페이지의 PostID
				 * @returns {Promise}
				 */
				exists: function (postId) {
					return $q(function (resolve, reject) {
						BookmarkDao.get(postId)
							.then(function (result) {
								resolve(result._rev);
							})
							.catch(function (err) {
								if (err.status == 404) {
									resolve(null);
								} else {
									reject(err)
								}
							});
					});
				}
			};
		});
