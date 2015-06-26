'use strict';

angular.module('mommodApp')

    // constants.
    .constant('constants', function () {
        return {
            notificationType: {
                mentioned: 'NOTIFICATION_TYPE_MENTIONED',
                starred: 'NOTIFICATION_TYPE_STARRED',
                invited: 'NOTIFICATION_TYPE_INVITED'
            }
        };
    })

    // assert signed in.
    .factory('assertSignedIn', ['$location', function ($location) {
        return function () {
            if (!Parse.User.current()) {
                $location.path('/');
            }
        };
    }])

    // cache api access to parse.com.
    .factory('cachedParseQuery', ['$cacheFactory', function ($cacheFactory) {
        return {
            use: function (parseQuery, method, force) {
                force = force || false;
                var parseCache = $cacheFactory.get('parseQuery') || $cacheFactory('parseQuery');
                var key = JSON.stringify(parseQuery) + '#' + method;

                if ((parseCache.get(key) !== undefined) && !force) {
                    return Parse.Promise.as(parseCache.get(key));
                }

                return parseQuery[method]()
                    .done(function (result) {
                        if (result == undefined) {
                            result = null;
                        }
                        parseCache.put(key, result);
                        return Parse.Promise.as(result);
                    })
            },
            destroy: function () {
                $cacheFactory.get('parseQuery') && $cacheFactory.get('parseQuery').removeAll();
            }
        }
    }])

    // api access to parse.com.
    .factory('parse', ['cachedParseQuery', 'constants', function (cachedParseQuery, constants) {
        return {
            getTopics: function (force) {
                force = force || false;
                var query = new Parse.Query('Topic');
                return cachedParseQuery.use(query.include('user').descending('updatedAt'), 'find', force);
            },
            getTopic: function (topicId, force) {
                force = force || false;
                var query = new Parse.Query('Topic');
                return cachedParseQuery.use(query.equalTo('objectId', topicId).include('user'), 'first', force)
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
                        var joinersPromise = cachedParseQuery.use(query.containedIn('objectId', userIds).ascending('username'), 'find');

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
            getLastCommentedAt: function (topic, force) {
                force = force || false;
                var query = new Parse.Query('Comment');
                return cachedParseQuery.use(query.equalTo('topic', topic).descending('createdAt'), 'first', force)
                    .done(function (comment) {
                        if (comment) {
                            return Parse.Promise.as(comment.createdAt);
                        }
                        return Parse.Promise.as(null);
                    });
            },
            getComments: function (topic, force) {
                force = force || false;
                var query = new Parse.Query('Comment');
                return cachedParseQuery.use(query.equalTo('topic', topic).include('user').ascending('createdAt'), 'find', force);
            },
            countComments: function (topic, force) {
                force = force || false;
                var query = new Parse.Query('Comment');
                return cachedParseQuery.use(query.equalTo('topic', topic), 'count', force);
            },
            postComment: function (form) {
                var acl = new Parse.ACL();
                acl.setPublicReadAccess(false);
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
                            that.getComments(comment.get('topic'), true)   // update comment list.
                        );
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
                var query = new Parse.Query('Star');
                return cachedParseQuery.use(query.equalTo('comment', comment).ascending('user'), 'find', force)
                    .done(function (stars) {
                        var stargazers = _.map(stars, function (star) {
                            return star.get('user');
                        });
                        return Parse.Promise.as(stargazers);
                    });
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
            },
            star: function (comment) {
                var acl = new Parse.ACL();
                acl.setPublicReadAccess(false);
                acl.setPublicWriteAccess(false);
                acl.setReadAccess(Parse.User.current().id, true);
                acl.setWriteAccess(Parse.User.current().id, true);

                var star = new Parse.Object('Star');
                return star
                    .set('user', Parse.User.current())
                    .set('comment', comment)
                    .setACL(acl)
                    .save()
                    .done(function () {
                        return Parse.Promise.as();
                    });
            },
            unstar: function (comment) {
                var query = new Parse.Query('Star');
                return query.equalTo('comment', comment).equalTo('user', Parse.User.current()).first()
                    .done(function (star) {
                        return star.destroy();
                    });
            },
            getUsernames: function (force) {
                force = force || false;
                var query = new Parse.Query('_User');
                return cachedParseQuery.use(query.select(['username']), 'find', force)
                    .done(function (users) {
                        var usernames = _.map(users, function (user) {
                            return user.get('username');
                        });
                        return Parse.Promise.as(usernames);
                    });
            },
            getJoiners: function (topic, force) {
                force = force || false;
                var userIds = _.keys(topic.getACL().toJSON());
                var query = new Parse.Query('_User');
                return cachedParseQuery.use(query.containedIn('objectId', userIds).ascending('username'), 'find', force);
            },
            addJoiner: function (topic, username) {
                var that = this;
                var query = new Parse.Query('_User');
                return cachedParseQuery.use(query.equalTo('username', username), 'first')
                    .then(function (user) {
                        if (!user) {
                            var promise = new Parse.Promise();
                            promise.reject({ code: '000', message: 'No such user.' });
                            return promise;
                        }
                        topic.getACL().setReadAccess(user.id, true);
                        return Parse.Promise.when(
                            topic.save(),
                            Parse.Promise.as(user)
                        );
                    })
                    .done(function (topic, user) {
                        // save notification.
                        var message = Parse.User.current().getDisplayName() +  ' invited you to the topic #' + topic.id + ' "' + topic.get('title') + '".';
                        that.addNotification(user, message, '#/topic/' + topic.id);

                        return Parse.Promise.when(
                            Parse.Promise.as(user),
                            that.getJoiners(topic, true)    // update joiner list.
                        );
                    });
            },
            removeJoiner: function (topic, user) {
                topic.getACL().setReadAccess(user.id, false);
                return topic.save()
                    .done(function () {
                        return Parse.Promise.as(user)
                    });
            },
            updateUser: function (form, avatarFile) {
                var user = Parse.User.current();
                _.pairs(form).forEach(function (pair) {
                    user.set(pair[0], pair[1]);
                });

                var promise = Parse.Promise.as();

                // save avatarFile and get uploaded file's url first.
                if (avatarFile) {
                    var parseFile = new Parse.File(avatarFile.name, avatarFile);
                    promise = promise
                        .then(function () {
                            return parseFile.save();
                        })
                        .done(function () {
                            user.set('avatarUrl', parseFile.url());
                            return Parse.Promise.as();
                        });
                }

                // save user.
                return promise
                    .done(function () {
                        return user.save();
                    });
            },
            getNotifications: function (force) {
                force = force || false;
                var query = new Parse.Query('Notification');
                return cachedParseQuery.use(query.equalTo('user', Parse.User.current()).descending('createdAt'), 'find', force);
            },
            addNotification: function (user, message, link) {
                var notification = new Parse.Object('Notification');
                return notification
                    .set('user', user)
                    .set('message', message)
                    .set('link', link)
                    .set('type', constants.notificationType.invited)
                    .set('read', false)
                    .save();
            },
            updateNotification: function (notification, form) {
                _.pairs(form).forEach(function (pair) {
                    notification.set(pair[0], pair[1]);
                });
                return notification.save();
            }
        };
    }])
;
