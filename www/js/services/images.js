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

		return {
			/**
			 * @param {Array<Element>} imgTags
			 * @returns {Array<Promise>}
			 */
			cacheImageFromTags: function (imgTags) {
				return imgTags.map(function (img) {
					var src = ApiEndpoint.filter(img.src);
					var id = generateFileId(img.src);

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
				});
			}
		};
	});
