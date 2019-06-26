exports.priceReqBody=function(reqBody,resBody,hotelId){    
    var accoInfos=[];
    var accoInfo={};
    var hotelInfo = resBody.find(_ => _.roomStay[0].roomInfo.hotelInfo.hotelCode == hotelId);
    //var hotelInfo=resBody[0];
    accoInfo.accommodationSubType=hotelInfo.roomStay[0].accommodationSubType;
    accoInfo.countryCode=reqBody.countryCode;
    accoInfo.cityCode=reqBody.cityCode;
    accoInfo.checkIn=reqBody.checkIn;
    accoInfo.checkOut=reqBody.checkOut;
    accoInfo.paxNationality=reqBody.paxNationality;
    accoInfo.roomConfig=[];    
    reqBody.roomConfig.forEach((room,index) => { 
        var roomStay = hotelInfo.roomStay.find(_ => _.roomInfo.requestedRoomIndex == index + 1);       
        accoInfo.roomConfig.push({
            supplierRef: roomStay.supplierRef,
            adultCount: room.adultCount,
            childAges: room.childAges,
            roomInfo: roomStay.roomInfo
        });
    });  
    accoInfos.push(accoInfo); 
    return accoInfos;
}

exports.repriceReqBody=function(reqBody,resBody){    
    var accoInfos=[];
    var accoInfo={};    
    var hotelInfo=resBody[0];
    reqBody=reqBody.accommodationInfo[0]
    accoInfo.accommodationSubType=hotelInfo.roomStay[0].accommodationSubType;
    accoInfo.countryCode=reqBody.countryCode;
    accoInfo.cityCode=reqBody.cityCode;
    accoInfo.checkIn=reqBody.checkIn;
    accoInfo.checkOut=reqBody.checkOut;
    accoInfo.paxNationality=reqBody.paxNationality;
    accoInfo.roomConfig=[];    
    reqBody.roomConfig.forEach((room,index) => { 
        var roomStay = hotelInfo.roomStay.find(_ => _.roomInfo.requestedRoomIndex == index + 1);       
        accoInfo.roomConfig.push({
            supplierRef: roomStay.supplierRef,
            adultCount: room.adultCount,
            childAges: room.childAges,
            roomInfo: roomStay.roomInfo
        });
    });  
    accoInfos.push(accoInfo); 
    return accoInfos;
}

exports.prepareSearchreqBody=function(reqBody,resBody){
    var bookReqBody={};
    var result=this.repriceReqBody(reqBody,resBody);
    result[0].roomConfig.forEach(_=>{
        _.paxInfo=[];
        var paxInfo=JSON.parse("{\r\n                                \"documentDetails\": {\r\n                                    \"documentInfo\": [\r\n                                        {\r\n                                            \"expiryDate\": \"2020-12-12\",\r\n                                            \"nationality\": \"Indian\",\r\n                                            \"docNumber\": \"AEEE11113\",\r\n                                            \"docType\": \"PAN Card\",\r\n                                            \"issueCountry\": \"India\",\r\n                                            \"issueAuthority\": \"Govt. of India\",\r\n                                            \"effectiveDate\": \"2010-12-12\",\r\n                                            \"issueLocation\": \"Mumbai\"\r\n                                        }\r\n                                    ]\r\n                                },\r\n                                \"isLeadPax\": true,\r\n                                \"firstName\": \"PRITISH\",\r\n                                \"paxType\": \"ADT\",\r\n                                \"surname\": \"JOSHI\",\r\n                                \"dob\": \"1990-01-01\",\r\n                                \"middleName\": \"travelogixx\",\r\n                                \"addressDetails\": {\r\n                                    \"zip\": \"400063\",\r\n                                    \"country\": \"IN\",\r\n                                    \"city\": \"Mumbai\",\r\n                                    \"addrLine2\": \"addrLine2\",\r\n                                    \"addrLine1\": \"addrLine1\",\r\n                                    \"state\": \"Maharashtra\"\r\n                                },\r\n                                \"title\": \"Mr.\",\r\n                                \"contactDetails\": [\r\n                                    {\r\n                                        \"contactInfo\": {\r\n                                            \"countryCode\": \"+91\",\r\n                                            \"contactType\": \"WORK\",\r\n                                            \"mobileNo\": \"9800000000\",\r\n                                            \"email\": \"xyz@gmail.com\"\r\n                                        }\r\n                                    }\r\n                                ]\r\n                            }");
        for(var i=0;i<_.adultCount;i++)
        {            
            if(i){
                paxInfo.isLeadPax=false;
            }
            _.paxInfo.push(paxInfo);
        }

        if (_.childAges && _.childAges.length) {
            _.childAges.forEach(age => {
                paxInfo.isLeadPax = false;
                _.paxInfo.push(paxInfo);
            });
        }
        
    });
    bookReqBody.accommodationInfo=result;
    bookReqBody.paymentInfo=JSON.parse("[\r\n          {\r\n            \"totalAmount\": 3000.0,\r\n            \"amountPaid\": 0.0,\r\n            \"accountType\": \"Credit\",\r\n            \"paymentAmount\": 0.0,\r\n            \"noOfProducts\": 0\r\n          }\r\n        ]");
    return bookReqBody;

}

exports.afterBookResponse=function(response){
    console.log(JSON.stringify(response
        ));

};

exports.searchAfterResponse=function(res){
    console.log("Hotel codes");
    var str="";
    res.responseBody.accommodationInfo.forEach(_=>{
        str= `${_.roomStay[0].roomInfo.hotelInfo.hotelCode} | `;        
    });
    console.log(str);
}

exports.priceAfterResponse=function(res){
    console.log(JSON.stringify(res));   
}