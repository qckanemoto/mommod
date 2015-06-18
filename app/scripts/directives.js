'use strict';

angular.module('mommodApp')
    .directive('editableMarkdownView', function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                content: '=',
                submission: '=',
                labelCancel: '@',
                labelSubmit: '@',
                labelDelete: '@'
            },
            templateUrl: 'views/directives/editable-markdown-view.html',
            link: function (scope, elem, attr) {
                scope.deletable = 'deletable' in attr;
                scope.label = {
                    cancel: scope.labelCancel || 'Cancel',
                    submit: scope.labelSubmit || 'Submit',
                    'delete': scope.labelDelete || 'Delete'
                };
            }
        };
    })
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
    .directive('anyHref', ['$location', function ($location) {
        return {
            restrict: 'A',
            scope: {
                href: '@anyHref'
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
