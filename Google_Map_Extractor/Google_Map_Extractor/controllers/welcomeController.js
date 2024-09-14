const WelcomeController = {

    model :{
		isLoading : false,
		email : "",
		password : "",
	},

    login:($scope)=>{
		$scope.welcome.isLoading = true;
		Auth.login({
			email: $scope.welcome.email,
			password: $scope.welcome.password,
		},(r)=>{
			if (r.status=="success") {
				$scope.$apply(()=>{
					$scope.toggleTab('collectMemeber');
					$scope.welcome.isLoading = false;
				});
			}else{
				$scope.$apply(()=>{
					$scope.welcome.isLoading = false;
                    $scope.snackbar.show("Wrong email or password");
                    $scope.welcome.password = "";
				});
			}
		});
	},

};