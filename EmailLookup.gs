const CLIENT_ID = ScriptProperties.getProperty("client_id");
const CLIENT_SECRET = ScriptProperties.getProperty("client_secret_token"); //This is confidential. Do not share this with anyone


const API_URL = 'https://apigw.it.umich.edu/um/MCommunity/People/minisearch/';



const TOKEN_URL = 'https://apigw.it.umich.edu/um/inst/oauth2/token?grant_type=client_credentials&scope=mcommunity';

const TOKEN_HEADERS = {
    "Authorization": "Basic " + Utilities.base64Encode(CLIENT_ID + ":" + CLIENT_SECRET)
}

const OPTIONS = {
    'method': 'post',
    'headers': TOKEN_HEADERS
};

function emailLookup(name) {


    var token = getToken();

    const EMAIL_HEADERS = {
        "contentType": "application/json",
        "headers": {
            'Authorization': "Bearer " + token,
            'X-IBM-Client-Id': CLIENT_ID,
            'accept': "application/json"
        }
    };



    //console.log(UrlFetchApp.fetch(TOKEN_URL, OPTIONS).getContentText());
    console.log(API_URL + name);
    var response = JSON.parse(UrlFetchApp.fetch(API_URL + name, EMAIL_HEADERS).getContentText());

    console.log(response);

    var emails = [];

    var cont = false;

    for (person of response['person']) {
        if (person["affiliation"] == undefined) {

        } else if (typeof person["affiliation"] == "object") {
            for (affiliation of person["affiliation"]) {
                if (affiliation.includes("Alumni") || affiliation.includes("Staff")) {
                    cont = true;
                }
            }
            if (cont == true) {
                cont = false;
                continue;
            }
        } else {
            if (person["affiliation"].includes("Staff") || person["affiliation"].includes("Alumni")) {
                continue;
            }
        }


        emails.push(person['uniqname'] + "@umich.edu");
    }

    var output = "";

    for (email of emails) {
        if (output != "") {
            output = output + ";" + email;
        } else {
            output = email;
        }
    }
    console.log(output);
    return output;

}


function getToken() {

    const scriptProperties = PropertiesService.getScriptProperties();




    var token = scriptProperties.getProperty("token");
    var token_time = new Date(scriptProperties.getProperty("time"));

    const time = (token_time - new Date()) / 1000;


    if (token == null || time == null || time < 100) {
        console.log("getting token: ");
        var request = JSON.parse(UrlFetchApp.fetch(TOKEN_URL, OPTIONS).getContentText());
        console.log(request);
        token_time = new Date();
        token_time.setSeconds(token_time.getSeconds() + request['expires_in']);
        token = request["access_token"];

        scriptProperties.setProperty("token", token);
        scriptProperties.setProperty("token_time", token_time);
    }

    return token;

}
