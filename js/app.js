'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
        'ngRoute',
        'myApp.filters',
        'myApp.services',
        'myApp.directives',
        'myApp.controllers',
        'ui.bootstrap'
    ]).
config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/home', {templateUrl: 'view/home.html', controller: 'homeCtrl'});
        $routeProvider.when('/class', {templateUrl: 'view/class.html', controller: 'classCtrl'});
        $routeProvider.when('/student', {templateUrl: 'view/student.html', controller: 'studentCtrl'});
        $routeProvider.when('/record', {templateUrl: 'view/record.html', controller: 'recordCtrl'});
        $routeProvider.when('/statistic', {templateUrl: 'view/statistic.html', controller: 'statisticCtrl'});
        $routeProvider.otherwise({redirectTo: '/home'});
    }]).
run(['$rootScope','$location','DataBase', function($rootScope,$location,DataBase){
        $rootScope.menus = [
            {title:'首页',link:'/home',active:true},
            {title:'班级管理',link:'/class',active:false},
            {title:'学生管理',link:'/student',active:false},
            {title:'记录管理',link:'/record',active:false},
            {title:'统计报表',link:'/statistic',active:false}
        ];
        $rootScope.toggle = function(index,event) {
            event.preventDefault();
            angular.forEach($rootScope.menus,function(obj) {
                obj.active = false;
            })
            $rootScope.menus[index].active = true;
            $location.path($rootScope.menus[index].link);
        };
        DataBase.open();
    }]);
