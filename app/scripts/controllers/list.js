'use strict';

angular.module('mommodApp')
    .controller('ListCtrl', ['$scope', '$rootScope', '$location', 'assertSignedIn', function ($scope, $rootScope, $location, assertSignedIn) {
        assertSignedIn();

        $scope.topics = [];
        var query = new Parse.Query('Topic');
        query.find({
            success: function (topics) {
                $scope.$apply(function () {
                    $scope.topics = topics;
                });
            },
            error: function (error) {
                $scope.$apply(function () {
                    $rootScope.alert = {
                        type: 'danger',
                        message: '[' + error.code + '] ' + error.message,
                        path: $location.path()
                    };
                });
            }
        });
    }])
;
