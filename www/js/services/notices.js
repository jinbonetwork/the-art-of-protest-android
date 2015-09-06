angular.module('starter.services')

	.service('$noticeCacheService',
	/**
	 * @ngdoc service
	 * @name $noticeCacheService
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
			db.destroy()
				.then(function () {
					db = pouchDB(DB_NAME);
					return db.bulkDocs(notices);
				})
				.catch($log.error);
		}
	})

	.service('$noticeService',
	/**
	 * @ngdoc service
	 * @name $noticeService
	 * @param {$restService} $restService
	 * @param {$noticeCacheService} $noticeCacheService
	 * @param {$q} $q
	 */
	function ($restService, $noticeCacheService, $q) {

		/**
		 * 서버로부터 새로 목록을 내려받아 캐시한다.
		 * @returns {Promise}
		 */
		this.syncAll = function () {
			return $q(function (resolve, reject) {
				$restService.getNotices()
					.success(function (data, status, headers, config) {
						var posts = data.posts.map(function (obj) {
							//PouchDB ID 추가
							obj._id = obj.ID + "";
							return obj;
						});

						$noticeCacheService.reset(posts);

						resolve(posts);
					})
					.error(function (data, status, headers, config) {
						reject(data);
					});
			})
		};

		/**
		 * 서버로부터 새로 항목을 내려받아 캐시한다.
		 * @param {Number} noticeId 내려받을 항목의 ID
		 * @returns {Promise}
		 */
		this.sync = function (noticeId) {
			return $q(function (resolve, reject) {
				$restService.getNotice(noticeId)
					.success(function (data, status, headers, config) {
						data._id = data.ID + "";
						$noticeCacheService.put(data);

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
				$noticeCacheService.list()
					.then(function (result) {
						var notices = _.chain(result.rows)
							.map(function (obj) {
								return obj.doc;
							})
							.sortBy(function (notice) {
								return notice.ID;
							})
							.reverse()
							.value();

						resolve(notices);
					})
					.catch(reject);
			});
		};

		/**
		 * 캐시된 항목을 가져온다.
		 * @param {Number} noticeId 가져올 항목의 ID
		 * @returns {Promise}
		 */
		this.get = function (noticeId) {
			return $noticeCacheService.get(noticeId);
		};
	});
