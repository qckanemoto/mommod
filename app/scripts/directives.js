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
                scope.editingContent = scope.content;
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
