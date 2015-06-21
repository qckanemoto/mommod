'use strict';

angular.module('mommodApp')
    .controller('ListCtrl', [
        '$scope', '$rootScope', '$location', 'assertSignedIn',
        function ($scope, $rootScope, $location, assertSignedIn) {

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

            query.topic.include('user').find()
                .then(function (topics) {
                    $scope.$apply(function () {
                        $scope.topics = topics;
                    });
                    return new Parse.Promise.as(topics);
                })
                .then(function (topics) {
                    // count joiners.
                    topics.forEach(function (topic) {
                        $scope.$apply(function () {
                            $scope.counts.joiners.push(_.keys(topic.getACL().toJSON()).length);
                        });
                    });
                    return new Parse.Promise.as(topics);
                })
                .then(function (topics) {
                    // count comments.
                    var promise = new Parse.Promise.as();
                    topics.forEach(function (topic) {
                        promise = promise
                            .then(function () {
                                return query.comment.equalTo('topic', topic).count();
                            })
                            .then(function (count) {
                                $scope.$apply(function () {
                                    $scope.counts.comments.push(count);
                                });
                            })
                        ;
                    });
                    return new Parse.Promise.as(topics);
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
