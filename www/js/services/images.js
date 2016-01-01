angular.module('starter.services')

	.factory('ImageService',
		/**
		 * @ngdoc factory
		 * @name ImageService
		 * @param {$q} $q
		 * @param {ApiEndpoint} ApiEndpoint
		 */
		function ($q, ApiEndpoint) {
			var generateFileId = function (url) {
				return url.replace(/[^a-zA-Z0-9]/g, "_");
			};

			var sync = function (src, id) {
				return $q(function (resolve, reject) {
					var sync = ContentSync.sync({src: src, id: id});

					sync.on('complete', function (data) {
						resolve({
							id: id,
							src: src,
							localPath: data.localPath
						})
					});

					sync.on('error', reject);
				});
			};

			return {
				/**
				 * @param {Array<String>} srcs
				 * @returns {Array<Promise>}
				 */
				cacheImages: function (srcs) {
					return _.map(srcs, function (oldSrc) {
						var src = ApiEndpoint.filter(oldSrc);
						var id = generateFileId(oldSrc);

						return sync(src, id);
					});
				}
			};
		});
