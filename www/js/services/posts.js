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

		this.put = function (post) {
			return db.upsert(post._id, function (doc) {
				return doc.modified != post.modified;
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

	.service('$postService', function ($restService, $postCacheService, $q) {

		/**
		 * 게시물의 정렬기준을 반환한다.
		 * @param post
		 * @returns {Number}
		 */
		var postOrder = function (post) {
			return post.menu_order;
		};

		/**
		 * 서버로부터 새로 목록을 내려받아 캐시한다.
		 * @returns {Promise}
		 */
		this.syncAll = function () {
			return $q(function (resolve, reject) {
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

						resolve(posts);
					})
					.error(function (data, status, headers, config) {
						reject(data);
					});
			});
		};

		/**
		 * 서버로부터 새로 항목을 내려받아 캐시한다.
		 * @param {Number} postId 내려받을 항목의 ID
		 * @returns {Promise}
		 */
		this.sync = function (postId) {
			return $q(function (resolve, reject) {
				$restService.getPost(postId)
					.success(function (data, status, headers, config) {
						data._id = data.ID + "";
						$postCacheService.put(data);

						resolve(data);
					})
					.error(function (data, status, headers, config) {
						reject(data);
					});
			});
		};

		/**
		 * 캐시된 목록을 가져온다.
		 * @returns {Promise}
		 */
		this.list = function () {
			return $q(function (resolve, reject) {
				$postCacheService.list()
					.then(function (result) {
						var docs = _.chain(result.rows)
							.map(function (obj) {
								return obj.doc;
							})
							.sortBy(postOrder)
							.value();

						resolve(docs);
					})
					.catch(reject);
			});
		};

		/**
		 * 캐시된 항목을 가져온다.
		 * @param {Number} postId 가져올 항목의 ID
		 * @returns {Promise}
		 */
		this.get = function (postId) {
			return $postCacheService.get(postId);
		};

		/**
		 * 문서 검색
		 *
		 * @param {string} keyword
		 * @param {number} limit
		 * @returns {Promise}
		 */
		this.query = function (keyword, limit) {
			return $postCacheService.query(function (doc) {
				// TODO workaround. global.keyword 참조
				var keyword = global["keyword"];
				if (doc.title.indexOf(keyword) > -1 || doc.content.indexOf(keyword) > -1)
					emit(doc);
			}, {include_docs: true, limit: limit});
		};
	});

// TODO db.query의 eval() 문제 해결을 위한 workaround
var global = {};
global["keyword"] = "";