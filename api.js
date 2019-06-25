const fs = require("fs");
//const http = require('request');
const http = require('sync-request');
const readline = require("readline-sync");


function execute() {
    var rawSource = fs.readFileSync("sample-json.json");
    var parsedSource = JSON.parse(rawSource);
    var service=require(parsedSource.jsfile);
    //var service = {};

    parsedSource.items.forEach(item => {
        console.log("=============================\n");
        console.log(`Item ${item.id} started \n"`);
        var req = item.request;
        item.properties.forEach(prop => {

            console.log(`Item Current prop ${JSON.stringify(prop)}`);

            var value = null;
            switch (prop.type) {
                case 1: {
                    value = readInput(`Enter your input for ${prop.name}`);
                    break;
                }
                case 2: {
                    value = getFuncValue(item, prop.source);
                    break;
                }
                case 3: {
                    var args = [];
                    var funcArguments=prop.funcArguments;
                    if(funcArguments.total == funcArguments.args.length){
                        funcArguments.args.forEach(function(arg){
                            var obj=parsedSource.items.find(_=>{return _.id==arg.split('.')[0]});
                            args.push(getFuncValue(obj,arg)); 
                        });                        
                    }
                    console.log(service);

                    value = service[prop.source](...args);
                    console.log("Value from function " + value);
                    break;
                }
            }
            req = setValue(req, prop.name, value);
        });
        console.log(req);
        item.request = req;        
        var apiRes=http(item.method,item.url,{
            "headers": { "content-type": "application/json" }
        });
        var parsedRes=JSON.parse(apiRes.getBody('utf8'));               
        item.response=parsedRes; 
        if(item.afterResponse){
            var afterRes = item.afterResponse;
            var args = [];
            var funcArguments=afterRes.funcArguments;
            if(funcArguments.total == funcArguments.args.length){
                funcArguments.args.forEach(function(arg){
                    var obj=parsedSource.items.find(_=>{return _.id==arg.split('.')[0]});
                    args.push(getFuncValue(obj,arg)); 
                });                        
            }
            value = service[afterRes.source](...args);
        }
        console.log(`Item ${item.id} Ended \n"`);
        console.log("=============================\n");
    });

    console.log();
}

function readInput(question) {
    return readline.question(question);
}

function getValue(source, prop) {
    var strs = prop.split(".");
    var result = source;
    strs.forEach(_ => {
        result = result[_];
    });
    return result;
}

function getFuncValue(source, prop) {
    var strs = prop.split(".");
    var result = source;
    strs.forEach((_ ,index)=> {
        if(index){
            result = result[_];
        }        
    });
    return result;
}

function setValue(source, prop, value) {
    console.log("Set Value method callted for prop" + prop);
    var strs = prop.split(".");
    var req = source;
    strs.forEach((_, index) => {
        if (index + 1 != strs.length) {
            req = req[_];
            console.log(JSON.stringify(req));
        }
    });
    req[strs[strs.length-1]] = value;        
    return source;
}

execute();