'use strict';

function UserController($scope) {
    $scope.busy = false;
    $scope.user = null;
    $scope.users = [];

    $scope.logout = function() {
        $scope.$apply(function() { $scope.users = [] });
    }

    $scope.setUsers = function(users) {
        users.forEach(function(user) {
            user.busy = user.status === "busy";
        });
        $scope.$apply(function() { $scope.users = users });
    }

     $scope.setUser = function(user) {
        $scope.user = user;
        $scope.statusUpdated();
    }

    $scope.setStatus = function(status) {
        $scope.user.status = status;
        $scope.statusUpdated();
    }

    $scope.statusUpdated = function() {
        $scope.$apply(function() { 
            $scope.busy = $scope.user.status === "busy"
        });
    }
}

