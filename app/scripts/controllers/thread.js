'use strict';

angular.module('mommodApp')
    .controller('ThreadCtrl', ['$scope', '$routeParams', 'mockThread', function ($scope, $routeParams, mockThread) {
        $scope.commentId = $routeParams.commentId;
        $scope.thread = mockThread;
    }])
;
