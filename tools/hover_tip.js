import {ce, dom_to_text} from "./easy_bs.js";
import {Component, ModalComponent} from "./comp.js"

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

var create_modal = (data)=>{
    clean_modal(data.dom_id);
    var modal_comp = new ModalComponent();

    modal_comp.render(data);
    var modal = modal_comp.dom;

    $("body").append(modal);
    $(modal).modal("show");
}

class Tabs{
    constructor(...tabs){
        this.ul = ce("ul", {className:"nav nav-tabs"})
        this.ul.role="tablist"
        this.contents = ce("div", {className:"tab-content", id:"selected_text_tab-content"})
        for(var i in tabs){
            var {target_id, label, is_active, content} = tabs[i]
            this.new_tab(target_id, label, is_active,content)
        }
    }

    new_tab(target_id, label, is_active, content){
        // create nav-item dom
        var li = ce("li", {className:"nav-item"});
        var a = ce("a", {className:"nav-link"}, );
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
        var content_dom = ce("div",{id:target_id}, {
            role:"tabpanel",
            "aria-labelledby":`${target_id}-tab`
        });

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
        return dom_to_text(this.ul, this.contents)
    }
}

class APIAsync{
    constructor(target_id){
        this.target_id=target_id
        $(`#${target_id}`).html(this.empty_page())
    }
    async assign_load(endPoint, get_data_callback, data_callback){
        var target_id=this.target_id
        var api = this;
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
                $(api.content_div).html(data_callback(data))
            })
            .catch(err=>{
                console.log(err)
                $(api.content_div).html(err)
            })
        })
    }
    empty_page(){
        var sub=ce("div")
        var controls = ce("div", {className:"pl-3 pr-3 pt-3 pb-3"})
        sub.append(controls)

        var btn_group = ce(
            "div",
            {className:"btn-group"})
        controls.append(btn_group)

        var load_btn = ce("button", {className:"btn btn-primary", innerText:"Load"})
        btn_group.append(load_btn)

        var content_div = ce("div", {id:`${this.target_id}_content`, className:"container"})
        this.content_div = content_div
        sub.append(content_div)
        this.load_btn = load_btn
        return sub
    }
}

export {APIAsync, create_modal, clean_modal, ce, Tabs}