angular.module('starter.services')

	.service('NoticeDao',
		/**
		 * @ngdoc service
		 * @name NoticeDao
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

	.factory('NoticeUpdater',
		/**
		 * @ngdoc factory
		 * @name NoticeUpdater
		 * @param {RestService} RestService
		 * @param {NoticeDao} NoticeDao
		 */
		function (RestService, NoticeDao) {
			return {
				/**
				 * 서버로부터 새로 목록을 내려받아 캐시한다.
				 * @returns {Promise}
				 */
				updateAll: function () {
					return RestService.getNotices()
						.then(function (response) {
							var posts = response.data.posts.map(function (obj) {
								//PouchDB ID 추가
								obj._id = obj.ID + "";
								return obj;
							});

							return NoticeDao.reset(posts);
						});
				},

				/**
				 * 서버로부터 새로 항목을 내려받아 캐시한다.
				 * @param {Number} noticeId 내려받을 항목의 ID
				 * @returns {Promise}
				 */
				update: function (noticeId) {
					return RestService.getNotice(noticeId)
						.then(function (response) {
							var data = response.data;
							data._id = data.ID + "";
							NoticeDao.put(data);

							return data;
						});
				}
			};
		})

	.factory('NoticeService',
		/**
		 * @ngdoc factory
		 * @name NoticeService
		 * @param {NoticeDao} NoticeDao
		 */
		function (NoticeDao) {
			return {
				/**
				 * 캐시된 목록을 가져온다.
				 * @returns {Promise}
				 */
				list: function () {
					return NoticeDao.list()
						.then(function (result) {
							return _(result.rows)
								.map(function (obj) {
									return obj.doc;
								})
								.sortBy(function (notice) {
									return notice.ID;
								})
								.reverse()
								.value();
						});
				},

				/**
				 * 캐시된 항목 중 현재 보여져야 하는 항목을 가져온다.
				 */
				getAvailable: function () {
					return NoticeDao.list()
						.then(function (result) {
							return _(result.rows)
								.map(function (obj) {
									return obj.doc;
								})
								.sortBy(function (notice) {
									return notice.ID;
								})
								.last();
						});
				},

				/**
				 * 캐시된 항목을 가져온다.
				 * @param {Number} noticeId 가져올 항목의 ID
				 * @returns {Promise}
				 */
				get: function (noticeId) {
					return NoticeDao.get(noticeId);
				}
			};
		});
