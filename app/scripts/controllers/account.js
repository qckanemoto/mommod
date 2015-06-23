'use strict';

angular.module('mommodApp')
    .controller('AccountCtrl', [
        '$scope', '$rootScope', '$location', '$timeout', 'assertSignedIn',
        function ($scope, $rootScope, $location, $timeout, assertSignedIn) {

            assertSignedIn();

            $scope.user = new Parse.User();
            $scope.user.id = $rootScope.currentUser.id;

            $scope.form = {
                username: $rootScope.currentUser.getUsername(),
                email: $rootScope.currentUser.getEmail(),
                displayName: $rootScope.currentUser.get('displayName'),
                password: ''
            };

            $scope.updateAccount = function () {
                $rootScope.spinner = true;

                if ($scope.form.password != '') {
                    $scope.user.set('password', $scope.form.password);
                }
                $scope.user
                    .setUsername($scope.form.username)
                    .setEmail($scope.form.email)
                    .set('displayName', $scope.form.displayName)
                    .save()
                    .then(function (user) {
                        var token = $rootScope.currentUser._sessionToken;
                        return Parse.User.become(token);
                    })
                    .done(function (user) {
                        $rootScope.currentUser = user;
                        $rootScope.alert = {
                            type: 'success',
                            message: 'Account is successfully updated.',
                            path: $location.path()
                        };
                        $rootScope.spinner = false;
                        $timeout();
                    })
                    .fail(function (error) {
                        $rootScope.alert = {
                            type: 'danger',
                            message: '[' + error.code + '] ' + error.message,
                            path: $location.path()
                        };
                        $rootScope.spinner = false;
                        $timeout();
                    })
                ;
            };
        }
    ])
;
