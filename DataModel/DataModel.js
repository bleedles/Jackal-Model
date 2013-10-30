var JackalModel = angular.module('JackalModel', ['parse/parse',
												'nu/stream',
												'ecma/lex/lexer',
												'ecma/parse/parser',
												'sheut/run',
												'sheut/state',
												'sheut/step',
    											'sheut/operations/context',
    											'sheut/operations/reference']);
												
JackalModel.controller('JackalModel', ['$scope', function JackalModel($scope) {
	var self = this;
    
    var DEFAULT_VALUE = 0;
	var d;
	var ErrorMessage;
	
	//Create Debug state, if this fails, Tell user there is an error in their syntax.
	try {
		 debug = run.beginFromInput($scope.input, function(x){return x;}, function(x){return x;});
	}
	catch(err) {
		ErrorMessage = "There was an error with program syntax.\n\n";
		alert(ErrorMessage);
	}
	
	
	$scope.getEnvironments = function() {
		var Environments = run.extract(d, reference.getFrom(context.environment), DEFAULT_VALUE);
		if(Environments == 0) {
			ErrorMessage = "There was an error retreiving the environment.\n\n";
			alert(ErrorMessage);
		} else {
			return Environments;
		}
	}
	
	$scope.PrintEnvironments = function(Environments) {
		
	}
	
		
	
	$scope.getLocation = function() {
		var Location = operations.location(this.debug);
		return Location;
	}
		 
	this.environments = ko.computed(function(){
        return (self.debug() ?
            printEnvironments(self.debug(), self.debug().ctx) :
            []);
    });
    
    this.stack = ko.computed(function(){
        return (self.debug() && self.debug().ctx.userData ? 
            ko.utils.arrayMap(self.debug().ctx.userData.metadata.stack, function(x) {
                return {
                    'name': (x.func ? self.debug().run(object.get(x.func, 'name'), function(x){ return x.value; }) : '')
                };
            }) :
            [])
    });
	

	$scope.finish = function() {
    	return this.debug(this.debug().finish());
	};

	$scope.run = function() {
		return this.debug(this.debug().stepToDebugger());
	};
	
	$scope.stepOver = function() {
		return this.debug(this.debug().stepOver());
	};
	
	$scope.stepInto = function() {
		return this.debug(this.debug().step());
	};
	
	$scope.stepOut = function() {
		return this.debug(this.debug().stepOut());
	};
	
	$scope.stop = function() {
    	return this.debug(null);
	};
	
}]);