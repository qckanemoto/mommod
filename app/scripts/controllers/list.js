'use strict';

angular.module('mommodApp')
    .controller('ListCtrl', [
        '$scope', '$rootScope', '$location', '$timeout', 'assertSignedIn', 'cachedParseQuery',
        function ($scope, $rootScope, $location, $timeout, assertSignedIn, cachedParseQuery) {

            assertSignedIn();

            $scope.topics = [];

            var query = null;

            // get topics.
            query = new Parse.Query('Topic');
            cachedParseQuery(query.include('user').descending('updatedAt'), 'find')
                .then(function (topics) {
                    $scope.topics = topics;

                    // count joiners.
                    topics.forEach(function (topic) {
                        var count = _.keys(topic.getACL().toJSON()).length;
                        var target = _.findWhere($scope.topics, { id: topic.id });
                        var index = _.indexOf($scope.topics, target);
                        $scope.topics[index].count = { joiners: count };
                    });

                    // count comments.
                    var promise = Parse.Promise.as();
                    topics.forEach(function (topic) {
                        promise = promise
                            .then(function () {
                                query = new Parse.Query('Comment');
                                return cachedParseQuery(query.equalTo('topic', topic), 'count');
                            })
                            .done(function (count) {
                                var target = _.findWhere($scope.topics, { id: topic.id });
                                var index = _.indexOf($scope.topics, target);
                                $scope.topics[index].count.comments = count;
                            })
                            .fail(function (error) {
                                $scope.counts.comments.push('-');
                            })
                        ;
                    });
                    return promise;
                })
                .done(function () {
                    $timeout();
                })
                .fail(function (error) {
                    $rootScope.alert = {
                        type: 'danger',
                        message: '[' + error.code + '] ' + error.message,
                        path: $location.path()
                    };
                    $timeout();
                })
            ;
        }
    ])
;
