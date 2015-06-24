'use strict';

angular.module('mommodApp')
    .controller('TopicCtrl', [
        '$scope', '$rootScope', '$location', '$anchorScroll', '$routeParams', '$timeout', 'assertSignedIn', 'ngToast', 'parse',
        function ($scope, $rootScope, $location, $anchorScroll, $routeParams, $timeout, assertSignedIn, ngToast, parse) {

            assertSignedIn();

            $scope.topic = null;
            $scope.comments = [];
            $scope.joinsers = [];
            $scope.replyTo = null;
            $scope.commentContent = '';
            $scope.lastCommentedAt = null;

            // add property of editing content which is separated from original content to topic/comment object.
            var makeEditable = function (obj) {
                obj.isEditing = false;
                obj.editingContent = obj.get('content');
                if (obj.get('title') != undefined) {
                    obj.editingTitle = obj.get('title');
                }
                return obj;
            };

            // get topic, comments.
            $rootScope.spinner = true;
            parse.getTopic($routeParams.topicId)
                .then(function (topic, joiners) {
                    $scope.topic = makeEditable(topic);
                    $scope.joiners = joiners;
                    return Parse.Promise.when(Parse.Promise.as(topic), parse.getLastCommentedAt($scope.topic));
                })
                .then(function (topic, lastCommentedAt) {
                    $scope.lastCommentedAt = lastCommentedAt;
                    return parse.getComments(topic);
                })
                .done(function (comments) {
                    $scope.comments = _.map(comments, function (comment) {
                        return makeEditable(comment);
                    });
                    $rootScope.spinner = false;
                    $timeout();
                    $timeout($anchorScroll);  // anchorScroll after comments are rendered.
                })
                .fail(function (error) {
                    $location.path('list');
                    ngToast.create('[' + error.code + '] ' + error.message);
                    $rootScope.spinner = false;
                    $timeout();
                })
            ;

            //-------------------------------------------------------------------------------------
            // scope functions.
            //-------------------------------------------------------------------------------------

            $scope.postComment = function () {
                $rootScope.spinner = true;
                parse.postComment({
                    content: $scope.commentContent,
                    topic: $scope.topic,
                    replyTo: $scope.replyTo
                })
                    .done(function (comment, comments) {
                        $scope.commentContent = '';
                        $scope.replyTo = null;
                        $scope.comments = _.map(comments, function (comment) {
                            return makeEditable(comment);
                        });
                        $scope.lastCommentedAt = new Date();
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

            $scope.deleteComment = function (comment) {
                if (confirm('Delete this comment?')) {
                    $rootScope.spinner = true;
                    parse.deleteComment(comment)
                        .done(function (comment, comments) {
                            $scope.comments = _.map(comments, function (comment) {
                                return makeEditable(comment);
                            });
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

            $scope.updateTopic = function (topic) {
                $rootScope.spinner = true;
                parse.updateTopic(topic, {
                    title: topic.editingTitle,
                    content: topic.editingContent
                })
                    .done(function (topic) {
                        $scope.topic = makeEditable(topic);
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

            $scope.updateComment = function (comment) {
                $rootScope.spinner = true;
                parse.updateComment(comment, { content: comment.editingContent })
                    .done(function (comment) {
                        var index = _.findIndex($scope.comments, { id: comment.id });
                        $scope.comments[index] = makeEditable(comment);
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

            // close or reopen topic.
            $scope.updateTopicClosed = function (topic, closed) {
                if (confirm((closed ? 'Close' : 'Reopen') + ' this topic?')) {
                    $rootScope.spinner = true;
                    parse.updateTopic(topic, { closed: closed })
                        .done(function (topic) {
                            $scope.topic = makeEditable(topic);
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
