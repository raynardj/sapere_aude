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
            var gene_component = new GeneComponent();
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
    callback = async(dom, data) => {
        var {gene,parent} = data;
        load_config((config)=>{

            var json_options = {
                method:"POST",
                headers: {
                        "x-api-key":config.aws_lambda.api_key,
                        'Content-Type': 'application/json',
                    }
            }
            var input_data = {gene, "detail-type":"get_gene_functions"}
            fetch(
                config.aws_lambda.endPoint, {
                    ...json_options,
                    body: JSON.stringify(input_data)
                })
                .then(res=>res.json())
                .then((gfs) => {
                    if(gfs.length>0)
                    {
                        var gene_function_component = new GeneFunctionComponent();
                        $(dom).append(gene_function_component.render(gfs))
                    }
                    $(parent).append(dom)
                })
                .catch((e) => {
                        console.log(e.stack)
                    })
        })
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

export {Component, GeneListComponent, GeneComponent, CollapseComponent, ModalComponent}