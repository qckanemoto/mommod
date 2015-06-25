'use strict';

angular.module('mommodApp')
    .controller('AccountCtrl', [
        '$scope', '$rootScope', '$location', '$timeout', 'assertSignedIn', 'ngToast', 'parse',
        function ($scope, $rootScope, $location, $timeout, assertSignedIn, ngToast, parse) {

            assertSignedIn();

            $scope.user = Parse.User.current();
            $scope.file = null;

            $scope.form = {
                username: Parse.User.current().getUsername(),
                email: Parse.User.current().getEmail(),
                displayName: Parse.User.current().get('displayName'),
                password: ''
            };

            $scope.updateAccount = function () {
                $rootScope.spinner = true;
                if ($scope.form.password == '') {
                    delete $scope.form.password;
                }
                parse.updateUser($scope.form, $scope.file)
                    .then(function () {
                        return parse.loadCurrentUserWithAvatarUrl(true);
                    })
                    .done(function (user) {
                        $scope.form.password = '';
                        $scope.file = null;
                        ngToast.create({
                            className: 'success',
                            content: 'Account is successfully updated.',
                            timeout: 3000
                        });
                        $rootScope.currentUser = user;
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
