'use strict';

angular.module('mommodApp')
    .controller('AccountCtrl', [
        '$scope', '$rootScope', '$location', '$timeout', 'assertSignedIn', 'ngToast',
        function ($scope, $rootScope, $location, $timeout, assertSignedIn, ngToast) {

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
                        ngToast.create('[' + error.code + '] ' + error.message);
                        $rootScope.spinner = false;
                        $timeout();
                    })
                ;
            };
        }
    ])
;
