'use strict';

angular.module('mommodApp')
    .controller('TopicCtrl', [
        '$scope', '$rootScope', '$location', '$anchorScroll', '$routeParams', '$timeout', 'assertSignedIn', 'ngToast', 'parse',
        function ($scope, $rootScope, $location, $anchorScroll, $routeParams, $timeout, assertSignedIn, ngToast, parse) {

            assertSignedIn();

            $scope.topic = null;
            $scope.comments = [];
            $scope.stargazers = [];
            $scope.joinsers = [];
            $scope.replyTo = null;
            $scope.commentContent = '';

            // add property of editing content which is separated from original content to topic/comment object.
            var makeEditable = function (obj) {
                obj.isEditing = false;
                obj.editingContent = obj.get('content');
                if (obj.get('title') != undefined) {
                    obj.editingTitle = obj.get('title');
                }
                return obj;
            };

            // get topic, comments and stargazers of each comments.
            $rootScope.spinner = true;
            parse.getTopic($routeParams.topicId)
                .then(function (topic, joiners) {
                    $scope.topic = makeEditable(topic);
                    $scope.joiners = joiners;
                    return parse.getComments(topic);
                })
                .then(function (comments) {
                    $scope.comments = _.map(comments, function (comment) {
                        return makeEditable(comment);
                    });
                    return parse.getStargazersCollection(comments);
                })
                .done(function (stargazersCollection) {
                    $scope.stargazers = stargazersCollection;
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
                    .done(function (comment, comments, topic) {
                        $scope.commentContent = '';
                        $scope.replyTo = null;
                        $scope.comments = _.map(comments, function (comment) {
                            return makeEditable(comment);
                        });
                        $scope.topic.updatedAt = topic.updatedAt;
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

            $scope.isStarred = function (comment) {
                return _.findWhere($scope.stargazers[comment.id], { id: $rootScope.currentUser.id });
            };

            // star or unstar comment.
            $scope.toggleStar = function (comment) {
                parse.starComment(comment, !$scope.isStarred(comment))
                    .done(function (stargazers) {
                        $scope.stargazers[comment.id] = stargazers;
                        $timeout();
                    })
                ;
            };
        }
    ])
;
