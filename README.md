## Jello 
-------------------------------------------------------------------------------------
Apache Jelly in Javascript

Current Version :  <b>0.2</b>

### What?

Jello is Apache Jelly written in Javascript.

### Why?

People who are new to Service Now can start using Jello for creating UI Pages/UI macros, without knowing the language of Apache Jelly, just it's concepts. Like phase one and two(and many more).

### How?

It uses Esprima for parsing Javascript which outputs an AST.


### List of features:
--------------------- 
1. Supports both Phase one and Phase two.
2. Error handling - If there is an error in the Javascript written, it outputs the error at the bottom of the page.
3. Support for Control Structures `If-else` and `While` (`For` and `Switch` in development)

### To-do
--------------
1. Add support for Control Strucutres `For` and `Switch`.
2. Editor in Service Now instance(now hosted on Heroku, and available as a .zip)
3. Add feature to include UI Macros too by using `g:call`.
4. Add feature to write Processing Scripts and other scripts for UI pages/macros.
5. Add test cases using Travis-Ci and/or other tools.


You can find the demo at : http://servicenowdiary.com/Jello-master/examples.htm

You can find the distraction free editor at : http://jello-editor.herokuapp.com/

Docs can be found at : 



