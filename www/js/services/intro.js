angular.module('starter.services')

	.service('IntroCacheService',
	/**
	 * @ngdoc service
	 * @name IntroCacheService
	 * @param {PouchDB} pouchDB
	 * @param {$log} $log
	 */
	function (pouchDB, $log) {
		var db = pouchDB("intro", {
			auto_compaction: true
		});
		var INTRO_DB_ID = "intro";

		this.get = function (options) {
			return db.get(INTRO_DB_ID, options);
		};

		/**
		 * @param {String} html
		 * @param {Date} modified
		 */
		this.put = function (html, modified) {
			var intro = {
				"_id": INTRO_DB_ID,
				"html": html,
				"modified": modified
			};

			return db.upsert(INTRO_DB_ID, function (doc) {
				if (intro.modified == doc.modified)
					return false;

				return intro;
			});
		};

		this.putAttachment = function (attachments) {
			return db.get(INTRO_DB_ID).then(function (doc) {
				doc["_attachments"] = attachments;
				$log.debug(attachments);
				return db.put(doc);
			});
		};
	})

	.service('IntroService',
	/**
	 * @ngdoc service
	 * @name IntroService
	 * @param {$q} $q
	 * @param {RestService} RestService
	 * @param {$log} $log
	 * @param {IntroCacheService} IntroCacheService
	 * @param {ImageService} ImageService
	 */
	function ($q, RestService, $log, IntroCacheService, ImageService) {
		var synced = $q.defer();

		var parseHtml = function (html) {
			var parser = new DOMParser();
			var doc = parser.parseFromString(html, "text/html");
			var style = doc.querySelector("link");
			var body = doc.querySelector("div.home-wrapper");
			var imageNodeList = doc.querySelectorAll("img"),
				imageArray = [].slice.call(imageNodeList);

			return {
				"style": style,
				"body": body,
				"images": imageArray
			};
		};

		/**
		 * @returns {Promise}
		 */
		this.sync = function () {
			var result = null;

			return RestService.getHome()
				.then(function (data) {
					var header = data.headers()['last-modified'];
					if (_.isUndefined(header)) {
						header = data.headers()['date'];
					}
					var lastModified = new Date(header);
					var raw = data.data;

					// 커스텀 스키마를 이용한 내부 링크 처리
					var html = raw.replace(/linkto:/g, "#/app/posts/");
					result = parseHtml(html);

					//TODO 불필요한 업데이트 차단
					return IntroCacheService.put(html, lastModified)
				})
				.then(function () {
					var promises = ImageService.imgTagsToBlobs(result.images);

					return $q.all(promises);
				})
				.then(function (files) {
					var attachments = {};
					files.forEach(function (file) {
						attachments[file.filename] = {
							"content_type": file.content_type,
							"data": file.data
						}
					});

					return IntroCacheService.putAttachment(attachments)
				})
				.then(function () {
					synced.resolve();
				});
		};

		/**
		 * 동기화가 필요없을 때 락을 해제한다.
		 */
		this.release = function () {
			synced.resolve();
		};

		/**
		 * @returns {Promise}
		 */
		this.get = function () {
			var options = {
				'attachments': true,
				'binary': true
			};

			return synced.promise
				.then(function () {
					return IntroCacheService.get(options)
				})
				.then(function (doc) {
					$log.debug(doc);
					var result = parseHtml(doc.html);
					ImageService.blobsToImgTags(result.images, doc._attachments);

					return result;
				});
		};
	});
