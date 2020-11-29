var selected_text = ()=>{return document.getSelection().toString()}

var get_body = () => {
    var selected = selected_text();
	if (selected!=""){return selected}
	var body = document.querySelectorAll('body');
    var result = "";
    
	for(var i in body){
        result+=body[i].innerText;result+="\n"}
        
    window.current_text=result
	return result
}

get_body();