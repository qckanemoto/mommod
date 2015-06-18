'use strict';

angular.module('mommodApp')
    .controller('NewCtrl', ['$scope', 'assertSignedIn', function ($scope, assertSignedIn) {
        assertSignedIn();

        $scope.title = '';
        $scope.content = '';
    }])
;
