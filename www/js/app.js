angular.module('starter', ['ionic', 'ngCordova', 'jett.ionic.filter.bar', 'pouchdb', 'starter.controllers'])

	.run(
		/**
		 * @param {$ionicPlatform} $ionicPlatform
		 * @param {$ionicLoading} $ionicLoading
		 * @param {$ionicPopup} $ionicPopup
		 * @param {$ionicHistory} $ionicHistory
		 * @param {AppLoadLock} AppLoadLock
		 * @param {AppUpdater} AppUpdater
		 * @param {UPDATE_RESULT} UPDATE_RESULT
		 * @param {$cordovaSplashscreen} $cordovaSplashscreen
		 * @param {$cordovaToast} $cordovaToast
		 * @param {$log} $log
		 * @param {$rootScope} $rootScope
		 * @param {$ionicConfig} $ionicConfig
		 */
		function ($ionicPlatform, $ionicLoading, $ionicPopup, $ionicHistory, AppLoadLock, AppUpdater, UPDATE_RESULT, $cordovaSplashscreen, $cordovaToast, $log, $rootScope, $ionicConfig) {
			// 안드로이드에서 헤더 바 가운데 정렬을 강제
			$ionicConfig.navBar.alignTitle('center');

			// 라우팅 오류 기록
			$rootScope.$on('$stateChangeError', $log.error);

			$ionicPlatform.ready(function () {
				// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
				// for form inputs)
				if (window.cordova && window.cordova.plugins.Keyboard) {
					cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
					cordova.plugins.Keyboard.disableScroll(true);
				}

				//업데이트 시작
				$log.info("업데이트를 확인합니다.");
				$ionicLoading.show({
					templateUrl: "loading.html"
				});

				try {
					$cordovaSplashscreen.hide();
				} catch (err) {
					// 개발시 브라우저 환경 등 스플래시 스크린이 없는 경우
					$log.error(err);
				}

				AppUpdater.update()
					.then(function (result) {
						if (result.type == "SUCCESS") {
							switch (result) {
								case UPDATE_RESULT.ALREADY:
									$log.info("이미 최신 버전입니다.");
									break;
								default:
									$log.info("업데이트가 완료되었습니다.", result);
							}

							AppLoadLock.release();
							$ionicLoading.hide();
						} else {
							switch (result) {
								case UPDATE_RESULT.NETWORK_ERROR:
									$log.warn("업데이트 사이트에 연결할 수 없습니다.");
									break;
								default:
									$log.warn("업데이트에 실패했습니다.", err);
							}

							$ionicLoading.hide();

							if (AppUpdater.getLastUpdate() !== undefined) {
								AppLoadLock.release();
								$cordovaToast.showLongBottom('오프라인으로 열람합니다.');
							} else {
								var alertPopup = $ionicPopup.alert({
									title: '연결 오류',
									template: "데이터 다운로드를 위해 첫 실행시 인터넷 연결이 필요합니다. 연결 상태를 확인해주세요."
								});
								alertPopup.then(function () {
									$log.warn('데이터를 받은 적이 없고 인터넷에 연결되어있지 않아 프로그램을 종료합니다.');
									ionic.Platform.exitApp();
								});
							}
						}
					});
				//업데이트 끝

				//최상단 뷰에서 뒤로가기 버튼을 차단
				//http://forum.ionicframework.com/t/how-to-use-backbutton-event-best-pratice/3577/17
				$ionicPlatform.registerBackButtonAction(function (e) {
					e.preventDefault();

					function showConfirm() {
						$ionicPopup.confirm({
							title: '종료',
							subTitle: '프로그램을 종료하시겠습니까?',
							okText: '예',
							okType: 'button-positive',
							cancelText: '아니오'
						}).then(function (isOk) {
							if (isOk) {
								ionic.Platform.exitApp();
							}
						});
					}

					if ($ionicHistory.backView()) {
						$ionicHistory.goBack(-1);
					} else {
						showConfirm();
					}

					return false;
				}, 101);

				if (window.StatusBar) {
					// org.apache.cordova.statusbar required
					StatusBar.styleDefault();
				}
			});
		})

	.service('AppLoadLock',
		/**
		 * $stateProvider에서 지연된 로딩을 구현하기 위한 락.
		 *
		 * @ngdoc service
		 * @name AppLoadLock
		 * @param {$q} $q
		 */
		function ($q) {
			var deferred = $q.defer();

			this.release = function () {
				deferred.resolve();
			};

			this.success = function (func) {
				return deferred.promise.then(func);
			};
		})

	.config(function ($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('loading', {
				url: '/'
			})

			.state('app', {
				url: '/app',
				abstract: true,
				templateUrl: 'templates/menu.html',
				controller: 'AppCtrl',
				resolve: {
					'categories': function (AppLoadLock, CategoryService) {
						return AppLoadLock.success(function () {
							return CategoryService.list();
						});
					},
					"notice": function (AppLoadLock, NoticeService) {
						return AppLoadLock.success(function () {
							return NoticeService.getAvailable();
						});
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
					'contents': function (AppLoadLock, IntroService) {
						return AppLoadLock.success(function () {
							return IntroService.get();
						});
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
					"notices": function (AppLoadLock, NoticeService) {
						return AppLoadLock.success(function () {
							return NoticeService.list();
						});
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
					"notice": function (AppLoadLock, NoticeService, noticeId) {
						return AppLoadLock.success(function () {
							return NoticeService.get(noticeId);
						});
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
					"posts": function (AppLoadLock, PostService) {
						return AppLoadLock.success(function () {
							return PostService.list();
						});
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
					"post": function (AppLoadLock, postId, PostService) {
						return AppLoadLock.success(function () {
							return PostService.get(postId);
						});
					},
					"initBookmarkRev": function (postId, BookmarkService) {
						return BookmarkService.exists(postId);
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
					"bookmarks": function (BookmarkService) {
						return BookmarkService.list();
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
