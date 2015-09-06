angular.module('starter.services')

	.service('$introCacheService',
	/**
	 * @ngdoc service
	 * @name $introCacheService
	 * @param {PouchDB} pouchDB
	 * @param {$log} $log
	 */
	function (pouchDB, $log) {
		var db = pouchDB("intro", {
			auto_compaction: true
		});
		var INTRO_DB_ID = "intro";

		this.get = function () {
			return db.get(INTRO_DB_ID);
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

	.service('$introService',
	/**
	 * @ngdoc service
	 * @name $introService
	 * @param {$q} $q
	 * @param {$restService} $restService
	 * @param {$log} $log
	 * @param {$introCacheService} $introCacheService
	 */
	function ($q, $restService, $log, $introCacheService) {
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

			var promise = $restService.getHome()
				.then(function (data) {
					var lastModified = new Date(data.headers()['last-modified']);
					var html = data.data;
					result = parseHtml(html);

					//TODO 불필요한 업데이트 차단
					return $introCacheService.put(html, lastModified)
				})
				.then(function () {
					var promises = result.images.map(function (img) {
						// TODO CORS
						var url = img.src;
						var filename = url.substring(url.lastIndexOf('/') + 1);

						return $q(function (resolve, reject) {
							blobUtil.imgSrcToBlob(url, 'image/jpeg', {crossOrigin: 'Anonymous'})
								.then(function (blob) {
									resolve({
										"content_type": "image/jpeg",
										"filename": filename,
										"data": blob
									})
								})
								.catch(reject);
						});
					});

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

					return $introCacheService.putAttachment(attachments)
				})
				.then(function () {
					return result;
				});

			return promise;
		};

		/**
		 * @returns {Promise}
		 */
		this.get = function () {
			return $introCacheService.get()
				.then(function (result) {
					return parseHtml(result.html);
				});
		};
	});
