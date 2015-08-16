angular.module('starter.services')

	.service('$postCacheService', function (pouchDB, $log) {
		var DB_NAME = "posts";
		var db = pouchDB(DB_NAME);

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
					db = pouchDB(DB_NAME);
					return db.bulkDocs(notices);
				})
				.catch($log.error);
		};

		this.query = function (map, options) {
			return db.query(map, options);
		};
	})

	.service('$postService', function ($restService, $postCacheService) {
		this.retrieveAll = function (successCallback, errorCallback) {
			var postOrder = function (post) {
				return post.menu_order;
			};

			$postCacheService.list()
				.then(function (result) {
					var docs = _.chain(result.rows)
						.map(function (obj) {
							return obj.doc;
						})
						.sortBy(postOrder)
						.value();

					successCallback(docs);

					$restService.getPosts()
						.success(function (data, status, headers, config) {
							var posts = _.chain(data.posts)
								.map(function (obj) {
									//PouchDB ID 추가
									obj._id = obj.ID + "";
									return obj;
								})
								.sortBy(postOrder)
								.value();

							$postCacheService.reset(posts);

							successCallback(posts);
						})
						.error(function (data, status, headers, config) {
							errorCallback(data);
						});
				});
		};

		this.retrieve = function (docId, successCallback, errorCallback) {
			$postCacheService.get(docId)
				.then(function (result) {
					successCallback(result);

					$restService.getPost(docId)
						.success(function (data, status, headers, config) {
							data._id = data.ID + "";
							$postCacheService.put(data);

							successCallback(data);
						})
						.error(function (data, status, headers, config) {
							errorCallback(data);
						});
				})
				.catch(errorCallback);
		};

		/**
		 * 문서 검색
		 *
		 * @param {string} keyword
		 * @param {number} limit
		 * @returns {Promise}
		 */
		this.query = function (keyword, limit, successCallback, errorCallback) {
			return $postCacheService.query(function (doc) {
				// TODO workaround. global.keyword 참조
				var keyword = global["keyword"];
				if (doc.title.indexOf(keyword) > -1 || doc.content.indexOf(keyword) > -1)
					emit(doc);
			}, {include_docs: true, limit: limit})
				.then(successCallback)
				.catch(errorCallback);
		};
	});

// TODO db.query의 eval() 문제 해결을 위한 workaround
var global = {};
global["keyword"] = "";