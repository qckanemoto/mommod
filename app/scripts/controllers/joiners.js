'use strict';

angular.module('mommodApp')
    .controller('JoinersCtrl', [
        '$scope', '$rootScope', '$location', '$routeParams', '$timeout', 'assertSignedIn', 'cachedParseQuery',
        function ($scope, $rootScope, $location, $routeParams, $timeout, assertSignedIn, cachedParseQuery) {

            assertSignedIn();

            $scope.topic = null;
            $scope.joiners = [];
            $scope.usernameToAdd = '';

            var query = null;

            // get topic and joiners.
            query = new Parse.Query('Topic');
            cachedParseQuery(query.equalTo('objectId', $routeParams.topicId).include('user'), 'first')
                .then(function (topic) {
                    var promise = new Parse.Promise();

                    // reject user don't have read access.
                    if (!topic) {
                        promise.reject({code: -1, message: 'You have no read access.'});
                        return promise;
                    }

                    $scope.topic = topic;

                    // reject user don't have write access.
                    if (!topic.getACL().getWriteAccess($rootScope.currentUser.id)) {
                        promise.reject({code: -2, message: 'You have no write access.'});
                        return promise;
                    }

                    // get joiners.
                    var userIds = _.keys(topic.getACL().toJSON());
                    query = new Parse.Query('_User');
                    return cachedParseQuery(query.containedIn('objectId', userIds).ascending('username'), 'find');
                })
                .done(function (joiners) {
                    $scope.joiners = joiners;
                    $timeout();
                })
                .fail(function (error) {
                    $location.path('list');
                    if ($scope.topic) {
                        $location.path('topic/' + $scope.topic.id);
                    }
                    $rootScope.alert = {
                        type: 'danger',
                        message: '[' + error.code + '] ' + error.message,
                        path: $location.path()
                    };
                    $timeout();
                })
            ;

            // form functions.
            $scope.addJoiner = function () {
                query = new Parse.Query('_User');
                cachedParseQuery(query.equalTo('username', $scope.usernameToAdd), 'first')
                    .then(function (user) {
                        $scope.topic.getACL().setReadAccess(user.id, true);
                        var topicPromise = $scope.topic.save();
                        return Parse.Promise.when(topicPromise, Parse.Promise.as(user));
                    })
                    .done(function (topic, user) {
                        $scope.joiners.push(user);
                        $scope.usernameToAdd = '';
                        $timeout();
                    })
                ;
            };
            $scope.removeJoiner = function (user) {
                $scope.topic.getACL().setReadAccess(user.id, false);
                Parse.Promise.when($scope.topic.save(), Parse.Promise.as(user))
                    .done(function (topic, user) {
                        var target = _.findWhere($scope.joiners, { id: user.id });
                        var index = _.indexOf($scope.joiners, target);
                        delete $scope.joiners[index];
                        $scope.joiners = _.compact($scope.joiners);
                        $timeout();
                    })
                ;
            };
        }
    ])
;
