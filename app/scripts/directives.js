'use strict';

angular.module('mommodApp')
    .directive('commentView', function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                comment: '=',
                replyTo: '=',
                inThread: '@'
            },
            templateUrl: 'views/directives/comment-view.html',
            link: function (scope, elem, attr) {
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
;
