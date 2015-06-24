'use strict';

angular.module('mommodApp')
    .factory('assertSignedIn', ['$rootScope', '$location', function ($rootScope, $location) {
        return function () {
            if (!$rootScope.currentUser) {
                $location.path('/');
            }
        };
    }])

    // cache api access to parse.com.
    .factory('cachedParseQuery', ['$cacheFactory', function ($cacheFactory) {
        return function (parseQuery, method, force) {
            force = force || false;
            var parseCache = $cacheFactory.get('parseQuery') || $cacheFactory('parseQuery');
            var key = JSON.stringify(parseQuery) + '#' + method;

            if ((parseCache.get(key) != undefined) && !force) {
                return Parse.Promise.as(parseCache.get(key));
            }

            return parseQuery[method]()
                .done(function (result) {
                    parseCache.put(key, result);
                    return Parse.Promise.as(result);
                })
        };
    }])

    // api access to parse.com.
    .factory('parse', ['cachedParseQuery', function (cachedParseQuery) {
        return {
            getTopics: function (force) {
                force = force || false;
                var query = new Parse.Query('Topic');
                return cachedParseQuery(query.include('user').descending('updatedAt'), 'find', force);
            },
            getTopic: function (topicId, force) {
                force = force || false;
                var query = new Parse.Query('Topic');
                return cachedParseQuery(query.equalTo('objectId', topicId).include('user'), 'first', force)
                    .done(function (topic) {
                        // reject user don't have read access.
                        if (!topic) {
                            var promise = new Parse.Promise();
                            promise.reject({ code: -1, message: 'You have no read access.' });
                            return promise;
                        }
                        // get joiners.
                        var userIds = _.keys(topic.getACL().toJSON());
                        query = new Parse.Query('_User');
                        var joinersPromise = cachedParseQuery(query.containedIn('objectId', userIds).ascending('username'), 'find');

                        return Parse.Promise.when(Parse.Promise.as(topic), joinersPromise);
                    })
                ;
            },
            postTopic: function (form) {
                var acl = new Parse.ACL();
                acl.setPublicReadAccess(false);
                acl.setPublicWriteAccess(false);
                acl.setReadAccess(Parse.User.current().id, true);
                acl.setWriteAccess(Parse.User.current().id, true);

                var that = this;

                var topic = new Parse.Object('Topic');
                return topic
                    .set('title', form.title)
                    .set('content', form.content)
                    .set('user', Parse.User.current())
                    .setACL(acl)
                    .save()
                    .done(function (topic) {
                        that.getTopics(true);  // update topic list.
                        return Parse.Promise.as(topic);
                    });
            },
            updateTopic: function (topic, form) {
                _.pairs(form).forEach(function (pair) {
                    topic.set(pair[0], pair[1]);
                });
                return topic.save();
            },
            getComments: function (topic, force) {
                force = force || false;
                var query = new Parse.Query('Comment');
                return cachedParseQuery(query.equalTo('topic', topic).include('user').ascending('createdAt'), 'find', force);
            },
            countComments: function (topic, force) {
                force = force || false;
                var query = new Parse.Query('Comment');
                return cachedParseQuery(query.equalTo('topic', topic), 'count', force);
            },
            postComment: function (form) {
                var acl = new Parse.ACL();
                acl.setPublicReadAccess(true);
                acl.setPublicWriteAccess(false);
                acl.setReadAccess(Parse.User.current().id, true);
                acl.setWriteAccess(Parse.User.current().id, true);

                var that = this;

                var comment = new Parse.Object('Comment');
                return comment
                    .set('content', form.content)
                    .set('user', Parse.User.current())
                    .set('topic', form.topic)
                    .set('replyTo', form.replyTo)
                    .setACL(acl)
                    .save()
                    .done(function (comment) {
                        return Parse.Promise.when(
                            Parse.Promise.as(comment),
                            that.getComments(comment.get('topic'), true),   // update comment list.
                            that.updateTopic(comment.get('topic'))  // just renew updatedAt of topic.
                        );
                    });
            },
            starComment: function (comment, star) {
                var stargazers = comment.relation('stargazers');
                if (star) {
                    stargazers.add(Parse.User.current());
                } else {
                    stargazers.remove(Parse.User.current());
                }
                var that = this;
                return comment.save()
                    .done(function (comment) {
                        return that.getStargazers(comment, true);
                    });
            },
            updateComment: function (comment, form) {
                _.pairs(form).forEach(function (pair) {
                    comment.set(pair[0], pair[1]);
                });
                return comment.save();
            },
            deleteComment: function (comment) {
                var that = this;
                return comment.destroy()
                    .done(function (comment) {
                        return Parse.Promise.when(
                            comment,
                            that.getComments(comment.get('topic'), true)    // update comment list.
                        );
                    });
            },
            getStargazers: function (comment, force) {
                force = force || false;
                return cachedParseQuery(comment.relation('stargazers').query().ascending('username'), 'find', force);
            },
            getStargazersCollection: function (comments, force) {
                force = force || false;
                var collection = [];
                var that = this;
                var promise = Parse.Promise.as();
                comments.forEach(function (comment) {
                    promise = promise
                        .then(function () {
                            return that.getStargazers(comment, force);
                        })
                        .done(function (stargazers) {
                            collection[comment.id] = stargazers;
                            return Parse.Promise.as();
                        })
                    ;
                });
                return promise
                    .done(function () {
                        return Parse.Promise.as(collection);
                    });
            }
        };
    }])
;
