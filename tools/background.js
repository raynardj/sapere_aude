console.log("load sa");

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
            callback(config);
        }
    }
    )
}

var log_text=(doc)=>{
    var load_work_page = async (config) => {
	    var location = window.location.href;
	    var gc_user = config.gc_user;
	    var data = {doc, location, gc_user, "detail-type":"add_doc"};
	    await fetch(
		config.aws_lambda.endPoint,
		{
			method:"POST",
			headers: {
                "x-api-key": config.aws_lambda.api_key,
                'Content-Type': 'application/json'
            },
            body:JSON.stringify(data)
		}
		).then(res=>res.json()).then(
			(data)=>{
				console.info(data)
				var	page_id = data.res;
                // var target_url = `chrome-extension://${chrome.runtime.id}/work.html?hid=${page_id}`
                var target_url = chrome.runtime.getURL("work.html")+`?hid=${page_id}`
                // window.open(target_url)
                chrome.tabs.create({url:target_url})
			}).catch(e=>{alert(e.stack)})
    }
    return load_work_page
}

chrome.commands.onCommand.addListener(function(command) {
    console.log('Command:', command);
    chrome.tabs.executeScript(details={file:"tools/collect_tab_text.js"},
    (tab)=>{
        var text = tab[0];
        load_config(log_text(text))
    })
  });