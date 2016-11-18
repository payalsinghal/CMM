var app = angular.module('myApp', ['ngRoute']);
app.config(['$routeProvider', function($routeProvider) {
     $routeProvider.when('/', {
         templateUrl: 'login.html',
         controller: 'loginController'
     }).when('/register', {
         templateUrl: 'register.html',
         controller: 'registration'
     }).when('/profile', {
         templateUrl: 'views/profile.html',
         controller: 'profileController'
     }).otherwise({
     redirectTo : '/'
     });

     // $locationProvider.html5Mode(true);
 }]);


app.controller('registration', function($scope, $http, $location) {
    console.log("success")
    $scope.register = function() {
        // ajaxindicatorstart('loading ...');
        console.log($scope.user)

        $http.post('/api/regs', $scope.user).success(function(data) {

            console.log(data)
            if (data.success) {
                console.log("success")
                // $scope.otp = true;
                // ajaxindicatorstop();

            } else {
                console.log(data.message)
                // ajaxindicatorstop();
            }


        });

    };

    // $scope.onetimepassword = function() {
    //     ajaxindicatorstart('loading ...');
    //     console.log($scope.user)

    //     $http.post('/api/verify', $scope.user).success(function(data) {
    //         console.log(data)
    //         if (data.success) {
    //             console.log("registration success")
    //             $location.path('/')
    //             ajaxindicatorstop();

    //         } else {
    //             console.log(data.message)
    //             ajaxindicatorstop();
    //         }


    //     });

    // };

});

app.controller('profileController',function($scope, $http, $location){         

            $http.get('/api/getContact', $scope.user).success(function(data) {
                console.log(data)
                if (response.data.success) {
                    $scope.user = response.data.data;
                } 
                else {

                }
            });


            // $scope.remove=function(item){ 
            // var index=$scope.contact.indexOf(item)
            // $scope.contact.splice(index,1);
});

app.controller('loginController',['$scope','$http', '$location',function($scope,$http,$location){
    console.log('running')
    $scope.login = function(){
        $location.path('/profile')
         // $rootScope.isAdmin=true;
    

    }
    
}]);











app.controller('loginsController', function($scope, $http, $location) {
console.log("success");
    $scope.user={
        email:'',
        password:''
    }

    $scope.validate=function(){
        if($scope.user.email==''){
            // $rootScope.showAlert('Error','Please enter email');
            return false;
        }else if($scope.user.password==''){
            // $rootScope.showAlert('Error','Please enter password');
            return false;
        }
        return true;
    }

    $scope.login = function() {
        if(!$scope.validate()){
            return;
        }
        // ajaxindicatorstart('loading ...');
        $http.post('/api/login', $scope.user).success(function(data, status, config) {
            console.log(data)
            if (data.success) {
                
                // ajaxindicatorstop();
                // console.log(headers()['token']);
                // $rootScope.token = headers()['token'];
                // localStorage.setItem('token',$rootScope.token);
                $location.path('/profile')
            } else {
                console.log(data.message)
                // $rootScope.showAlert('Error',data.message);
                // ajaxindicatorstop();
            }

        });

    };
});
