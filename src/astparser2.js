/*
Jell\o/ - Jelly in Javascript:
Copyright (C) diddigiabhi@gmail.com
Jello will parse the Javascript with Esrpima and then output the syntax tree.
AstParser will parse the syntax tree and convert  it to Jelly.
 */

var AstParser = {
   
   parse : function(ast){
      var finalJellyString = '<?xml version="1.0" encoding="utf-8" ?>\n<j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide" xmlns:j2="null" xmlns:g2="null">';
      var Syntax,VisitorValues;
      var ifConsequent = '';
      var whileConsequent = '';
      function throwError(msg){
         throw msg;
      };
      
      codeBlocks = {};
      Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        ArrayPattern: 'ArrayPattern',
        ArrowFunctionExpression: 'ArrowFunctionExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ComprehensionBlock: 'ComprehensionBlock',
        ComprehensionExpression: 'ComprehensionExpression',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DirectiveStatement: 'DirectiveStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement',
        YieldExpression: 'YieldExpression'

      };

      Lookahead = {//Capturing only complex values.
         VariableDeclaration: 'declarations',
         IfStatement: 'consequent',
         WhileStatement: 'body',
         BlockStatement: 'body',
         ExpressionStatement: 'expression',
         FunctionDeclaration: 'body',
         ForStatement: 'body'
      };


      VisitorValues= {
         VariableDeclarator : '<j:set var ="<%= name %>" value="<%= value %>"/>',
         IfStatement: '\n<j:if test="${<%= test %>}"><%= consequent%></j:if>',
         WhileStatement:'\n<j:while test="${<%= test %>}"><%= consequent%></j:while>',
         SetStatement:'\n<j:set var="<%= name %>" value="<%=value%>"/>',
         SetStamanetWithBraces :'\n<j:set var="<%= name %>" value="{<%=value%>}"/>',
         ForInStatement:'\n<j:forEach items="${<%= collection %>}" var="<%= placeholder %>"><%= block %> </j:forEach> ',
         EvalStatement: '\n<g:evaluate var="<%= variable %>"><%= evalCode %></g:evaluate>'
      };
      
      function lookAtAst(AST){
         var ast = AST; // the AST tree.
         //the lookAtAst will be just a wrapper, Everything won't happen here.
         //Handling the primitives,Get the body and pass it to respective functions again and again.
         var body = ast.body;
         //deep traversal of AST for Phase two, check for block statements
         deepTraverse(body,false);
         console.log("After Deep travserse",body);

         return _.map(body,processNodes).join('\n');
         
      }
      function deepTraverse(node,phaseBool){
         //console.log(phaseBool,"When the function enteres.")
         var phaseTwo = false;
         if(_.isArray(node)){//iterate 'em all
            for(i in node){
               deepTraverse(node[i],phaseBool);
            }
         }
         else if(node.type in Lookahead){
            //one of the compund values. Check if there is a block statement present.
            //If there is a block statement and has phase two, append true to each node we traverse.
            //Search for a `labeled statement` and if its phase two, note it down.
            
            //console.log(node.type,"in the lookahead");
            if(phaseBool){
               node.phase = 'two';
            }
            if(node.type == 'BlockStatement'){
               
               _.each(node[Lookahead['BlockStatement']], function(elem){
                  console.log("inside block statement statement" ,elem);
                  if(elem.type === 'LabeledStatement'){
                     console.log("Inside Labelled Statement"+elem.label.name+elem.body.expression.name)
                     if(elem.label.name === 'phase' && elem.body.expression.name == 'two'){
                        
                        phaseTwo = true;
                     }
                  }
               });
            }
            var nextKey = Lookahead[node.type];
            //console.log("next key",nextKey);
            var nextNode = node[nextKey];
            //console.log("next Node",nextNode);
            //console.log("Phase Two value",phaseTwo);
            //console.log("phaseBool Value",phaseBool);

            if(phaseTwo || phaseBool){
               deepTraverse(nextNode,true);
            }
            else{
            deepTraverse(nextNode,false);
            }
         }
         else{
            if(phaseBool){
               node.phase = 'two';
            }
            return;
         }
      }

      function template(o,statement){
         var compile = _.template(VisitorValues[statement]);
         
         
         return compile(o);
      }
      
      function processOperator(operator){
         if(operator.indexOf('>') != -1 &&  operator.indexOf('>=') == -1 ){
            return ' gt ';
         }
         else if(operator.indexOf('<') != -1 &&  operator.indexOf('<=') == -1 ){
            return ' lt ';
         }
         else return ' '+operator+' ';
         }
      
      function processNodes(row){
         //Gets a row.Real processing happens here.
         //return the jelly interpretation of that particular row ONLY.
         //This will be recursive function too.
         if(row.type == 'Literal'){
            return row.value;
         }
         if(row.type == 'Identifier'){
            var iden = '';
            
            if(row.name.indexOf('jvar_') == -1){
               iden =  'jvar_'+row.name;
            }
            else iden =  row.name;
               if(row.nobrace) return iden;
               else return '${'+iden+'}'
            }
         
         if(row.type == 'AssignmentExpression'){
            var o = {};
            
            if(row.left.name.indexOf('ServerCode') != -1){
               	
               	codeBlocks[row.left.name] = row.right.value;
               	
               	return;

               }
            
            row.left.nobrace = true;
            o.name = processNodes(row.left);
            o.value = processNodes(row.right);
            var val = o.value+'';
            
            if(val.indexOf('jvar_') > -1){
               o.value = '${'+val+'}';
               
            }
            return template(o,'VariableDeclarator')
            
            
         }
         
         if(row.type == 'CallExpression'){
            if(row.callee.name == 'print'){
            return _.map(row.arguments,processNodes).join('');
        }
        else if(row.callee.name == 'evaluate'){
        	var o = {};
        	
        	_.each(row.arguments,function(obj){
        		 
        		if(obj.type == 'Identifier'){
        			
        			o.evalCode  = codeBlocks[obj.name];
        		}
        		else if(obj.type == 'Literal' && obj.value.indexOf('phase') != -1){
        			//do nothing for now, as we are dealing with Phase 1 only.
        		}
        		else{
        			o.variable = 'jvar_'+ obj.value;
        		}
        	});
        	
        	return template(o,'EvalStatement');

        }
         }
         if(row.type == 'ExpressionStatement'){
            return processNodes(row.expression);
         }
         
         if(row.type == 'BlockStatement'){
            //Series of lines will follow, hence use a map.
            return _.map(row.body, processNodes).join('');
         }
         if(row.type == 'UnaryExpression'){
            if(row.operator == '!'){
            	row.argument.nobrace = true;
            	return row.operator+ processNodes(row.argument);
            }
            return row.operator + processNodes(row.argument);
         }
         
         
         if(row.type == 'BinaryExpression'|| row.type == 'LogicalExpression'){
            row.left.nobrace = 'true';
            row.right.nobrace = 'true';
            return processNodes(row.left) + processOperator(row.operator) + processNodes(row.right);
         }
         
         
         
         //Start the declarations.
         //Three forms of Declarations defined
         //a) var i=0 => <j:set var ="jvar_i" val="0"/>
         //b) var i = i+1 =><j:set var ="jvar_i" val="${jvar_i+1}"/>
         //c)If you are sure about it being a jelly variable: var jvar_i = 0 => <j:set var ="jvar_i" val="0"/>
         //d)i=0 => <j:set var ="jvar_i" val="0"/>

		//Type of Assigments supported:
		//i = i+2;
		//i++;
		

         
         if(row.type == 'VariableDeclaration'){
            finalString = _.map(row.declarations,processNodes).join('');
            return finalString;
            
         }

         if(row.type == 'UpdateExpression'){
         	var o = {};
         	row.argument.nobrace = true;
         	var paddedName = processNodes(row.argument);
         	o.name = '{'+ paddedName+'}';
         	//value 1 ++ isn't allowed. Hence always we have a variable here. Hence padding ${}
         	o.value =  '${'+paddedName +'+1}';
         	return template(o,'VariableDeclarator');


         }
         
         if(row.type == 'VariableDeclarator'){
            //id
            var o = {};
            if(!(_.isNull(row.id) || _.isUndefined(row.id))){
              
               if(row.id.name.indexOf('ServerCode') != -1){
               	
               	codeBlocks[row.id.name] = row.init.value;
               	
               	return;

               }
               
               if(row.id.type == 'Identifier'){
                  row.id.nobrace = true;
                  o.name = processNodes(row.id);
               }
            }
            
            if(!(_.isNull(row.init) || _.isUndefined(row.init))){
               if(row.init.type == 'Literal')
                  o.value = processNodes(row.init)
               else if(row.init.type == 'BinaryExpression')
                  o.value = processNodes(row.init);
               
            }
            
            
            
            if(_.isNull(row.init)) o.value = '0';
               var val = o.value+'';
            
            if(val.indexOf('jvar_') > -1){
               o.value = '${'+val+'}';
            }
            
            
            return template(o,'VariableDeclarator');
            
            
         }
         
         //Start of condtional statements
         //List of conditional structures :
         //a) If..Else
         //b)While
         
         //c)For
         
         
         //IF Statement
         //Supported formats
         //if(x == 1)
         //if(x)
         //if(x)else if(x)
         //else{} is NOT supported. Mention your condition clearly using if and else if only.
         //This is because, Jelly doesn't have an else tag. Those there is clearly hack, its for later versions.
         if(row.type == 'IfStatement'){
            var o = {}
            if(row.test.type == 'Identifier'){ row.test.nobrace = true; o.test = processNodes(row.test);}
               else {o.test = processNodes(row.test);}
               o.consequent = processNodes(row.consequent);
            if(_.isNull(row.alternate)){  return template(o,'IfStatement') ;  }
               else  { return template(o,'IfStatement')+processNodes(row.alternate); }
               
            
            
         }
         
         
         //While loop
         //Syntaxes accepted :
         // while( i< 1) 
         // while(i)

         if(row.type == 'WhileStatement'){
            
            var o = {}
            if(row.test.type == 'Identifier'){ row.test.nobrace = true; o.test = processNodes(row.test);}
               else {o.test = processNodes(row.test);}
               o.consequent = processNodes(row.body);
            return template(o,'WhileStatement') ;
         }

         //For loop
         //Syntax accepted: for(die in dice ){//body goes here.}
         if(row.type == 'ForInStatement'){
         	var o = {};
         	row.left.nobrace = true;
         	row.right.nobrace = true;
         	o.collection = processNodes(row.right);
         	o.placeholder = processNodes(row.left);
         	o.block = processNodes(row.body);
         	return template(o,'ForInStatement');

         }



         



         
         
         
         
      }
      
      
      
      
      
      finalJellyString += '\n' + lookAtAst(ast);
      finalJellyString += '\n</j:jelly>';
      return finalJellyString;
      
      
      
   }
   
   
   
}