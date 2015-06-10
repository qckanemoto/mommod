'use strict';

/**
 * @ngdoc function
 * @name mommodApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mommodApp
 */
angular.module('mommodApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
