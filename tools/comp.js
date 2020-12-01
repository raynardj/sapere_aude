import {load_config} from "./load_config.js";
import {pretty_json, ce,  dom_to_text} from "./easy_bs.js"

const dom_parser = new DOMParser()

class Component{
    constructor(properties={}){
        Object.assign(this, properties)
    }

    render=(data)=>{
        this.data=data;
        this.dom = this.html(data)
        this.callback(this.dom, data)
        return this.dom
    }
    callback = (dom, data) => {
        // default no event assigned to dom
    }
    run_callbacks = (dom, data) =>{
        for(var i in this.callbacks){
            var cb = this.callbacks[i];
            cb(dom, data);
        }
    }
}

class CollapseComponent extends Component{
    constructor(properties={}){ super(properties)}
    html = (d) => {
        var {dom_id, body, button_text} = d
        var collapse = ce(
            "div",
            {className:"container"},{},
            ce("p",{},{},
                ce("a",{className:"btn btn-primary"},
                    {"data-toggle":"collapse",
                    href:`#${dom_id}`,
                    role:"button",
                    "aria-expanded":false,
                    "aria-controls":dom_id}, button_text)
                ),
            ce("div",{className:"collapse",id:dom_id},{},
                ce("div",{id:`${dom_id}_body`,className:"card card-body"}))
            )
        return collapse
    }
    callback = (
        dom, data
    ) => {
        $(dom).find(`#${data.dom_id}_body`).html(data.body)
    }
}

class ModalComponent extends Component{
    constructor(property={}){
        super(property);
    }
    
    html = (data) => {
        var {title, dom_id, body} = data;
        this.modal_title = ce("h5",{className:"modal-title"},{},title)
        this.modal_header = ce(
            "div",{className:"modal-header"},{},
            this.modal_title,
            ce(
                "button",{id:`${dom_id}_close`,className:"close"},
                {type:"button","data-dismiss":"modal","aria-label":"Close"},
                ce("span",{},{"aria-hidden":true},"x"))
        )
        this.modal_body = ce("div",{className:"modal-body",id:"ht_selection_modal_body"},{},body)
        this.modal_footer = ce("div",{className:"modal-footer"},{},
            ce("button",{className:"btn btn-primary"},{type:"button", "data-dismiss":"modal"},"Close")
            )
        this.content = ce(
            "div",
            {className:"modal-content"},{},
            this.modal_header, this.modal_body, this.modal_footer
        )
        this.document = ce(
            "div",
            {className:"modal-dialog modal-lg",role:"document"},
            {role:"document"},
            this.content
        )
        this.frame = ce("div",{
            id:data.dom_id,
            className:"modal fade",
            },
            {tabindex:"-1",role:"dialog"},
            this.document);
        
        return this.frame
    }
}

class GeneListComponent extends Component{
    constructor(properties={}){
        super(properties)
    }
    html = (d) => {
        if(d.genes.length==0){
            return ce("div",{className:"gene_list_component"},{},"No GENE found")
        } else{
            return ce("div",{className:"gene_list_component"})
        }
    }
    callback = (dom, d) => {
        for(var i in d.genes){
            var gene = d.genes[i];
            var gene_component = new GeneComponent({callbacks:this.callbacks});
            gene_component.render({gene, parent:dom})
        }
    }
}

class GeneComponent extends Component{
    constructor(properties={}){
        super(properties)
    }
    html = (d) => {
        var {gene} = d

        return ce(
            "div",
            {className:'gene_item_frame',id:`gene_item_${gene}`},
            {},
            ce("h5",{},{},gene)
            )
        }
    callback = (dom, data) => {
        this.run_callbacks(dom, data)
    }
}

class GeneFunctionComponent extends Component{
    constructor(properties={}){
        super(properties)
    }
    html = (d) =>{
        var data = d[0];
        return ce("div",{id:`${data.gene}-gene-function`})
    }
    callback=(dom, d)=>{
        var data = d[0];
        var jlist = pretty_json(data);
        var jcollapse = new CollapseComponent({skip_parser:true});
        
        $(dom).append(jcollapse.render({
            button_text:`Gene Function ${data.gene}`,
            body: jlist,
            dom_id:`gene_function_${data.gene}_collapse`
        }))
    }
}

class DiseaseListComponent extends Component{
    constructor(properties={}){
        super(properties)
    }
    html = (d)=>{
        if(d.diseases.length==0){
            return ce("div",{className:"disease_list_component"},{},"No Disease Found")
        } else{
            return ce("div",{className:"disease_list_component"})
        }
    }
    callback = (dom, d) => {
        for(var i in d.diseases){
            var disease = d.diseases[i];
            var disease_component = new DiseaseComponent({callbacks:this.callbacks});
            disease_component.render({disease, parent:dom})
        }
    }
}

class DiseaseComponent extends Component{
    constructor(properties={}){
        super(properties)
    }
    html = (d) => {
        var {disease} = d

        return ce(
            "div",
            {className:'disease_item_frame',id:`disease_item_${disease}`},
            {},
            ce("h5",{},{},disease)
            )
        }
    callback = (dom, data) => {
        this.run_callbacks(dom, data)
    }
}

class CollapsePrettyJSONComponent extends Component{
    constructor(properties={}){
        super(properties)
        if(!this.dom_id){console.error("Has to be a dom_id for CollapsePrettyJSONComponent")}
        if(!this.title){console.error("Has to be a title for CollapsePrettyJSONComponent")}
    }
    html = (d) =>{
        return ce("div",{id:`${this.dom_id}-collapse-pretty-json`})
    }
    callback=(dom, d)=>{
        var data = d[0];
        var jlist = pretty_json(data);
        var jcollapse = new CollapseComponent();
        
        $(dom).append(jcollapse.render({
            button_text: this.title ,
            body: jlist,
            dom_id:`${this.dom_id}-collapse-component`
        }))
    }
}

export {Component, 
    GeneListComponent, GeneFunctionComponent, GeneComponent, 
    CollapseComponent, CollapsePrettyJSONComponent, ModalComponent, 
    DiseaseListComponent, DiseaseComponent}