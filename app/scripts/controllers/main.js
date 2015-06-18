'use strict';

angular.module('mommodApp')
    .controller('MainCtrl', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
        if ($rootScope.currentUser) {
            $location.path('list');
        }

        $scope.tab = 0;

        $scope.user = {
            username: '',
            email: '',
            password: ''
        };
        $scope.error = {};

        $scope.signIn = function () {
            Parse.User.logIn($scope.user.username, $scope.user.password, {
                success: function (user) {
                    $scope.$apply(function () {
                        $rootScope.currentUser = user;
                        $location.path('list');
                        $rootScope.alert = {
                            type: 'success',
                            message: 'Successfully signed in.',
                            path: $location.path()
                        };
                    });
                },
                error: function (user, error) {
                    $scope.$apply(function () {
                        $rootScope.alert = {
                            type: 'danger',
                            message: '[' + error.code + '] ' + error.message,
                            path: $location.path()
                        };
                    });
                }
            });
        };

        $scope.signUp = function () {
            var user = new Parse.User();
            user.set('username', $scope.user.username);
            user.set('email', $scope.user.email);
            user.set('password', $scope.user.password);

            user.signUp(null, {
                success: function (user) {
                    $scope.$apply(function () {
                        $rootScope.currentUser = user;
                        $location.path('list');
                        $rootScope.alert = {
                            type: 'success',
                            message: 'Successfully signed up.',
                            path: $location.path()
                        };
                    });
                },
                error: function (user, error) {
                    $scope.$apply(function () {
                        $rootScope.alert = {
                            type: 'danger',
                            message: '[' + error.code + '] ' + error.message,
                            path: $location.path()
                        };
                    });
                }
            });
        };
    }])
;
