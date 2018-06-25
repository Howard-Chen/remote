//first IoT

var express = require("express");
var app = express();
var jsonfile = require('jsonfile')
var dataPath = 'data.json'
var logsPath = 'logs.json'
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "ejs");

app.get("/", function(req, res) {

    res.render("index");

});

app.get("/api", readJSON, saveLogs, function(req, res) {


    //console.log("api visited by: " + req.headers['x-forwarded-for']);
    res.send(res.locals.obj);
    resetJSON();

});

function saveLogs(req, res, next) {
    
    
    if(res.locals.obj.power !=0 ||res.locals.obj.temperature !=0 ){
    
    var logString = "{";
    logString += "\"time\":\"" + getDateTime() + "\",\"send\":" + JSON.stringify(res.locals.obj) + ",\"ip\":\"" + req.headers['x-forwarded-for'] + "\""
    logString += "}"



    jsonfile.readFile(logsPath, function(err, obj) {
        if (err) throw err;
        else {

            var new_obj = JSON.parse(logString);
            obj.push(new_obj);
            if (obj.length > 10) {
                obj.splice(0, 1);
                
            }
            
            //console.log(obj.length);
            jsonfile.writeFile(logsPath, obj, function(err) {
                if (err) { console.error(err) }
                else {
                    //console.log(logString);
                    next();
                }
            })

        }

    })

}else{
     next();
}
    
    
}

function resetJSON() {

    var dataZero = { "power": 0, "temperature": 0 }

    jsonfile.writeFile(dataPath, dataZero, function(err) {
        if (err) { console.error(err) }
        else {
            //console.log("reset");
        }

    })
}


function readJSON(req, res, next) {

    jsonfile.readFile(dataPath, function(err, obj) {
        if (err) throw err;
        else {
            res.locals.obj = obj;
            next();
        }
    });
}

function writeJSON(req, res) {

    var reqKey = Object.keys(req.body)[0];
    var newValue;

    if (reqKey === "power") {

        newValue = req.body.power;
        res.locals.obj[reqKey] = newValue;

    }
    else if ((reqKey === "temperature")) {

        newValue = req.body.temperature + res.locals.obj[reqKey];
        res.locals.obj[reqKey] = newValue;

    }
    else {
        console.log("request key not recognized");

    }

    jsonfile.writeFile(dataPath, res.locals.obj, function(err) {
        if (err) { console.error(err) }
        else {

            //console.log(res.locals.obj);
            res.send(JSON.stringify(res.locals.obj));
        }
    })
}


app.post("/set", readJSON, writeJSON);

app.get("/logs", function(req, res) {


    jsonfile.readFile(logsPath, function(err, obj) {
        if (err) throw err;
        else {
              obj.reverse();
          res.send(JSON.stringify(obj));
            
        }
    });

});

//  app.listen(process.env.PORT,process.env.IP,function(){
//      console.log("Server has Started");
//  });


const PORT = process.env.PORT || 3000;


app.listen(PORT, function() {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});


function getDateTime() {

    var date = new Date();

    var hour = (date.getHours() + 8) % 24;
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    // var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    //  return year  + month  + day  + hour  + min  + sec;

    return month + day + hour + min + sec;

}