/*
http://expressjs.com/en/starter/hello-world.html
http://expressjs.com/en/starter/static-files.html
*/
var express = require('express');
var app = express();
app.set('port', (process.env.PORT || 80));

app.use(express.static(__dirname + '/public'));

app.listen(port, function () {
  console.log('Example app listening on port '+port+'!');
});