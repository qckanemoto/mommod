'use strict';

angular.module('mommodApp')
    .controller('NewCtrl', ['$scope', function ($scope) {
        $scope.title = '';
        $scope.content = '';
    }])
;
