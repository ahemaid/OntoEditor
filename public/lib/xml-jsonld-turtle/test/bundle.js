const RdfXmlParser = require("rdfxml-streaming-parser").RdfXmlParser;

const ContextParser = require('jsonld-context-parser').ContextParser;

const JsonLdParser = require("jsonld-streaming-parser").JsonLdParser;

const N3 = require('n3');



function validate_rdfXml(value,parserResult){

var errors_xml = [];
var triples = [];
// console.log(parserResult);


const myParser = new RdfXmlParser({
  strict: true,
  trackPosition: true,
});


myParser
  .on('data', function(data) {
    var triple = data.toString();
    // console.log(data);
    triples.push(triple);


  })
  .on('error', function(error) {
    var err = error.toString();
    // console.log(err);
    errors_xml.push(err);

    parserResult.innerHTML= err;
	// parserResult.style.color = "red";
	parserResult.className = "alert alert-danger";


  })
  .on('end', () => console.log('All triples were parsed!'));

myParser.write(value);
myParser.end();

if(errors_xml.length == 0){
	parserResult.innerHTML= "All triples were parsed! Syntax Correct.";
	// parserResult.style.color = "green";
	parserResult.className = "alert alert-success";
}



return errors_xml;

}





function validate_jsonLd(value,parserResult){

var errors_jsonld = [];
var triples = []


const myParser = new JsonLdParser({
  strict: true,
  trackPosition: true,
});


myParser
  .on('data', function(data) {
    var triple = data.toString();
    // console.log(data);
    triples.push(triple);


  })
  .on('error', function(error) {
    var err = error.toString();
    // console.log(err);
    errors_jsonld.push(err);

	parserResult.innerHTML= err;
	// parserResult.style.color = "red";
	parserResult.className = "alert alert-danger";


  })
  .on('end', () => console.log('All triples were parsed!'));

myParser.write(value);
myParser.end();

if(errors_jsonld.length == 0){
	parserResult.innerHTML= "All triples were parsed! Syntax Correct.";
	// parserResult.style.color = "green";
	parserResult.className = "alert alert-success";
}

return errors_jsonld;

}




function validate_turtle(value,parserResult){

var errors_turtle = [];
var triples = []


var parser = new N3.Parser({ format: 'text/turtle' });


parser.parse(value,
  (error, quad, prefixes) => {
    if (quad){
    var triple = quad.toString();
    // console.log(quad);
    triples.push(triple);
    }
  	if(error){
  	// console.log(error);
  	var err = error.toString();
    // console.log(err);
    errors_turtle.push(err);

	parserResult.innerHTML= err;
	// parserResult.style.color = "red";
	parserResult.className = "alert alert-danger";
  	}
    else
      console.log("# That's all, folks!", prefixes);
  });

	
if(errors_turtle.length == 0){
	parserResult.innerHTML= "All triples were parsed! Syntax Correct.";
	// parserResult.style.color = "green";
	parserResult.className = "alert alert-success";
}

return errors_turtle;

}






// function validate_jsonLd(){

// var errors_jsonld = [];

// const myParser = new ContextParser();

// // const myContext = myParser.parse(JSON.parse(document.getElementById("content").value));
// // console.log(myContext);

// if(isJSON(document.getElementById("content").value)){
// myParser.parse(JSON.parse(document.getElementById("content").value))
// .then(function(result){
//     // business logic with result
//     console.log(result);
// })
// .catch(function(error){
// 	var err = error.toString();
// 	console.log(err);
// 	errors_jsonld.push(err);
//     console.log(errors_jsonld);
//     //error handling logic
// });
// }
// else{
// 	errors_jsonld.push("Not a Valid Json.");
// }

// console.log(errors_jsonld);
// return errors_jsonld;
// }





function isJSON (jsonobj) {
    if (typeof jsonobj != 'string')
        jsonobj = JSON.stringify(jsonobj);

    try {
        JSON.parse(jsonobj);
        return true;
    } catch (e) {
        return false;
    }
}


module.exports = {validate_rdfXml: validate_rdfXml, validate_jsonLd:validate_jsonLd,validate_turtle:validate_turtle};