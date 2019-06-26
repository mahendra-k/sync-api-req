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
                    var item=parsedSource.items.find(_=>{return _.id==prop.source.split('.')[0]});
                    value = getFuncValue(item, prop.source);
                    break;
                }
                case 3: {
                    var args = [];
                    var funcArguments = prop.funcArguments;
                    funcArguments.args.forEach(function (arg) {
                        var obj = parsedSource.items.find(_ => { return _.id == arg.split('.')[0] });
                        args.push(getFuncValue(obj, arg));
                    });
                    for (i = funcArguments.args.length; i < funcArguments.total; i++) {
                        var value = readInput(`Enter func arg ${i}`);
                        args.push(value);
                    }

                    value = service[prop.source](...args);
                    console.log("Value from function " + value + "\n");
                    break;
                }
            }
            req = setValue(req, prop.name, value);
        });

        console.log("================ Req =================");
        console.log(req);
        console.log(JSON.stringify(req));
        item.request = req;        
        var apiRes=http(item.method,item.url,{
            headers: { "content-type": "application/json" },
            json:item.request
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
    debugger;
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