'use strict';

angular.module('mommodApp')
    .controller('JoinersCtrl', [
        '$scope', '$rootScope', '$location', '$routeParams', '$timeout', 'assertSignedIn', 'ngToast', 'parse',
        function ($scope, $rootScope, $location, $routeParams, $timeout, assertSignedIn, ngToast, parse) {

            assertSignedIn();

            $scope.topic = null;
            $scope.joiners = [];
            $scope.usernames = [];
            $scope.usernameToAdd = '';

            // get topic and joiners, and all usernames for typeahead..
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
                    if (Parse.User.current() && !topic.getACL().getWriteAccess(Parse.User.current().id)) {
                        promise.reject({code: '000', message: 'You have no write access.'});
                        return promise;
                    }

                    // get joiners.
                    return parse.getJoiners(topic);
                })
                .then(function (joiners) {
                    $scope.joiners = joiners;

                    // get all usernames.
                    return parse.getUsernames()
                        .done(function (usernames) {
                            usernames = _.reject(usernames, function (username) {
                                var joinernames = _.map(joiners, function (joiner) {
                                    return joiner.get('username');
                                });
                                return _.contains(joinernames, username);
                            });
                            $scope.usernames = usernames;
                        })
                    ;
                })
                .done(function () {
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
