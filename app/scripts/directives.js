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
;
