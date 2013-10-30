

var JackalModel = angular.module('JackalModel', ['parse/parse',
												'nu/stream',
												'ecma/lex/lexer',
												'ecma/parse/parser',
												'sheut/run',
												'sheut/state',
												'sheut/step',
    											'sheut/operations/context',
    											'sheut/operations/reference']);



var map = Function.prototype.call.bind(Array.prototype.map);
var reduce = Function.prototype.call.bind(Array.prototype.reduce);
var get = function(p, c) {
    return p[c];
};

var printBindings = function(d, record) {
    if (record.ref) {
        var obj = run.extract(d, reference.getValue(record), DEFAULT_VALUE);
        record = obj.properties;
    }
    return Object.keys(record).reduce(function(p, c) {
        p.push({'name': c, 'value': record[c] });
        return p;
    }, []);
};


var printFrame = function(d, lex) {
    return {
        'bindings': printBindings(d, lex.record)
    };
};

var printEnvironments = function(d, ctx) {
    var environments = [];
    if (ctx.userData) {
        var environment = run.extract(d, reference.getFrom(context.environment), DEFAULT_VALUE);
        do {
            environments.push(printFrame(d, environment));
            environment = run.extract(d, reference.getFrom(context.environment.outer), DEFAULT_VALUE);
        } while (environment);
    };
    return environments;
};


/* Code Mirror
 ******************************************************************************/
var doc = CodeMirror(document.getElementById('input'), {
    'mode': 'javascript',
    'lineNumbers': true
}).doc;

var interactive = CodeMirror(document.getElementById('output-interactive-textarea'), {
    'mode': 'javascript',
    'lineNumbers': false,
});
interactive.setSize(null, 20);
interactive.on('beforeChange', function(instance, change) {
    change.update(change.from, change.to, [change.text.join("").replace(/\n/g, "")]);
    return true;
});

interactive.on('keyHandled', function(instance, name, event) {
    if (name === 'Enter') {
        runContext(interactiveDoc.getValue(), model.debug().ctx, out.write, errorOut.write);
    }
});

var interactiveDoc = interactive.doc;

/* 
 ******************************************************************************/
												
JackalModel.controller('JackalModel', ['$scope', function JackalModel($scope) {
	var self = this;
    
    var DEFAULT_VALUE = 0;
	var ErrorMessage;
	
	
	//Create Debug state, if this fails, Tell user there is an error in their syntax.
	$scope.debug = function() {
		try {
			 this.debug = run.beginFromInput($scope.input, function(x){return x;}, function(x){return x;});
		}
		catch(err) {
			ErrorMessage = "There was an error with program syntax.\n\n";
			alert(ErrorMessage);
		}
	}
	
	
	$scope.getEnvironments = function() {
		var Environments = printEnvironments(d, d.ctx);
		var name;
		var value;
		
		if(Environments == 0) {
			ErrorMessage = "There was an error retreiving the environment.\n\n";
			alert(ErrorMessage);
		} else {
			for(var i = 0; 0 < Environments.length; i++) {
				alert(Environments[i]);
			}
			return Environments;
		}
	}	
	
	$scope.getLocation = function() {
		var Location = operations.location(this.debug);
		return Location;
	}
	
	$scope.getStack = function() {
		this.stack = run.extract(debug, reference.getFrom(context.stack), DEFAULT_VALUE);
		
		
	}
    
    /*this.stack = ko.computed(function(){
        return (self.debug() && self.debug().ctx.userData ? 
            ko.utils.arrayMap(self.debug().ctx.userData.metadata.stack, function(x) {
                return {
                    'name': (x.func ? self.debug().run(object.get(x.func, 'name'), function(x){ return x.value; }) : '')
                };
            }) :
            [])
    });*/
	

	$scope.finish = function() {
    	this.debug = this.debug(this.debug().finish());
		$scope.update;
	};

	$scope.run = function() {
		this.debug = this.debug(this.debug().stepToDebugger());
		$scope.update;
	};
	
	$scope.stepOver = function() {
		this.debug = this.debug(this.debug().stepOver());
		$scope.update;
	};
	
	$scope.stepInto = function() {
		this.debug = this.debug(this.debug().step());
		$scope.update;
	};
	
	$scope.stepOut = function() {
		this.debug = this.debug(this.debug().stepOut());
		$scope.update;
	};
	
	$scope.stop = function() {
    	this.debug = this.debug(null);
		$scope.update;
	};
	
	$scope.update = function() {
		$scope.getEnvironments();
		$scope.getStack();
		$scope.getLocation();
	}
	
}]);