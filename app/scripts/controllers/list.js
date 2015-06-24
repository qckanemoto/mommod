'use strict';

angular.module('mommodApp')
    .controller('ListCtrl', [
        '$scope', '$rootScope', '$timeout', 'assertSignedIn', 'ngToast', 'parse',
        function ($scope, $rootScope, $timeout, assertSignedIn, ngToast, parse) {

            assertSignedIn();

            $scope.topics = [];
            $scope.joinerCounts = [];
            $scope.commentCounts = [];
            $scope.lastCommentedAts = [];

            // get topics.
            $rootScope.spinner = true;
            parse.getTopics()
                .then(function (topics) {
                    $scope.topics = topics;

                    // get lastCommentedAts.
                    var promise = Parse.Promise.as();
                    topics.forEach(function (topic) {
                        promise = promise
                            .then(function () {
                                return parse.getLastCommentedAt(topic);
                            })
                            .done(function (lastCommentedAt) {
                                $scope.lastCommentedAts[topic.id] = lastCommentedAt;
                            })
                        ;
                    });
                    return Parse.Promise.when(Parse.Promise.as(topics), promise);
                })
                .then(function (topics) {
                    // count joiners.
                    topics.forEach(function (topic) {
                        var count = _.keys(topic.getACL().toJSON()).length;
                        $scope.joinerCounts[topic.id] = count;
                    });

                    // count comments.
                    var promise = Parse.Promise.as();
                    topics.forEach(function (topic) {
                        promise = promise
                            .then(function () {
                                return parse.countComments(topic);
                            })
                            .done(function (count) {
                                $scope.commentCounts[topic.id] = count;
                            })
                            .fail(function () {
                                $scope.counts.comments.push('-');
                            })
                        ;
                    });
                    return promise;
                })
                .done(function () {
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
    ])
;
