angular.module('starter.services')

	.service('IntroCacheService',
	/**
	 * @ngdoc service
	 * @name IntroCacheService
	 * @param {PouchDB} pouchDB
	 */
	function (pouchDB) {
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
				/*
				 if (intro.modified == doc.modified)
				 return false;
				 */

				return intro;
			});
		};
	})

	.factory('IntroParser',
	/**
	 * @ngdoc factory
	 * @name IntroParser
	 */
	function () {
		return {
			parseHtml: function (html) {
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
			}
		};
	})

	.factory('IntroUpdater',
	/**
	 * @ngdoc factory
	 * @name IntroUpdater
	 * @param {$q} $q
	 * @param {RestService} RestService
	 * @param {IntroCacheService} IntroCacheService
	 * @param {IntroParser} IntroParser
	 * @param {ImageService} ImageService
	 * @param {$log} $log
	 */
	function ($q, RestService, IntroCacheService, IntroParser, ImageService, $log) {
		return {
			/**
			 * @returns {Promise}
			 */
			update: function () {
				var result = null;
				var lastModified = new Date();

				return RestService.getHome()
					.then(function (data) {
						var raw = data.data;

						// 커스텀 스키마를 이용한 내부 링크 처리
						result = raw.replace(/linkto:/g, "#/app/posts/");
						/*
						var parsed = IntroParser.parseHtml(result);

						var srcs = parsed.images.map(function (img) {
							return img.src;
						});
						var promises = ImageService.cacheImages(srcs);

						return $q.all(promises);
					})
					.then(function (files) {
						files.forEach(function (file) {
							$log.debug("다음 이미지를 적용합니다.", file);

							result = result.replace(new RegExp(file.src, "g"), file.localPath);
						});
						*/

						return IntroCacheService.put(result, lastModified)
					});
			}
		};
	})

	.factory('IntroService',
	/**
	 * @ngdoc factory
	 * @name IntroService
	 * @param {IntroCacheService} IntroCacheService
	 * @param {IntroParser} IntroParser
	 * @param {$log} $log
	 */
	function (IntroCacheService, IntroParser, $log) {
		return {
			/**
			 * @returns {Promise}
			 */
			get: function () {
				return IntroCacheService.get()
					.then(function (doc) {
						$log.debug("다음 문서를 가져옵니다.", doc);
						return IntroParser.parseHtml(doc.html);
					});
			}
		};
	});
