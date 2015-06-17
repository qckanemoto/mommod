'use strict';

angular.module('mommodApp')
    .controller('TopicCtrl', ['$scope', '$routeParams', 'mockTopic', 'mockComments', function ($scope, $routeParams, mockTopic, mockComments) {
        $scope.myUserName = 'user1';

        $scope.topicId = $routeParams.topicId;

        $scope.topic = mockTopic;
        $scope.comments = mockComments;

        $scope.replyTo = null;
        $scope.commentContent = '';

        $scope.isStarred = function (stargazers) {
            return stargazers.indexOf($scope.myUserName) > -1;
        };
    }])
;
