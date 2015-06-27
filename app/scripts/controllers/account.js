'use strict';

angular.module('mommodApp')
    .controller('AccountCtrl', [
        '$scope', '$rootScope', '$location', '$timeout', 'assertSignedIn', 'ngToast', 'parse',
        function ($scope, $rootScope, $location, $timeout, assertSignedIn, ngToast, parse) {

            assertSignedIn();

            $scope.user = Parse.User.current();
            $scope.avatarFile = null;

            $scope.form = {
                profile: {
                    username: Parse.User.current().get('username'),
                    email: Parse.User.current().get('email'),
                    displayName: Parse.User.current().get('displayName'),
                    password: ''
                },
                setting: {}
            };

            // get setting.
            parse.getSetting(Parse.User.current())
                .done(function (setting) {
                    $scope.form.setting.notification = setting.get('notification');
                    $timeout();
                });

            $scope.updateProfile = function () {
                $rootScope.spinner = true;
                if ($scope.form.profile.password == '') {
                    delete $scope.form.profile.password;
                }
                parse.updateUser($scope.form.profile, $scope.avatarFile)
                    .done(function () {
                        $scope.form.profile.password = '';
                        $scope.avatarFile = null;
                        ngToast.create({
                            className: 'success',
                            content: 'Profile is successfully updated.',
                            timeout: 3000
                        });
                        $rootScope.spinner = false;
                        $timeout();
                    })
                    .fail(function (error) {
                        ngToast.create('[' + error.code + '] ' + error.message);
                        $rootScope.spinner = false;
                        $timeout();
                    });
            };

            $scope.saveSetting = function () {
                $rootScope.spinner = true;
                parse.saveSetting($scope.form.setting)
                    .done(function () {
                        ngToast.create({
                            className: 'success',
                            content: 'Setting is successfully updated.',
                            timeout: 3000
                        });
                        $rootScope.spinner = false;
                        $timeout();
                    })
                    .fail(function (error) {
                        ngToast.create('[' + error.code + '] ' + error.message);
                        $rootScope.spinner = false;
                        $timeout();
                    });
            };
        }
    ])
;
