'use strict';

angular.module('mommodApp')
    .controller('ThreadCtrl', ['$scope', '$routeParams', 'mockThread', 'assertSignedIn', function ($scope, $routeParams, mockThread, assertSignedIn) {
        assertSignedIn();

        $scope.commentId = $routeParams.commentId;
        $scope.thread = mockThread;
    }])
;
