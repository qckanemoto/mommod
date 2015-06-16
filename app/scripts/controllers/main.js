'use strict';

angular.module('mommodApp')
    .controller('MainCtrl', ['$scope', 'mockTopic', 'mockComments', function ($scope, mockTopic, mockComments) {

        $scope.myUserName = 'user1';

        $scope.topic = mockTopic;
        $scope.comments = mockComments;

        $scope.replyTo = null;

        $scope.isStarred = function (stargazers) {
            return stargazers.indexOf($scope.myUserName) > -1;
        };

        $scope.isEditing = true;
        $scope.editingContent = '';
    }])
;
