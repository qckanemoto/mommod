'use strict';

angular.module('mommodApp')
    .controller('ListCtrl', ['$scope', 'assertSignedIn', function ($scope, assertSignedIn) {
        assertSignedIn();
    }])
;
