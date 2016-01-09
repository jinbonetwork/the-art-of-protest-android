angular.module('starter.directives', [])

	/**
	 * 컨텐츠에 이벤트 뷰어 등의 이벤트 핸들러를 추가한 뒤 렌더링한다.
	 * http://stackoverflow.com/questions/22737927/angular-ng-bind-html-filters-out-ng-click 참고
	 */
	.directive('compile', ['$compile', function ($compile) {
		return function (scope, element, attrs) {
			scope.$watch(
				function (scope) {
					return scope.$eval(attrs.compile);
				},
				function (value) {
					var e = element.html(value.$$unwrapTrustedValue());

					e.find("figure").each(function () {
						$img = $(this).find("img");
						var title = $(this).find("figcaption").text();
						var url = $img.attr("src");
						$img.attr("ng-click", `openModal('${title}','${url}')`)
					});

					$compile(element.contents())(scope);
				}
			)
		};
	}]);
