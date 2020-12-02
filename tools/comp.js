import {pretty_json, ce,  dom_to_text, abbreviate_long_text} from "./easy_bs.js"

const dom_parser = new DOMParser();

const get_rand=()=> String(parseInt(Math.random()*20)) ;

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
/*
+++++++++++++++++++++++++++++++++++++++++
Bootstrap structure
+++++++++++++++++++++++++++++++++++++++++
*/ 
class CollapseComponent extends Component{
    constructor(properties={}){ 
        super(properties)
        if(!properties.btn_theme){
            this.btn_theme="primary"
        }
    }
    html = (d) => {
        var {dom_id, body, button_text} = d
        this.card_body = ce("div",{id:`${dom_id}_body`,className:"card card-body"});
        var collapse = ce(
            "div",
            {className:"container"},{},
            ce("p",{},{},
                ce("a",{className:`btn btn-${this.btn_theme}`},
                    {"data-toggle":"collapse",
                    href:`#${dom_id}`,
                    role:"button",
                    "aria-expanded":false,
                    "aria-controls":dom_id}, button_text)
                ),
            ce("div",{className:"collapse",id:dom_id},{},
            this.card_body)
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

class CollapsePrettyJSONComponent extends Component{
    constructor(properties={}){
        super(properties)
        if(!this.dom_id){console.error("Has to be a dom_id for CollapsePrettyJSONComponent")}
        if(!this.title){console.error("Has to be a title for CollapsePrettyJSONComponent")}
        if(!properties.btn_theme){this.btn_theme="primary"}
    }
    html = (d) =>{
        return ce("div",{id:`${this.dom_id}-collapse-pretty-json`})
    }
    callback=(dom, data)=>{
        var jlist = pretty_json(data);
        var jcollapse = new CollapseComponent({btn_theme:this.btn_theme});
        
        $(dom).append(jcollapse.render({
            button_text: this.title ,
            body: jlist,
            dom_id:`${this.dom_id}-collapse-component`
        }))
    }
}

/*
+++++++++++++++++++++++++++++++++++++++++
GENE
+++++++++++++++++++++++++++++++++++++++++
*/ 
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
/*
+++++++++++++++++++++++++++++++++++++++++
Disease
+++++++++++++++++++++++++++++++++++++++++
*/ 
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
/*
+++++++++++++++++++++++++++++++++++++++++
Drug
+++++++++++++++++++++++++++++++++++++++++
*/ 
class DrugListComponent extends Component{
    constructor(properties={}){
        super(properties)
    }
    html = (d) =>{
        if(d.drugs.length==0){
            return ce("div",{className:"drug_list_component"},{},"No drug found")
        } else{
            return ce("div",{className:"drug_list_component"})
        }
    }
    callback = (dom, d) =>{
        for(var i in d.drugs){
            var drug = d.drugs[i];
            var drug_component = new DrugComponent({callbacks:this.callbacks});
            drug_component.render({drug, parent:dom})
        }
    }
}

class DrugComponent extends Component{
    constructor(properties={}){
        super(properties)
    }
    html = (d) =>{
        var {drug} = d;
        
        return ce(
            "div",
            {className:'drug_item_frame', id:`drug_item_${drug}`},
            {},
            ce("h5", {}, {}, drug)
        )
    }
    callback = (dom, data) =>{
        this.run_callbacks(dom, data)
    }
}
/*
+++++++++++++++++++++++++++++++++++++++++
Clinical Trial
+++++++++++++++++++++++++++++++++++++++++
*/ 

class ClinicalTrialComponent extends Component{
    constructor(properties={}){
        super(properties)
        if(properties.button_text){this.button_text=properties.button_text}
        else{this.button_text="Clinical Trial"}
    }
    html=(data)=>{
        var outer_colla = new CollapseComponent();
        outer_colla.render({dom_id:`clinical_trial_${get_rand()}`, body:"", button_text:this.button_text})

        for(var i in data){
            var d=data[i];
            var main_title=d.title_cn!=""?d.title_cn:d.title_en;
            var is_dom = d.dm_or_in=="国内"?"🇨🇳":"🌎"
            var clinicalal_data =  new CollapsePrettyJSONComponent(
                {
                    btn_theme:"secondary",
                    title:`${
                        abbreviate_long_text(main_title,30)
                    },${abbreviate_long_text(d.drugs.join(),30)}(${is_dom}${d.code})`,
                    dom_id:`clinical_trial_${d.code}_${i}`
                });
            var {code,disease_text, drugs_text,drugs,  phases, dm_or_in, location, gender, age, startdate, url} = d;
            var original_link = ce(
                "a", {className:"btn btn-secondary"},
                {'href':url, target:"_blank"}, "Open Source Link"
                )
            $(outer_colla.card_body, phases, dm_or_in, url).append(
                clinicalal_data.render({
                    code, main_title,disease_text, drugs_text,drugs, phases, gender, age, 
                    dm_or_in, location, startdate, original_link
                })
            )
        }
        return outer_colla.dom
    }
}

class QAComponent extends Component{
    constructor(properties){
        super(properties)
        if(!properties.callbacks){
            console.error("has to load callbacks for this component")
        }
    }
    html=(data)=>{
        var {text} = data;
        this.question_input = ce(
            "input",{className:"form-control"}
        )
        this.btn = ce("button",{className:"btn btn-primary mt-5"},{}, "ask")
        this.answer = ce("div",{className:"card card-body pt-5"})
        var big_card = ce("div",{className:"container"},{},
            ce("div",{className:"card card-body pb-5"},{}, 
                ce("label",{className:"label"},{},"Context"),text),
            ce("label",{className:"label"},{},"Question:"),
            this.question_input, this.btn, ce("hr"),
            ce("label",{className:"label"},{},"Answer:"),
            this.answer
        )
        return big_card
    }
    callback=(dom, data)=>{
        var qa_comp = this;
        $(this.btn).click(function () {
            data["question"] = qa_comp.question_input.value
            data["answer_dom"] = qa_comp.answer
            qa_comp.run_callbacks(dom, data)
        })
    }
}
export {Component, 
    GeneListComponent, GeneFunctionComponent, GeneComponent, 
    CollapseComponent, CollapsePrettyJSONComponent, ModalComponent, 
    DiseaseListComponent, DiseaseComponent,
    ClinicalTrialComponent,
    DrugListComponent, DrugComponent,
    QAComponent
}