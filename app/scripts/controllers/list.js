'use strict';

angular.module('mommodApp')
    .controller('ListCtrl', [
        '$scope', '$rootScope', '$timeout', 'assertSignedIn', 'ngToast', 'parse',
        function ($scope, $rootScope, $timeout, assertSignedIn, ngToast, parse) {

            assertSignedIn();

            $scope.topics = [];

            // get topics.
            $rootScope.spinner = true;
            parse.getTopics()
                .then(function (topics) {
                    $scope.topics = topics;

                    // count joiners.
                    topics.forEach(function (topic) {
                        var count = _.keys(topic.getACL().toJSON()).length;
                        var index = _.findIndex($scope.topics, { id: topic.id });
                        $scope.topics[index].count = { joiners: count };
                    });

                    // count comments.
                    var promise = Parse.Promise.as();
                    topics.forEach(function (topic) {
                        promise = promise
                            .then(function () {
                                return parse.countComments(topic);
                            })
                            .done(function (count) {
                                var index = _.findIndex($scope.topics, { id: topic.id });
                                $scope.topics[index].count.comments = count;
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
