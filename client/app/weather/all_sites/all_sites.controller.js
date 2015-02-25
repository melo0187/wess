'use strict';

angular.module('wessApp')
  .controller('AllSitesCtrl', function ($scope, $http) {
      
      $scope.day = new Date(Date.UTC(2014, 2, 25, 12, 0, 0)); //it creates a UTC date to be given to the server for the query, data start at midday
      
      $scope.monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
      
      $scope.plots = [
      {
          measurement_name:'Atmospheric Temperature',
          senstypeid: 7,
          measdescr:'avg'
      },
          {
          measurement_name:'Cumulative Rain',
          senstypeid: 14,
          measdescr:'tot'
      },
      {
          measurement_name:'Atmospheric Humidity',
          senstypeid: 6,
          measdescr:'avg'
      },
      {
          measurement_name:'Wind Speed',
          senstypeid: 4,
          measdescr:'avg'
      }
    ];
      
      // listener to the "timeSelector" message 
      $scope.$on("timeSelector", function(eventContext, timeInterval){
          $scope.timeInterval = timeInterval;
          // React to the event.
      });
      
  });
