'use strict';

angular.module('mommodApp')
    .controller('MainCtrl', [
        '$scope', '$rootScope', '$location', '$timeout', 'ngToast',
        function ($scope, $rootScope, $location, $timeout, ngToast) {

            if (Parse.User.current()) {
                $location.path('list');
            }

            $scope.tab = 0;
            $scope.user = {
                username: '',
                email: '',
                password: ''
            };

            $scope.signIn = function () {
                $rootScope.spinner = true;
                Parse.User.logIn($scope.user.username, $scope.user.password)
                    .done(function () {
                        $location.path('list');
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

            $scope.signUp = function () {
                $rootScope.spinner = true;
                var user = new Parse.User();
                user
                    .set('username', $scope.user.username)
                    .set('email', $scope.user.email)
                    .set('password', $scope.user.password)
                    .signUp()
                    .done(function () {
                        $location.path('list');
                        ngToast.create({
                            className: 'success',
                            content: 'Successfully signed up :)',
                            timeout: 3000
                        });
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
