'use strict';

angular.module('mommodApp')

    // offer markdown editor.
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

    // add href feature to any element.
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

    // add class to the specified element by location hash.
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

    // autofocus again after $viewContentLoaded.
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

    // turn on/off spinner-modal by true/false of 'trigger'.
    .directive('spinnerModal', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/directives/spinner-modal.html',
            scope: {
                trigger: '='
            },
            link: function (scope, elem, attr) {
                elem.modal({
                    backdrop: 'static',
                    keyboard: false,
                    show: false
                });
                scope.$watch('trigger', function () {
                    elem.modal(scope.trigger ? 'show' : 'hide');
                });
            }
        };
    })
;
