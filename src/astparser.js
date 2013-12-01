/*
Jell\o/ - Jelly in Javascript:
Copyright (C) diddigiabhi@gmail.com
Jello will parse the Javascript with Esrpima and then output the syntax tree.
AstParser will parse the syntax tree and convert  it to Jelly.
 */
var AstParser = {
   
   parse : function(ast){
      
      var finalJellyString = '<?xml version="1.0" encoding="utf-8" ?>\n<j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide" xmlns:j2="null" xmlns:g2="null">';
      var Syntax,VisitorKeys,VisitorValues;
      var ifConsequent = '';
      var whileConsequent = '';
      function throwError(msg){
         throw msg;
      };
      
      Syntax = {
         VariableDeclaration:'VariableDeclaration',
         Program: 'Program',
         VariableDeclarator: 'VariableDeclarator'
      };
      VisitorKeys = {
         VariableDeclaration: ['declarations'],
         Program: ['body'],
         VariableDeclarator: ['id', 'init'],
         IfStatement:['test','consequent']
         
      };
      VisitorValues= {
         VariableDeclarator : '\n<j:set var ="<%= name %>" val="<%= value %>"/>',
         IfStatement: '\n<j:if test="<%= test %>"><%= consequent%></j:if>',
         WhileStatement:'\n<j:while test="<%= test %>"><%= consequent%></j:while>',
         SetStatement:'\n<j:set var="<%= name %>" value="<%=value%>"/>',
         SetStamanetWithBraces :'\n<j:set var="<%= name %>" value="{<%=value%>}"/>'
      };
      
      function lookAtAst(){
         
         if(_.isString(ast)){
            
            return throwError('The AST format is a string.')
         }
         //now we have ast in JSON format.
         //initial body loop.
         
         try{
            _.each(ast['body'], function(row){prepareString(row);});
         }
         catch(e){
            return throwError(e);
         }
         
         
         
         finalJellyString += '\n</j:jelly>';
         return finalJellyString;
         
         
      };
      
      
      
      
      
      function prepareString(row,stage){
         //getting the keys.
         
         
         
         function padBinaryExpression(row,operator,noWrap){
            
            if(row.type == 'Literal'){
               
               ifConsequent += row.value;
                  return row.value;
            }
            else if(row.type == 'Identifier'){
               
               if(noWrap){
                  
                  ifConsequent += pad('Identifier',row.name);
                   return  pad('Identifier',row.name);
               }
               else{
                  ifConsequent +='${'+  pad('Identifier',row.name)+'}';
                     return '${'+  pad('Identifier',row.name)+'}';
               }
            }
            
            else if(row.type == 'BinaryExpression'){
               
               if(operator){
                  
                  return padBinaryExpression(row.left,true,true)+row.operator+ padBinaryExpression(row.right,true,true);

               }
               
               else
                  return padBinaryExpression(row.left)+padBinaryExpression(row.right);
            }
            
            
         }
         
         
         
         
         
         
         if(row.type == 'ExpressionStatement'){
            
            var retLeftRight='';
            if(row.expression.type == 'UpdateExpression'){
               if(row.expression.operator == '++'){
                  var o = {};
                  o['name'] = pad('Identifier',row.expression.argument.name);
                  o['value'] = '${'+pad('Identifier',row.expression.argument.name)+'+1}';
                  var compile = _.template(VisitorValues['SetStatement']);
                  if(stage == 'while' || stage == 'if')
                     ifConsequent += compile(o);
                     else finalJellyString+= compile(o);
                     
               }
            }
            
            if(row.expression.type == 'AssignmentExpression'){
               var o = {}
               o['name'] = pad(row.expression.left.type,row.expression.left.name);
               o['value'] = padBinaryExpression(row.expression.right,true,true);
               var compile = _.template(VisitorValues['SetStamanetWithBraces']);
               if(stage == 'while' || stage == 'if')
                     ifConsequent += compile(o);
                     else finalJellyString+= compile(o);
               
            }
            
            
            
            if(row.expression.type == 'CallExpression'){
               
               if(row.expression.callee.name == 'print'){
                  
                  _.each(row.expression.arguments,padBinaryExpression);
                  
                  
                  
                  
                  
                  
               }
            }
         }
         
         
         
         
         if(row.type == 'IfStatement'){
            var o = {};
            o['test'] = pad(row.test.left.type, row.test.left.name) + pad('Operator',row.test.operator)+pad(row.test.right.type,row.test.right.value);
            
            
            _.each(row.consequent['body'],function(row){prepareString(row,'while');});
            o['consequent'] = ifConsequent;
            
            
            var compile = _.template(VisitorValues['IfStatement']);
            finalJellyString += compile(o);
            return;
            
            
            
         }
         if(row.type == 'WhileStatement'){
            var o = {};
            o['test'] = pad(row.test.left.type, row.test.left.name) + pad('Operator',row.test.operator)+pad(row.test.right.type,row.test.right.value);
            
            _.each(row.body['body'],function(row){prepareString(row);});
            o['consequent'] = ifConsequent;
            
            
            var compile = _.template(VisitorValues['WhileStatement']);
            finalJellyString += compile(o);
         }
         
         
         
         
         var keys = VisitorKeys[row.type];
         
         _.each(keys,function(obj){
            
            if(obj == 'declarations'){
               //array
               
               var declarations = row[obj];					}
               var o = {};
               _.each(declarations,function(declarator){
                  if(declarator.type == 'VariableDeclarator'){
                     if(declarator['id']['name'].indexOf('jvar_') != -1){
                        o['name'] = declarator['id']['name'];
                     }
                     else{
                        o['name'] = 'jvar_'+declarator['id']['name'];
                     }
                     
                     o['value'] = declarator['init']['value'];
                     var compile = _.template(VisitorValues.VariableDeclarator);
                     finalJellyString += compile(o);
                     
                  }
               });
               
            });
            
            
            
            
            
         }
         
         
         
         
         
         function pad(type,value){
            if(type == 'Identifier'){
               return 'jvar_'+value;
            }
            else if(type == 'Operator'){
               if(value.indexOf('<') != -1 ){
                  return value.replace('<', ' lt ')
               }
               else if(value.indexOf('>') != -1){
                  return value.replace('>',' gt ');
               }
               else return value;
               }
            else return value;
            }
         
         
         
         
         
         
         return lookAtAst();
      }
      
      
      
      
      
   }
