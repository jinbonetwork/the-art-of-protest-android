angular.module('starter.controllers', ['starter.services'])

	.controller('AppCtrl', function ($scope, categories, notice, $ionicSideMenuDelegate, $ionicModal) {
		$scope.categories = categories;
		$scope.notice = notice;

		/*
		 * if given group is the selected group, deselect it
		 * else, select the given group
		 */
		$scope.toggleGroup = function (group) {
			if ($scope.isGroupShown(group)) {
				$scope.shownGroup = null;
			} else {
				$scope.shownGroup = group;
			}
		};

		$scope.isGroupShown = function (group) {
			return $scope.shownGroup === group;
		};

		// With the new view caching in Ionic, Controllers are only called
		// when they are recreated or on app start, instead of every page change.
		// To listen for when this page is active (for example, to refresh data),
		// listen for the $ionicView.enter event:
		//$scope.$on('$ionicView.enter', function(e) {
		//});

		$scope.toggleLeftSideMenu = function () {
			$ionicSideMenuDelegate.toggleLeft();
		};

		$ionicModal.fromTemplateUrl('templates/notice_modal.html', {
			scope: $scope
		}).then(function (modal) {
			$scope.modal = modal;
		});

		$scope.showNotice = function () {
			$scope.modal.show();
		};
	})

	.controller('HomeCtrl', function ($scope, contents, $sce) {
		$scope.contents = $sce.trustAsHtml(contents.style.outerHTML + contents.body.innerHTML);
	})

	.controller('NoticesCtrl', function (NoticeUpdater, $scope, $log, notices) {
		$scope.notices = notices;

		$scope.refreshItems = function () {
			NoticeUpdater.updateAll().then(function (notices) {
				$scope.notices = notices;
			}, $log.error);

			$scope.$broadcast('scroll.refreshComplete');
		};
	})

	.controller('NoticeCtrl', function ($scope, notice) {
		$scope.notice = notice;
	})

	.controller('PostsCtrl', function ($scope, PostUpdater, $log, posts) {
		$scope.posts = posts;

		$scope.refreshItems = function () {
			PostUpdater.updateAll().then(function (posts) {
				$scope.posts = posts;
			}, $log.error);

			$scope.$broadcast('scroll.refreshComplete');
		};
	})

	.controller('PostCtrl', function ($scope, PostService, BookmarkService, $cordovaToast,
									  post, initBookmarkRev, $log, $sce) {
		$scope.postTitle = post.title;
		$scope.postDate = _.isUndefined(post.modified) ? post.date : post.modified;
		$scope.postContent = $sce.trustAsHtml(post.content);
		$scope.bookmarkRev = initBookmarkRev;
		$scope.categoryTitle = Object.keys(post.categories)[0];

		$scope.toggleBookmark = function () {
			if ($scope.bookmarkRev) {
				BookmarkService.remove(post.ID, $scope.bookmarkRev)
					.then(function () {
						$scope.bookmarkRev = null;
						$cordovaToast.showShortTop('북마크가 해제되었습니다.');
					}, $log.error)
			} else {
				BookmarkService.add(post.ID, post.title, post.excerpt)
					.then(function (result) {
						$scope.bookmarkRev = result.rev;
						$cordovaToast.showShortTop('북마크가 설정되었습니다.');
					}, $log.error)
			}
		}
	})

	.controller('SearchCtrl', function ($scope, $ionicFilterBar, PostService, $timeout, $log) {
		var filterBarInstance;

		$scope.items = [];

		$scope.showFilterBar = function () {
			filterBarInstance = $ionicFilterBar.show({
				debounce: true,
				items: $scope.items,
				update: function (filteredItems) {
					$scope.items = filteredItems;
				},
				filter: function (array, expression, comparator) {
					var that = this;
					// TODO workaround. global.keyword 참조
					global["keyword"] = expression;
					PostService.query(expression, 20)
						.then(function (result) {
							if (result.rows.length > 0) {
								that.update(result.rows.map(function (row) {
									return row.doc
								}));
							} else {
								that.update([{"title": "해당되는 문서가 없습니다."}])
							}
						}).catch(function () {
						that.update([{"title": "찾는 중 오류가 발생했습니다."}])
					});

					return [{"title": "찾는 중입니다..."}]
				}
			});
		};

		$scope.showFilterBar();
	})

	.controller('BookmarksCtrl', function ($scope, BookmarkService, bookmarks, $log, $cordovaToast) {
		$scope.data = {
			showDelete: false
		};

		$scope.bookmarks = bookmarks;

		$scope.onItemDelete = function (bookmark) {
			BookmarkService.remove(bookmark._id, bookmark._rev)
				.then(function () {
					$cordovaToast.showShortTop('북마크가 해제되었습니다.');
				}, $log.error);

			$scope.bookmarks.splice($scope.bookmarks.indexOf(bookmark), 1);
		};
	})

	.controller('SettingsCtrl', function ($scope, SettingService, $log) {
		SettingService.allDemo().then(function (settings) {
			$scope.settings = settings;
		}, $log.error);
	})

	.controller('AboutCtrl', function ($scope, AppUpdater) {
		$scope.lastUpdate = AppUpdater.getLastUpdate();
	});
