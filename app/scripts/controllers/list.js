'use strict';

angular.module('mommodApp')
    .controller('ListCtrl', [
        '$scope', '$rootScope', '$location', '$timeout', 'assertSignedIn', 'cachedParseQuery',
        function ($scope, $rootScope, $location, $timeout, assertSignedIn, cachedParseQuery) {

            assertSignedIn();

            $scope.topics = [];
            $scope.counts = {
                joiners: [],
                comments: []
            };

            var query = {
                topic: new Parse.Query('Topic'),
                comment: new Parse.Query('Comment')
            };

            cachedParseQuery(query.topic.include('user').descending('updatedAt'), 'find')
                .then(function (topics) {
                    $scope.topics = topics;
                    return Parse.Promise.as(topics);
                })
                .then(function (topics) {
                    // count joiners.
                    topics.forEach(function (topic) {
                        $scope.counts.joiners.push(_.keys(topic.getACL().toJSON()).length);
                    });
                    return Parse.Promise.as(topics);
                })
                .then(function (topics) {
                    // count comments.
                    var promise = Parse.Promise.as();
                    topics.forEach(function (topic) {
                        promise = promise
                            .then(function () {
                                return cachedParseQuery(query.comment.equalTo('topic', topic), 'count');
                            })
                            .done(function (count) {
                                $scope.counts.comments.push(count);
                            })
                            .fail(function (error) {
                                $scope.counts.comments.push('-');
                            })
                        ;
                    });
                    return promise;
                })
                .done(function () {
                    // start $digest() loop if needed.
                    $timeout();
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
        }
    ])
;
