'use strict';

angular.module('mommodApp')
    .controller('JoinersCtrl', [
        '$scope', '$rootScope', '$location', '$routeParams', '$timeout', 'assertSignedIn', 'ngToast', 'parse',
        function ($scope, $rootScope, $location, $routeParams, $timeout, assertSignedIn, ngToast, parse) {

            assertSignedIn();

            $scope.topic = null;
            $scope.joiners = [];
            $scope.usernameToAdd = '';

            // get topic and joiners.
            $rootScope.spinner = true;
            parse.getTopic($routeParams.topicId)
                .then(function (topic) {
                    var promise = new Parse.Promise();

                    // reject user don't have read access.
                    if (!topic) {
                        promise.reject({code: '000', message: 'You have no read access.'});
                        return promise;
                    }

                    $scope.topic = topic;

                    // reject user don't have write access.
                    if (!topic.getACL().getWriteAccess($rootScope.currentUser.id)) {
                        promise.reject({code: '000', message: 'You have no write access.'});
                        return promise;
                    }

                    // get joiners.
                    return parse.getJoiners(topic);
                })
                .done(function (joiners) {
                    $scope.joiners = joiners;
                    $rootScope.spinner = false;
                    $timeout();
                })
                .fail(function (error) {
                    if ($scope.topic) {
                        $location.path('topic/' + $scope.topic.id);
                    } else {
                        $location.path('list');
                    }
                    ngToast.create('[' + error.code + '] ' + error.message);
                    $rootScope.spinner = false;
                    $timeout();
                })
            ;

            $scope.addJoiner = function () {
                $rootScope.spinner = true;
                parse.addJoiner($scope.topic, $scope.usernameToAdd)
                    .done(function (user, joiners) {
                        $scope.joiners = joiners;
                        $scope.usernameToAdd = '';
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

            $scope.removeJoiner = function (user) {
                if (confirm('Remove "' + user.get('username') + '"?')) {
                    parse.removeJoiner($scope.topic, user)
                        .done(function (user) {
                            var index = _.findIndex($scope.joiners, {id: user.id});
                            delete $scope.joiners[index];
                            $scope.joiners = _.compact($scope.joiners);
                            $rootScope.spinner = false;
                            $timeout();
                        })
                        .fail(function (error) {
                            ngToast.create('[' + error.code + '] ' + error.message);
                            $rootScope.spinner = false;
                            $timeout();
                        })
                    ;
                }
            };
        }
    ])
;
