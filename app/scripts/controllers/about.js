'use strict';

/**
 * @ngdoc function
 * @name mommodApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the mommodApp
 */
angular.module('mommodApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
