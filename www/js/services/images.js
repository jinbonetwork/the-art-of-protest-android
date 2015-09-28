angular.module('starter.services')

	.service('ImageService',
	/**
	 * @ngdoc service
	 * @name ImageService
	 * @param {$q} $q
	 * @param {ApiEndpoint} ApiEndpoint
	 */
	function ($q, ApiEndpoint) {
		var generateFileId = function (url) {
			// TODO 도메인/경로가 다를 경우 중복 파일명 가능성
			return url.substring(url.lastIndexOf('/') + 1);
		};

		/**
		 * @param {Array<Element>} imgTags
		 * @returns {Array<Promise>}
		 */
		this.imgTagsToBlobs = function (imgTags) {
			return imgTags.map(function (img) {
				var url = ApiEndpoint.filter(img.src);
				var filename = generateFileId(url);

				return $q(function (resolve, reject) {
					// 투명 지원과 변환 최소화를 위해 image/png 유지 필요
					blobUtil.imgSrcToBlob(url, 'image/png', {crossOrigin: 'Anonymous'})
						.then(function (blob) {
							resolve({
								"content_type": "image/png",
								"filename": filename,
								"data": blob
							})
						})
						.catch(reject);
				});
			});
		};

		/**
		 * @param {Array<Blob>} imgTags
		 * @param {Array<Object>} attachments The PouchDB attachments.
		 */
		this.blobsToImgTags = function (imgTags, attachments) {
			imgTags.map(function (img) {
				var filename = generateFileId(img.src);
				var blob = attachments[filename].data;
				img.src = blobUtil.createObjectURL(blob);
			});
		};
	});
