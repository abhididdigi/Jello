## Jello documentation:
------------------------

1. Variable Declarations
========================
##### Variable Initialization:

	var i=0; 
   
will be converted to:

	<?xml version="1.0" encoding="utf-8" ?>
	<j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide" xmlns:j2="null" 	xmlns:g2="null">
	<j:set var ="jvar_i" value="0"/>
	</j:jelly>
    
##### Variable Increment

	i = i ++
   
   
 will be converted to:
 
 
 	<?xml version="1.0" encoding="utf-8" ?>
	<j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide" xmlns:j2="null" xmlns:g2="null">
	<j:set var ="jvar_i" value="${jvar_i + 1}"/>
	</j:jelly>
    
    
##### Variable Increment 
   
   		i = i+2;
   
  will be converted to
  
  	<?xml version="1.0" encoding="utf-8" ?>
	<j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide" xmlns:j2="null" xmlns:g2="null">
	<j:set var ="jvar_i" value="${jvar_i + 2}"/>
	</j:jelly>

Note: you can also use `jvar_i` directly in Javascript declarations, if you are sure they are Jelly variables and they will be rendered properly.


2. Control Structures:
=======================

##### IF-ELSE statement

		
	var a = 0;
	if(x == 1){
    	print(a);
	}
	if(true){
    	print("Hello World!", a);
	}
    
 will be converted to
 
 		<?xml version="1.0" encoding="utf-8" ?>
		<j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide" xmlns:j2="null" 	xmlns:g2="null">
	<j:set var ="jvar_a" value="0"/>

	<j:if test="${jvar_x == 1}">${jvar_a}</j:if>

	<j:if test="${true}">Hello World!${jvar_a}</j:if>
	</j:jelly>
    
  
##### WHILE statement

		
	var a =0;
	while(a < 3){
    	print(a);
    	a++;
	}
    
 will be converted to
 
 	<?xml version="1.0" encoding="utf-8" ?>
	<j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide" xmlns:j2="null" xmlns:g2="null">
	<j:set var ="jvar_a" value="0"/>

	<j:while test="${jvar_a lt 3}">${jvar_a}<j:set var ="jvar_a" 	value="${jvar_a+1}"/></j:while>
	</j:jelly>
    
    
  
  
 ##### FOR-IN statement
 
 
 		
	evalServerCode = "var arr = ['one','two']"
	evaluate(evalServerCode,'arr','phase1');
	for(item in arr){
    	print(item);
	}

 will be converted to
 
 
 	<?xml version="1.0" encoding="utf-8" ?>
	<j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide" xmlns:j2="null" xmlns:g2="null">


	<g:evaluate var="jvar_arr">var arr = ['one','two']</g:evaluate>

	<j:forEach items="${jvar_arr}" var="jvar_item">${jvar_item} </j:forEach> 
	</j:jelly>
    
    
##### PRINT AND EVALUATE 

###### PRINT
Say you want to insert some HTML into a `while` loop of Apache Jelly. Then you use the following statement in Javascript 


	var a = 0;
	while(a <10){
    	var bool = "true";
    	if(a == 3){
    		print("yay! My name is ", a);
    	}
    	if(bool){
    		print("true")
    	}
    	else if(!bool){
    		print("false");
    	}
	}
    
    
will be converted to :

	<?xml version="1.0" encoding="utf-8" ?>
	<j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide" xmlns:j2="null" xmlns:g2="null">
	<j:set var ="jvar_a" value="0"/>

	<j:while test="${jvar_a lt 10}"><j:set var ="jvar_bool" value="true"/>
	<j:if test="${jvar_a == 3}">yay! My name is ${jvar_a}</j:if>
	<j:if test="${jvar_bool}">True</j:if>
	<j:if test="${!jvar_bool}">false</j:if></j:while>
	</j:jelly>

###### EVALUATE

Use evaluate when you want to get a `g:evaluate` tag in Apache Jelly. For example:

	var incGlideServerCode = 'var gr = new GlideRecord("incident"); gr.get("sys_id");								gr';
	evaluate(incGlideServerCode, "incidentGlide", "phase1");

in the above example, whatever you put in the variable `incGlideServerCode` will be put into an evaluate tag in Apache Jelly as shown below:

		<?xml version="1.0" encoding="utf-8" ?>
		<j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide" xmlns:j2="null" 	xmlns:g2="null">


		<g:evaluate var="jvar_incidentGlide">var gr = new GlideRecord("incident"); 				gr.get("sys_id"); gr</g:evaluate>
		</j:jelly>
        
A very *important* thing to note here is, the GlideRecord variable in Javascript (here `incGlideServerCode`) must contain the word `ServerCode` in it. That way, Jello will know which ones to convert into `evaluate` tag.


3. Exception Handling:
=======================
The editor here at http://jello-editor.herokuapp.com/ will give meaningful errors and their line numbers, which you can use to find out the Javascript errors in your code.
Also, note that use `ctrl+m` to convert Javascript to Apache Jelly.

4. PHASE TWO:
==============

All the examples until now renders everything in Phase one. For rendering things in Phase two, just wrap them around a block statement, and initialize a property called `phase` to `two` in that block.

for example :

		{
        phase : two;
        var incGlideServerCode = 'var gr = new GlideRecord("incident"); 		gr.get("sys_id");								gr';
		evaluate(incGlideServerCode, "incidentGlide", "phase1");
        }
        
 will be in phase two as :
 
 		<?xml version="1.0" encoding="utf-8" ?>
		<j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide" xmlns:j2="null" 	xmlns:g2="null">

		<g2:evaluate var="jvar_incidentGlide">var gr = new GlideRecord("incident"); 		gr.get("sys_id");								gr
        </g2:evaluate>
		</j:jelly>

... similarly by just initializing a property `phase:two` and place it in a block statement, you can convert Phase one to two.

This documentation needs a lot of examples, I would be glad if someone is ready to contribute. 

If you like what I'm doing, and if you work with Service Now, and if you can donate a ** Service Now instance ** ( like the instance all Service Now employees have) so that I can work more without relying on demos, I would be most grateful.

 	




