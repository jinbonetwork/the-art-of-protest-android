angular.module('starter.controllers', ['starter.services'])

	.controller('AppCtrl', function ($scope, $ionicModal, $timeout, $http, $localStorage, categories,
									 $ionicSideMenuDelegate, $log) {
		//TODO localstorage 이용 버전 확인
		$scope.categories = categories;

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

		// Form data for the login modal
		$scope.loginData = {};

		// Create the login modal that we will use later
		$ionicModal.fromTemplateUrl('templates/login.html', {
			scope: $scope
		}).then(function (modal) {
			$scope.modal = modal;
		});

		// Triggered in the login modal to close it
		$scope.closeLogin = function () {
			$scope.modal.hide();
		};

		// Open the login modal
		$scope.login = function () {
			$scope.modal.show();
		};

		// Perform the login action when the user submits the login form
		$scope.doLogin = function () {
			$log.log('Doing login', $scope.loginData);

			// Simulate a login delay. Remove this and replace with your login
			// code if using a login system
			$timeout(function () {
				$scope.closeLogin();
			}, 1000);
		};

		$scope.toggleLeftSideMenu = function () {
			$ionicSideMenuDelegate.toggleLeft();
		};
	})

	.controller('HomeCtrl', function($scope, contents, $log){
		$scope.contents = contents.style.outerHTML + contents.body.innerHTML;
	})

	.controller('NoticesCtrl', function ($noticeService, $scope, $log, notices) {
		$scope.notices = notices;

		$scope.refreshItems = function () {
			$noticeService.syncAll().then(function (notices) {
				$scope.notices = notices;
			}, $log.error);

			$scope.$broadcast('scroll.refreshComplete');
		};
	})

	.controller('NoticeCtrl', function ($scope, notice) {
		$scope.notice = notice;
	})

	.controller('PostsCtrl', function ($scope, $postService, $log, posts) {
		$scope.posts = posts;

		$scope.refreshItems = function () {
			$postService.syncAll().then(function (posts) {
				$scope.posts = posts;
			}, $log.error);

			$scope.$broadcast('scroll.refreshComplete');
		};
	})

	.controller('PostCtrl', function ($scope, $postService, $bookmarkService, $cordovaToast,
									  post, initBookmarkRev, $log) {
		$scope.post = post;
		$scope.bookmarkRev = initBookmarkRev;

		$scope.toggleBookmark = function () {
			if ($scope.bookmarkRev) {
				$bookmarkService.remove(post.ID, $scope.bookmarkRev)
					.then(function () {
						$scope.bookmarkRev = null;
						$cordovaToast.showShortTop('북마크가 해제되었습니다.');
					}, $log.error)
			} else {
				$bookmarkService.add(post.ID, post.title, post.excerpt)
					.then(function (result) {
						$scope.bookmarkRev = result.rev;
						$cordovaToast.showShortTop('북마크가 설정되었습니다.');
					}, $log.error)
			}
		}
	})

	.controller('SearchCtrl', function ($scope, $ionicFilterBar, $postService, $timeout, $log) {
		var filterBarInstance;

		$scope.items = [];

		$scope.showFilterBar = function () {
			filterBarInstance = $ionicFilterBar.show({
				items: $scope.items,
				update: function (filteredItems) {
					$scope.items = filteredItems;
				},
				filter: function (array, expression, comparator) {
					var that = this;
					// TODO workaround. global.keyword 참조
					global["keyword"] = expression;
					$postService.query(expression, 20)
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

		$scope.showFilterBar()
	})

	.controller('BookmarksCtrl', function ($scope, $bookmarkService, bookmarks, $log, $cordovaToast) {
		$scope.data = {
			showDelete: false
		};

		$scope.bookmarks = bookmarks;

		$scope.onItemDelete = function (bookmark) {
			$bookmarkService.remove(bookmark._id, bookmark._rev)
				.then(function () {
					$cordovaToast.showShortTop('북마크가 해제되었습니다.');
				}, $log.error);

			$scope.bookmarks.splice($scope.bookmarks.indexOf(bookmark), 1);
		};
	})

	.controller('SettingsCtrl', function ($scope, $settingService, $log) {
		$settingService.allDemo().then(function (settings) {
			$scope.settings = settings;
		}, $log.error);
	});
