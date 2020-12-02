var ce = (
    dom_name,
    properties = {},
    attributes = {},
    ...inners
) => {
    var element = document.createElement(dom_name)
    if(Object.keys(properties).length>0){
        Object.assign(element, properties)
    }
    if(Object.keys(attributes).length>0){
        $(element).attr(attributes)
    }
    if(inners.length>0){
        for(var i in inners){
            $(element).append(inners[i])
        }
    }
    return element
}

const dom_to_text = (...doms) => {
    var wrap = ce("div")
    for(var i in doms){
        $(wrap).append(doms[i])
    }
    return wrap.innerHTML
}

var pretty_json = (data) => {
    /*
    print json to pretty bs format
    */
    var outter = ce("div")
    var table = ce("table",{className:"table"})
    for(var k in data){
        var row = ce("tr")
        table.append(row)
        var v = data[k];
        var th = ce("th"); $(th).html(k);$(row).append(th)
        var td = ce("td"); $(td).html(v);$(row).append(td)
    }
    $(outter).html(table)
    return outter
}

var render_list=(l)=>{
    /*
    render a list to bootstrap list
    */
    var ul = ce("ul",{className:"list-group"});
    
    for(var i in l){
        var li = ce("li", {className:"list-group-item"});
        $(li).html(l[i]);
        $(ul).append(li);
    }
    return ul
}

const abbreviate_long_text = (long_text, len = 20) =>{
    long_text = String(long_text)
    if(long_text.length>20){return long_text.slice(0,20)+"..."}
    return long_text
}

export {pretty_json, render_list, ce, dom_to_text, abbreviate_long_text}