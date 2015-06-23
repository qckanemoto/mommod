'use strict';

angular.module('mommodApp')
    .controller('MainCtrl', [
        '$scope', '$rootScope', '$location', '$timeout', 'ngToast',
        function ($scope, $rootScope, $location, $timeout, ngToast) {
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
                Parse.User.logIn($scope.user.username, $scope.user.password)
                    .done(function (user) {
                        $rootScope.currentUser = user;
                        $location.path('list');
                        $timeout();
                    })
                    .fail(function (error) {
                        ngToast.create('[' + error.code + '] ' + error.message);
                        $timeout();
                    })
                ;
            };

            $scope.signUp = function () {
                var user = new Parse.User();
                user
                    .set('username', $scope.user.username)
                    .set('email', $scope.user.email)
                    .set('password', $scope.user.password)
                    .signUp()
                    .done(function (user) {
                        $rootScope.currentUser = user;
                        $location.path('list');
                        ngToast.create({
                            className: 'success',
                            content: 'Successfully signed up :)',
                            timeout: 3000
                        });
                        $timeout();
                    })
                    .fail(function (error) {
                        ngToast.create('[' + error.code + '] ' + error.message);
                        $timeout();
                    })
                ;
            };
        }
    ])
;
