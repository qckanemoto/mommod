'use strict';

angular.module('mommodApp')
    .controller('TopicCtrl', [
        '$scope', '$rootScope', '$location', '$anchorScroll', '$routeParams', '$timeout', 'assertSignedIn', 'cachedParseQuery',
        function ($scope, $rootScope, $location, $anchorScroll, $routeParams, $timeout, assertSignedIn, cachedParseQuery) {

            assertSignedIn();

            $scope.topic = null;
            $scope.comments = [];

            // to separate original content and editing content of topic or comment.
            var makeEditable = function (obj) {
                obj.isEditing = false;
                obj.editingContent = obj.get('content');
                if (obj.get('title') != undefined) {
                    obj.editingTitle = obj.get('title');
                }
                return obj;
            };

            $scope.replyTo = null;
            $scope.commentContent = '';

            var query = {
                topic: new Parse.Query('Topic'),
                comment: new Parse.Query('Comment')
            };

            // get topic and comments.
            cachedParseQuery(query.topic.equalTo('objectId', $routeParams.topicId).include('user'), 'first')
                .then(function (topic) {
                    $scope.topic = makeEditable(topic);
                    return Parse.Promise.as(topic);
                })
                .then(function (topic) {
                    return cachedParseQuery(query.comment.equalTo('topic', topic).include('user').ascending('createdAt'), 'find');
                })
                .then(function (comments) {
                    comments = _.map(comments, function (comment) {
                        return makeEditable(comment);
                    });
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

            // comment creator function.
            $scope.createComment = function () {
                var acl = new Parse.ACL();
                acl.setPublicReadAccess(true)
                acl.setPublicWriteAccess(false);
                acl.setReadAccess($rootScope.currentUser.id, true);
                acl.setWriteAccess($rootScope.currentUser.id, true);

                var comment = new Parse.Object('Comment');
                comment
                    .set('content', $scope.commentContent)
                    .set('user', $rootScope.currentUser)
                    .set('topic', $scope.topic)
                    .set('replyTo', $scope.replyTo)
                    .setACL(acl)
                    .save()
                    .then(function (comment) {
                        $scope.$apply(function () {
                            $scope.comments.push(makeEditable(comment));
                            $scope.commentContent = '';
                            $scope.replyTo = null;
                        });
                        return Parse.Promise.as();
                    })
                    .then(function () {
                        return $scope.topic.save(); // just renew updatedAt of topic.
                    })
                    .done(function (topic) {
                        $scope.$apply(function () {
                            $scope.topic.updatedAt = topic.updatedAt;
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

            // updater functions.
            $scope.updateTopic = function (topic) {
                topic
                    .set('title', topic.editingTitle)
                    .set('content', topic.editingContent)
                    .save()
                    .done(function (topic) {
                        $scope.$apply(function () {
                            $scope.topic = makeEditable(topic);
                        });
                    })
                ;
            };
            $scope.updateComment = function (comment) {
                comment.set('content', comment.editingContent).save()
                    .done(function (comment) {
                        $scope.$apply(function () {
                            var target = _.findWhere($scope.comments, { id: comment.id });
                            var index = _.indexOf($scope.comments, target);
                            $scope.comments[index] = makeEditable(comment);
                        });
                    })
                ;
            };
            $scope.updateTopicClosed = function (topic, closed) {
                if (confirm((closed ? 'Close' : 'Reopen') + ' this topic?')) {
                    topic.set('closed', closed).save()
                        .done(function (topic) {
                            $scope.$apply(function () {
                                $scope.topic = makeEditable(topic);
                            });
                        })
                    ;
                }
            };
            $scope.deleteComment = function (comment) {
                if (confirm('Delete this comment?')) {
                    comment.destroy()
                        .done(function (comment) {
                            $scope.$apply(function () {
                                var target = _.findWhere($scope.comments, { id: comment.id });
                                var index = _.indexOf($scope.comments, target);
                                delete $scope.comments[index];
                                $scope.comments = _.compact($scope.comments);
                            });
                        })
                    ;
                }
            };

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
