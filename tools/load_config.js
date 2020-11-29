var load_config = (callback) =>{
    chrome.storage.sync.get(
        {
            user_name:false,
            ds_endpoint:false,
            query_endpoint:false,
            api_key:false
        },
    (item)=>{
        if((item.user_name==false) ||
        (item.ds_endpoint==false) ||
        (item.query_endpoint==false) ||
        (item.api_key==false)
            ){
            window.location = `chrome-extension://${chrome.runtime.id}/options.html`
        } else {
            var config = {
                gc_user: item.user_name,
                ravenclaw: {endPoint: item.ds_endpoint},
                aws_lambda: {endPoint: item.query_endpoint, api_key: item.api_key}
            };
            callback(config)
        }
    }
    )
}
