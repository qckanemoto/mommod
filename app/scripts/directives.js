'use strict';

angular.module('mommodApp')
    .directive('commentView', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/directives/comment-view.html',
            link: function (scope, elem, attr) {
            }
        };
    })
;
