const ce = (dom_name) => document.createElement(dom_name)

var clean_modal=(dom_id)=>{
    /*
    clean up the residual modal
    in purpose of starting a new one
    */
    if($(`#${dom_id}`).length){
        $(`#${dom_id}_close`).click()
        $(`#${dom_id}`).remove()
        $(".modal-backdrop").each(function(){
            $(this).remove()
        })
    }
}

var create_modal=(data)=>{
    /*
    Templating a modal component
    */
    var {title, dom_id, body} = data
    
    clean_modal(dom_id)
    var modal = ce("div");
    Object.assign(
        modal,
        {id:dom_id, className:"modal fade", tabindex:"-1", role:"dialog"}
        );

    var modal_str =  `
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">${title}</h5>
          <button type="button" id="${dom_id}_close" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body" id="#ht_selection_modal_body">
          ${body}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>`
    $(modal).html(modal_str)
    $("body").append(modal)
    $(modal).modal("show")
    return modal
}


class Tabs{
    constructor(...tabs){
        this.ul = ce("ul")
        this.ul.className="nav nav-tabs"
        this.ul.role="tablist"
        this.contents = ce("div")
        Object.assign(
            this.contents,
            {className:"tab-content", id:"selected_text_tab-content"})
        for(var i in tabs){
            var {target_id, label, is_active, content} = tabs[i]
            this.new_tab(target_id, label, is_active,content)
        }
    }

    new_tab(target_id, label, is_active, content){
        // create nav-item dom
        var li = ce("li");
        li.className="nav-item";
        var a = ce("a");
        a.className="nav-link"
        var aria_selected=false
        if(is_active){a.className+=" active"; aria_selected=true}
        $(a).html(label);
        $(a).attr(
            {"aria-controls":target_id,
            role:"tab",
            id:`${target_id}-tab`,
            "data-toggle":"tab",
            "aria-selected":`${aria_selected}`})
        a.href=`#${target_id}`;
        $(li).html(a);
        $(this.ul).append(li);
        // create content dom
        var content_dom = ce("div");
        $(content_dom).attr(
            {
                id:target_id,
                role:"tabpanel",
                "aria-labelledby":`${target_id}-tab`
            })
        if(is_active){
            content_dom.className="tab-pane fade show active"
        }else{
            content_dom.className="tab-pane fade"
        }

        if(content){
            $(content_dom).html(content);
        }

        $(this.contents).append(content_dom)
    }
    everything(){
        var wrap = ce("div")
        $(wrap).append(this.ul)
        $(wrap).append(this.contents)
        return wrap.innerHTML
    }
}

class APIAsync{
    constructor(target_id){
        this.target_id=target_id
        $(`#${target_id}`).html(this.empty_page())
    }
    assign_load(endPoint, get_data_callback, data_callback){
        var target_id=this.target_id
        $(this.load_btn).click(async function(){
            await fetch(endPoint,
                {
                    method:"POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body:JSON.stringify(get_data_callback())
                })
            .then(res=>res.json())
            .then(data=>{
                $(`#${target_id}_content`).html(data_callback(data))
            })
            .catch(err=>{
                console.log(err)
                $(`#${target_id}_content`).html(err)
            })
        })
    }
    empty_page(){
        var sub=ce("div")
        var controls = ce("div")
        controls.className="row pl-3 pr-3 pt-3 pb-3"
        sub.append(controls)

        var btn_group = ce("div")
        btn_group.className="btn-group"
        controls.append(btn_group)

        var load_btn = ce("button")
        load_btn.className="btn btn-primary"
        btn_group.append(load_btn)

        var content_div = ce("div")
        content_div.id=`${this.target_id}_content`
        sub.append(content_div)
        this.load_btn = load_btn
        this.load_btn.innerText="Load"
        return sub
    }
}