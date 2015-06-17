'use strict';

angular.module('mommodApp')
    .controller('ThreadCtrl', ['$scope', '$routeParams', '$anchorScroll', '$timeout', 'mockThread', function ($scope, $routeParams, $anchorScroll, $timeout, mockThread) {

        $timeout(function () {
            $anchorScroll();
        }, 1000);

        $scope.commentId = $routeParams.id;
        $scope.thread = mockThread;
    }])
;
