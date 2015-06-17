'use strict';

angular.module('mommodApp')
    .directive('commentView', ['$location', function ($location) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                comment: '=',
                replyTo: '=',
                slimmed: '@'
            },
            templateUrl: 'views/directives/comment-view.html',
            link: function (scope, elem, attr) {
                scope.scrollTo = function (hash) {
                    $location.hash(hash);
                }
            }
        };
    }])
    .directive('markdownEditor', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/directives/markdown-editor.html',
            scope: {
                content: '='
            },
            link: function (scope, elem, attr) {
                scope.isEditing = true;
            }
        };
    })
    .directive('anyNgHref', ['$location', function ($location) {
        return {
            restrict: 'A',
            scope: {
                href: '@anyNgHref'
            },
            link: function (scope, elem, attr) {
                elem.on('click', function () {
                    var href = scope.href.replace(/^#/, '').split('#');
                    var path = href[0];
                    var hash = href[1];
                    scope.$apply(function () {
                        $location.url(path + '#' + hash);
                    });
                });
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
;
