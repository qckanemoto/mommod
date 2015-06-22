'use strict';

angular.module('mommodApp')
    .directive('markdownEditor', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/directives/markdown-editor.html',
            scope: {
                content: '='
            },
            link: function (scope, elem, attr) {
                scope.required = 'required' in attr;
                scope.isEditing = true;
            }
        };
    })
    .directive('anyHref', ['$location', function ($location) {
        return {
            restrict: 'A',
            scope: {
                href: '@anyHref'
            },
            link: function (scope, elem, attr) {
                elem.on('click', function () {
                    var buf = scope.href.replace(/^#/, '').split('#');
                    var url = buf[0] + (buf[1] ? '#' + buf[1] : '');
                    scope.$apply(function () {
                        $location.url(url);
                    });
                });
            }
        };
    }])
    .directive('hashFocusedClass', ['$location', function ($location) {
        return {
            restrict: 'A',
            scope: {
                hashFocusedClass: '@',
                hash: '@'
            },
            link: function (scope, elem, attr) {
                if ($location.hash() == scope.hash) {
                    elem.addClass(scope.hashFocusedClass);
                }
            }
        };
    }])
    .directive('autofocus', function () {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, elem, attr) {
                scope.$on('$viewContentLoaded', function () {
                    elem.focus();
                });
            }
        };
    })
    .directive('dateAnchorLink', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/directives/date-anchor-link.html',
            scope: {
                date: '@',
                baseUrl: '@',
                hash: '@'
            }
        };
    })
;
