'use strict';

angular.module('mommodApp')
    .controller('TopicCtrl', [
        '$scope', '$rootScope', '$location', '$anchorScroll', '$routeParams', '$timeout', 'assertSignedIn', 'cachedParseQuery', 'ngToast',
        function ($scope, $rootScope, $location, $anchorScroll, $routeParams, $timeout, assertSignedIn, cachedParseQuery, ngToast) {

            assertSignedIn();

            $scope.topic = null;
            $scope.comments = [];
            $scope.stargazers = [];
            $scope.joinsers = [];

            // add property of editing content which is separated from original content to topic/comment object.
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

            var query = null;

            // get topic and comments and stargazers.
            query = new Parse.Query('Topic');
            cachedParseQuery(query.equalTo('objectId', $routeParams.topicId).include('user'), 'first')
                .then(function (topic) {
                    var promise = new Parse.Promise();

                    // reject user don't have read access.
                    if (!topic) {
                        promise.reject({ code: -1, message: 'You have no read access.' });
                        return promise;
                    }

                    $scope.topic = makeEditable(topic);

                    // get joiners.
                    var userIds = _.keys(topic.getACL().toJSON());
                    query = new Parse.Query('_User');
                    var joinersPromise = cachedParseQuery(query.containedIn('objectId', userIds).ascending('username'), 'find');

                    return Parse.Promise.when(joinersPromise, Parse.Promise.as(topic));
                })
                .then(function (joiners, topic) {
                    $scope.joiners = joiners;

                    query = new Parse.Query('Comment');
                    return cachedParseQuery(query.equalTo('topic', topic).include('user').ascending('createdAt'), 'find');
                })
                .then(function (comments) {
                    comments = _.map(comments, function (comment) {
                        return makeEditable(comment);
                    });
                    $scope.comments = comments;

                    var promise = Parse.Promise.as();
                    comments.forEach(function (comment) {
                        promise = promise
                            .then(function () {
                                return cachedParseQuery(comment.relation('stargazers').query(), 'find');
                            })
                            .done(function (stargazers) {
                                $scope.stargazers[comment.id] = stargazers;
                            })
                        ;
                    });
                    return promise;
                })
                .done(function () {
                    $timeout();
                    $timeout($anchorScroll);  // anchorScroll after comments are rendered.
                })
                .fail(function (error) {
                    $location.path('list');
                    ngToast.create('[' + error.code + '] ' + error.message);
                    $timeout();
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
                        $scope.comments.push(makeEditable(comment));
                        $scope.commentContent = '';
                        $scope.replyTo = null;

                        return $scope.topic.save(); // just renew updatedAt of topic.
                    })
                    .done(function (topic) {
                        $scope.topic.updatedAt = topic.updatedAt;
                        $timeout();
                    })
                    .fail(function (error) {
                        ngToast.create('[' + error.code + '] ' + error.message);
                        $timeout();
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
                        $scope.topic = makeEditable(topic);
                        $timeout();
                    })
                ;
            };
            $scope.updateComment = function (comment) {
                comment.set('content', comment.editingContent).save()
                    .done(function (comment) {
                        var target = _.findWhere($scope.comments, { id: comment.id });
                        var index = _.indexOf($scope.comments, target);
                        $scope.comments[index] = makeEditable(comment);
                        $timeout();
                    })
                ;
            };
            $scope.updateTopicClosed = function (topic, closed) {
                if (confirm((closed ? 'Close' : 'Reopen') + ' this topic?')) {
                    topic.set('closed', closed).save()
                        .done(function (topic) {
                            $scope.topic = makeEditable(topic);
                            $timeout();
                        })
                    ;
                }
            };
            $scope.deleteComment = function (comment) {
                if (confirm('Delete this comment?')) {
                    comment.destroy()
                        .done(function (comment) {
                            var target = _.findWhere($scope.comments, { id: comment.id });
                            var index = _.indexOf($scope.comments, target);
                            delete $scope.comments[index];
                            $scope.comments = _.compact($scope.comments);
                            $timeout();
                        })
                    ;
                }
            };

            // star related functions.
            $scope.isStarred = function (comment) {
                return _.findWhere($scope.stargazers[comment.id], { id: $rootScope.currentUser.id });
            };
            $scope.toggleStar = function (comment) {
                var me = $rootScope.currentUser;
                var stargazers = comment.relation('stargazers');

                if (!$scope.isStarred(comment)) {
                    stargazers.add(me);
                    comment.save()
                        .done(function (comment) {
                            $scope.stargazers[comment.id].push($rootScope.currentUser);
                            $timeout();
                        })
                    ;
                } else {
                    stargazers.remove(me);
                    comment.save()
                        .done(function (comment) {
                            var target = _.findWhere($scope.stargazers[comment.id], { id: me.id });
                            var index = _.indexOf($scope.stargazers[comment.id], target);
                            delete $scope.stargazers[comment.id][index];
                            $scope.stargazers[comment.id] = _.compact($scope.stargazers[comment.id]);
                            $timeout();
                        })
                    ;
                }
            };
        }
    ])
;
