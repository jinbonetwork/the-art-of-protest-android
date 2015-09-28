angular.module('starter.services')

	.service('NoticeCacheService',
	/**
	 * @ngdoc service
	 * @name NoticeCacheService
	 * @param {PouchDB} pouchDB
	 * @param {$log} $log
	 */
	function (pouchDB, $log) {
		var DB_NAME = "notices";
		var db = pouchDB(DB_NAME);

		this.list = function () {
			return db.allDocs({
				include_docs: true
			});
		};

		this.get = function (id) {
			return db.get(id);
		};

		this.put = function (notice) {
			return db.upsert(notice._id, function (doc) {
				if (doc.modified == notice.modified)
					return false;

				return notice;
			});
		};

		this.reset = function (notices) {
			return db.destroy()
				.then(function () {
					db = pouchDB(DB_NAME);
					return db.bulkDocs(notices);
				})
				.catch($log.error);
		}
	})

	.service('NoticeService',
	/**
	 * @ngdoc service
	 * @name NoticeService
	 * @param {RestService} RestService
	 * @param {NoticeCacheService} NoticeCacheService
	 * @param {$q} $q
	 */
	function (RestService, NoticeCacheService, $q) {
		var synced = $q.defer();

		/**
		 * 서버로부터 새로 목록을 내려받아 캐시한다.
		 * @returns {Promise}
		 */
		this.syncAll = function () {
			return RestService.getNotices()
				.then(function (response) {
					var posts = response.data.posts.map(function (obj) {
						//PouchDB ID 추가
						obj._id = obj.ID + "";
						return obj;
					});

					return NoticeCacheService.reset(posts);
				})
				.then(function () {
					synced.resolve();
				});
		};

		/**
		 * 서버로부터 새로 항목을 내려받아 캐시한다.
		 * @param {Number} noticeId 내려받을 항목의 ID
		 * @returns {Promise}
		 */
		this.sync = function (noticeId) {
			return RestService.getNotice(noticeId)
				.then(function (response) {
					var data = response.data;
					data._id = data.ID + "";
					NoticeCacheService.put(data);

					return data;
				});
		};

		/**
		 * 동기화가 필요없을 때 락을 해제한다.
		 */
		this.release = function () {
			synced.resolve();
		};

		/**
		 * 캐시된 목록을 가져온다.
		 * @returns {Promise}
		 */
		this.list = function () {
			return synced.promise
				.then(function () {
					return NoticeCacheService.list()
				})
				.then(function (result) {
					return _.chain(result.rows)
						.map(function (obj) {
							return obj.doc;
						})
						.sortBy(function (notice) {
							return notice.ID;
						})
						.reverse()
						.value();
				});
		};

		/**
		 * 캐시된 항목 중 현재 보여져야 하는 항목을 가져온다.
		 */
		this.getAvailable = function () {
			return synced.promise
				.then(function () {
					return NoticeCacheService.list()
				})
				.then(function (result) {
					return _.chain(result.rows)
						.map(function (obj) {
							return obj.doc;
						})
						.sortBy(function (notice) {
							return notice.ID;
						})
						.last()
						.value();
				});
		};

		/**
		 * 캐시된 항목을 가져온다.
		 * @param {Number} noticeId 가져올 항목의 ID
		 * @returns {Promise}
		 */
		this.get = function (noticeId) {
			return synced.promise
				.then(function () {
					return NoticeCacheService.get(noticeId);
				});
		};
	});
