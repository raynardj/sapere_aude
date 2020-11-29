var byId = elementId => document.getElementById(elementId)
var idVal = elementId => byId(elementId).value
var save = (data) =>{
    console.log(data)
    chrome.storage.sync.set(data)
}

var load_to_inputs = (data) =>{
    console.log(data);
    for(var k in data){
        if(data[k]){
            byId(k).value = data[k]
        }
    }
}

document.addEventListener("DOMContentLoaded", function(){
    
    console.log("option page loaded")

    document.getElementById("save_btn")
        .addEventListener("click",()=>{
            var user_name = idVal("user_name");
            var ds_endpoint = idVal("ds_endpoint");
            var query_endpoint = idVal("query_endpoint");
            var api_key = idVal("api_key");
            var save_data = {user_name, ds_endpoint, query_endpoint, api_key};
            save(save_data);
        })

    chrome.storage.sync.get({
        user_name:false,
        ds_endpoint:"http://10.10.10.141:5000",
        query_endpoint:"https://qhwi6hvxvh.execute-api.cn-northwest-1.amazonaws.com.cn/prod"
    }, load_to_inputs)

    chrome.storage.sync.get({
        api_key:false
    },(item)=>{
        if(item.api_key){
            byId("api_key_show").innerText = `(${item.api_key.slice(0,3)}...${item.api_key.slice(-4,-1)})`
        }
    })
    
})