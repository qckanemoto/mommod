'use strict';

angular.module('mommodApp')
    .controller('NewCtrl', [
        '$scope', '$rootScope', '$location', '$timeout', 'assertSignedIn', 'ngToast', 'parse',
        function ($scope, $rootScope, $location, $timeout, assertSignedIn, ngToast, parse) {

            assertSignedIn();

            $scope.title = '';
            $scope.content = '';

            $scope.createTopic = function () {
                $rootScope.spinner = true;
                parse.postTopic({
                    title: $scope.title,
                    content: $scope.content
                })
                    .done(function (topic) {
                        $location.path('topic/' + topic.id);
                        $rootScope.spinner = false;
                        $timeout();
                    })
                    .fail(function (error) {
                        ngToast.create('[' + error.code + '] ' + error.message);
                        $rootScope.spinner = false;
                        $timeout();
                    })
                ;
            };
        }
    ])
;
