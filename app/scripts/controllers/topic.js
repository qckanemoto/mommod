'use strict';

angular.module('mommodApp')
    .controller('TopicCtrl', [
        '$scope', '$rootScope', '$location', '$anchorScroll', '$routeParams', '$timeout', 'assertSignedIn', 'cachedParseQuery',
        function ($scope, $rootScope, $location, $anchorScroll, $routeParams, $timeout, assertSignedIn, cachedParseQuery) {

            assertSignedIn();

            $scope.topic = null;
            $scope.comments = [];
            $scope.replyTo = null;
            $scope.commentContent = '';

            var query = {
                topic: new Parse.Query('Topic'),
                comment: new Parse.Query('Comment')
            };

            // get topic and comments.
            cachedParseQuery(query.topic.equalTo('objectId', $routeParams.topicId).include('user'), 'first')
                .then(function (topic) {
                    $scope.topic = topic;
                    return Parse.Promise.as(topic);
                })
                .then(function (topic) {
                    return cachedParseQuery(query.comment.equalTo('topic', topic).include('user').ascending('createdAt'), 'find');
                })
                .then(function (comments) {
                    $scope.comments = comments;
                    return Parse.Promise.as();
                })
                .done(function () {
                    $timeout();
                    $timeout($anchorScroll);  // anchorScroll after comments are rendered.
                })
                .fail(function (error) {
                })
            ;

            $scope.createComment = function () {
                var acl = new Parse.ACL();
                acl.setPublicReadAccess(true);
                acl.setPublicWriteAccess(false);
                acl.setReadAccess($rootScope.currentUser.id, true);
                acl.setWriteAccess($rootScope.currentUser.id, true);

                var topic = new Parse.Object('Comment');
                topic
                    .set('content', $scope.commentContent)
                    .set('user', $rootScope.currentUser)
                    .set('topic', $scope.topic)
                    .set('replyTo', $scope.replyTo)
                    .setACL(acl)
                    .save()
                    .done(function (comment) {
                        $scope.$apply(function () {
                            $scope.comments.push(comment);
                            $scope.commentContent = '';
                            $scope.replyTo = null;
                        });
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
            };


            $scope.submission = {};
            $scope.$watch('submission', function () {
                if ($scope.submission.submit) {
                }
            });

            $scope.isStarred = function (comment) {
                return comment.stargazers.indexOf($scope.myUserName) > -1;
            };
            $scope.toggleStar = function (comment) {
                var idx = comment.stargazers.indexOf($scope.myUserName);
                if (idx == -1) {
                    comment.stargazers.push($scope.myUserName);
                } else {
                    delete comment.stargazers[idx];
                    comment.stargazers = _.compact(comment.stargazers);
                }
            };
        }
    ])
;
