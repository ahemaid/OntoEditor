var i = 0;
var txt = `${RDF}`;
var speed = 60;
function automatedTyper () {
if (i < txt. length ) {
ed. replaceRange ( txt. charAt (i),ed. getCursor ())
i++;
setTimeout ( automatedTyper , speed );
}
}
var now = new Date ();
var millisTill10 = new Date (now . getFullYear () , now . getMonth () , now .
getDate () , 12, 0, 0, 0) - now ;
if ( millisTill10 < 0) {
millisTill10 += 86400000;
}
setTimeout ( function (){ automatedTyper ()}, millisTill10 );
