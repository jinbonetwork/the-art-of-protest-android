angular.module('starter', ['ionic', 'ngCordova', 'jett.ionic.filter.bar', 'pouchdb', 'starter.controllers'])

	.run(function ($ionicPlatform, $ionicModal, $ionicBackdrop, $syncService, $cordovaSplashscreen, $cordovaToast, $log, $rootScope) {
		// 라우팅 오류 기록
		$rootScope.$on('$stateChangeError', $log.error);

		$ionicPlatform.ready(function () {
			var modalInstance = null;

			$ionicModal.fromTemplateUrl('loading.html', {
				animation: 'slide-in-up'
			}).then(function (modal) {
				modalInstance = modal;
				modalInstance.show();
			});

			//동기화 시작
			$log.info("동기화를 시작합니다.");
			$ionicBackdrop.retain();
			$syncService.sync()
				.then(function (result) {
					$log.info("동기화에 성공했습니다.");
					$ionicBackdrop.release();
					modalInstance.hide();
				})
				.catch(function (err) {
					$log.error("동기화에 실패했습니다.");
				});
			//동기화 끝

			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
			// for form inputs)
			if (window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);

				// TODO Modal로 변경
				$cordovaToast.showLongBottom('버전을 확인하고 있습니다.')
					.then(function (success) {
						setTimeout(function () {
							$cordovaSplashscreen.hide();
						}, 5000);
						// success
					}, function (error) {
						// error
					});

			}
			if (window.StatusBar) {
				// org.apache.cordova.statusbar required
				StatusBar.styleDefault();
			}
		});
	})

	.config(function ($stateProvider, $urlRouterProvider) {
		$stateProvider

			.state('app', {
				url: '/app',
				abstract: true,
				templateUrl: 'templates/menu.html',
				controller: 'AppCtrl',
				resolve: {
					'categories': function ($categoryService) {
						return $categoryService.list();
					}
				}
			})

			.state('app.home', {
				url: '/home',
				views: {
					'menuContent': {
						templateUrl: 'templates/home.html',
						controller: 'HomeCtrl'
					}
				},
				resolve: {
					'contents': function ($introService) {
						return $introService.get();
					}
				}
			})

			.state('app.search', {
				url: '/search',
				views: {
					'menuContent': {
						templateUrl: 'templates/search.html',
						controller: 'SearchCtrl'
					}
				}
			})

			.state('app.notices', {
				url: '/notices',
				views: {
					'menuContent': {
						templateUrl: 'templates/notices.html',
						controller: 'NoticesCtrl'
					}
				},
				resolve: {
					"notices": function ($noticeService) {
						return $noticeService.list();
					}
				}
			})

			.state('app.notice', {
				url: '/notices/:noticeId',
				views: {
					'menuContent': {
						templateUrl: 'templates/notice.html',
						controller: 'NoticeCtrl'
					}
				},
				resolve: {
					"noticeId": function ($stateParams) {
						return $stateParams.noticeId;
					},
					"notice": function ($noticeService, noticeId) {
						return $noticeService.get(noticeId);
					}
				}
			})

			.state('app.posts', {
				url: '/posts',
				views: {
					'menuContent': {
						templateUrl: 'templates/posts.html',
						controller: 'PostsCtrl'
					}
				},
				resolve: {
					"posts": function ($postService) {
						return $postService.list();
					}
				}
			})

			.state('app.post', {
				url: '/posts/:postId',
				views: {
					'menuContent': {
						templateUrl: 'templates/post.html',
						controller: 'PostCtrl'
					}
				},
				resolve: {
					"postId": function ($stateParams) {
						return $stateParams.postId;
					},
					"post": function (postId, $postService) {
						return $postService.get(postId);
					},
					"initBookmarkRev": function (postId, $bookmarkService) {
						return $bookmarkService.exists(postId);
					}
				}
			})

			.state('app.bookmarks', {
				url: '/bookmarks',
				views: {
					'menuContent': {
						templateUrl: 'templates/bookmarks.html',
						controller: 'BookmarksCtrl'
					}
				},
				resolve: {
					"bookmarks": function ($bookmarkService) {
						return $bookmarkService.list();
					}
				}
			})

			.state('app.settings', {
				url: '/settings',
				views: {
					'menuContent': {
						templateUrl: 'templates/settings.html',
						controller: 'SettingsCtrl'
					}
				}
			})

			.state('app.about', {
				url: '/about',
				views: {
					'menuContent': {
						templateUrl: 'templates/about.html',
						controller: 'AboutCtrl'
					}
				}
			});
		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('/app/home');
	});
