'use strict';

angular.module('mommodApp')
    .controller('ThreadCtrl', ['$scope', '$routeParams', 'mockThread', function ($scope, $routeParams, mockThread) {
        $scope.threadId = $routeParams.id;  // not used for now.
        $scope.thread = mockThread;
    }])
;
