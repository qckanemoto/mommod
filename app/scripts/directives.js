'use strict';

angular.module('mommodApp')
    .directive('commentView', function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                comment: '=',
                replyTo: '='
            },
            templateUrl: 'views/directives/comment-view.html',
            link: function (scope, elem, attr) {
            }
        };
    })
;
