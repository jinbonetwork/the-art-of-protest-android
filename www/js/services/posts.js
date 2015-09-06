angular.module('starter.services')

	.service('$postCacheService',
	/**
	 * @ngdoc service
	 * @name $postCacheService
	 * @param {PouchDB} pouchDB
	 * @param {$log} $log
	 */
	function (pouchDB, $log) {
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
				if (doc.modified == post.modified)
					return false;

				return post;
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

	.service('$postService',
	/**
	 * @ngdoc service
	 * @name $postService
	 * @param {$restService} $restService
	 * @param {$postCacheService} $postCacheService
	 */
	function ($restService, $postCacheService) {

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
			//TODO attachments 동기화
			return $restService.getPosts()
				.then(function (response) {
					var posts = _.chain(response.data.posts)
						.map(function (obj) {
							//PouchDB ID 추가
							obj._id = obj.ID + "";
							return obj;
						})
						.sortBy(postOrder)
						.value();

					$postCacheService.reset(posts);

					return posts;
				});
		};

		/**
		 * 서버로부터 새로 항목을 내려받아 캐시한다.
		 * @param {Number} postId 내려받을 항목의 ID
		 * @returns {Promise}
		 */
		this.sync = function (postId) {
			return $restService.getPost(postId)
				.then(function (response) {
					var data = response.data;
					data._id = data.ID + "";
					$postCacheService.put(data);

					return data;
				});
		};

		/**
		 * 캐시된 목록을 가져온다.
		 * @returns {Promise}
		 */
		this.list = function () {
			return $postCacheService.list()
				.then(function (result) {
					var docs = _.chain(result.rows)
						.map(function (obj) {
							return obj.doc;
						})
						.sortBy(postOrder)
						.value();

					return docs;
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