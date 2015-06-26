'use strict';

angular.module('mommodApp')
    .controller('NotificationsCtrl', [
        '$scope', '$rootScope', '$timeout', 'assertSignedIn', 'ngToast', 'parse',
        function ($scope, $rootScope, $timeout, assertSignedIn, ngToast, parse) {

            assertSignedIn();

            $scope.notifications = [];

            // get notifications.
            $rootScope.spinner = true;
            parse.getNotifications()
                .done(function (notifications) {
                    $scope.notifications = notifications;
                    $rootScope.spinner = false;
                    $timeout();
                })
                .fail(function (error) {
                    ngToast.create('[' + error.code + '] ' + error.message);
                    $rootScope.spinner = false;
                    $timeout();
                })
            ;

            $scope.toggleRead = function (notification) {
                parse.updateNotification(notification, { read: !notification.get('read') })
                    .done(function (updated) {
                        notification.set('read', updated.get('read'));
                        $timeout();
                    });
            };
        }
    ])
;
