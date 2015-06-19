'use strict';

angular.module('mommodApp')
    .controller('NewCtrl', ['$scope', '$rootScope', '$location', 'assertSignedIn', function ($scope, $rootScope, $location, assertSignedIn) {
        assertSignedIn();

        $scope.title = '';
        $scope.content = '';

        $scope.createTopic = function () {
            var topic = new Parse.Object('Topic');
            topic
                .set('title', $scope.title)
                .set('content', $scope.content)
                .set('user', $rootScope.currentUser)
                .save(null, {
                    success: function (topic) {
                        $scope.$apply(function () {
                            $location.path('topic/' + topic.id);
                            $rootScope.alert = {
                                type: 'success',
                                message: 'Topic is successfully created.',
                                path: $location.path()
                            };
                        });
                    },
                    error: function (topic, error) {
                        $scope.$apply(function () {
                            $rootScope.alert = {
                                type: 'danger',
                                message: '[' + error.code + '] ' + error.message,
                                path: $location.path()
                            };
                        });
                    }
                })
            ;
        };
    }])
;
