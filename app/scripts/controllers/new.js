'use strict';

angular.module('mommodApp')
    .controller('NewCtrl', ['$scope', function ($scope) {
        $scope.isEditing = true;
        $scope.editingContent = '';
    }])
;
