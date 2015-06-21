'use strict';

angular.module('mommodApp')
    .controller('NewCtrl', [
        '$scope', '$rootScope', '$location', 'assertSignedIn',
        function ($scope, $rootScope, $location, assertSignedIn) {

            assertSignedIn();

            $scope.title = '';
            $scope.content = '';

            $scope.createTopic = function () {
                var acl = new Parse.ACL();
                acl.setPublicReadAccess(false);
                acl.setPublicWriteAccess(false);
                acl.setReadAccess($rootScope.currentUser.id, true);
                acl.setWriteAccess($rootScope.currentUser.id, true);

                var topic = new Parse.Object('Topic');
                topic
                    .set('title', $scope.title)
                    .set('content', $scope.content)
                    .set('user', $rootScope.currentUser)
                    .setACL(acl)
                    .save()
                    .done(function (topic) {
                        $scope.$apply(function () {
                            $location.path('topic/' + topic.id);
                            $rootScope.alert = {
                                type: 'success',
                                message: 'Topic is successfully created.',
                                path: $location.path()
                            };
                        });
                    })
                    .fail(function (error) {
                        $scope.$apply(function () {
                            $rootScope.alert = {
                                type: 'danger',
                                message: '[' + error.code + '] ' + error.message,
                                path: $location.path()
                            };
                        });
                    })
                ;
            };
        }
    ])
;
