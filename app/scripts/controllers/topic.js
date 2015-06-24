'use strict';

angular.module('mommodApp')
    .controller('TopicCtrl', [
        '$scope', '$rootScope', '$location', '$anchorScroll', '$routeParams', '$timeout', 'assertSignedIn', 'cachedParseQuery', 'ngToast', 'parse',
        function ($scope, $rootScope, $location, $anchorScroll, $routeParams, $timeout, assertSignedIn, cachedParseQuery, ngToast, parse) {

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

            // get and store comments and stargazers of each comments to scope.
            var getComments = function (topic, force) {
                force = force || false;
                $rootScope.spinner = true;
                return parse.getComments(topic, force)
                    .then(function (comments) {
                        comments = _.map(comments, function (comment) {
                            return makeEditable(comment);
                        });
                        $scope.comments = comments;

                        var promise = new Parse.Promise.as(comments);
                        comments.forEach(function (comment) {
                            promise = promise
                                .then(function () {
                                    return parse.getStargazers(comment)
                                })
                                .done(function (stargazers) {
                                    $scope.stargazers[comment.id] = stargazers;
                                })
                            ;
                        });
                        return promise;
                    })
                    .done(function () {
                        $rootScope.spinner = false;
                        $timeout();
                    });
            };

            // get topic, comments and stargazers of each comments.
            $rootScope.spinner = true;
            parse.getTopic($routeParams.topicId)
                .then(function (topic, joiners) {
                    $scope.topic = makeEditable(topic);
                    $scope.joiners = joiners;
                    return getComments(topic);
                })
                .done(function () {
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
                    .then(function () {
                        $scope.commentContent = '';
                        $scope.replyTo = null;
                        return getComments($scope.topic, true);
                    })
                    .then(function () {
                        return $scope.topic.save(); // just renew updatedAt of topic.
                    })
                    .done(function (topic) {
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
                        .then(function () {
                            return getComments($scope.topic, true);
                        })
                        .done(function () {
                            $rootScope.spinner = false;
                            //console.log($scope.comments);
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
                    parse.updateTopic(topic, { closed: closed })
                        .done(function (topic) {
                            $scope.topic = makeEditable(topic);
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
