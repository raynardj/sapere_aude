import { GeneListComponent, GeneFunctionComponent, 
    DiseaseListComponent, CollapseComponent ,
    DrugComponent, DrugListComponent, QAComponent,
    CollapsePrettyJSONComponent, ClinicalTrialComponent
} from "./tools/comp.js";
import { load_config } from "./tools/load_config.js";
import { ActivateSelection } from "./tools/select.js";
import { APIAsync, create_modal, Tabs } from "./tools/hover_tip.js"
import { pretty_json, render_list } from "./tools/easy_bs.js"

var execute_code = (config) =>{
    var {ravenclaw, aws_lambda} = config
    var rv_url = ravenclaw.endPoint;
    var json_options = {
        method:"POST",
        headers: {
                "x-api-key":aws_lambda.api_key,
                'Content-Type': 'application/json',
            }
    }
    /*
    =============================
    GET DETAILED DATA
    =============================
    */
    const get_gene_function = async(dom, data)=>{
        var {gene,parent} = data;
        load_config((config)=>{

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

    const get_disease_detail = async(dom, data) =>{
        var { disease, parent } = data;
        var name_cn = disease
        load_config(async (config)=>{

        var input_data = {name_cn, "detail-type":"ckb_get_disease"}

        fetch(
            config.aws_lambda.endPoint, {
                ...json_options,
                body: JSON.stringify(input_data)
            })
            .then(res=>res.json())
            .then((details) => {
                if(details.length>0)
                {
                    var colla_pretty_component = new CollapsePrettyJSONComponent({
                        title:`${disease} Detail`,
                        dom_id:`desease-detail-${disease}`
                    });
                    $(dom).append(colla_pretty_component.render(details[0]))
                }
                $(parent).append(dom)
            })
            .catch((e) => {console.log(e.stack)})
        })
    }

    const get_trial_by = (field) =>{
        const get_trial_by_ = async(dom, data) =>{
            var { parent } = data;
            var field_val = data[field]
            load_config(async (config)=>{
                var input_data = { "detail-type":"get_clinic_trial"};
                input_data[field] = field_val
                fetch(
                    config.aws_lambda.endPoint, {
                        ...json_options,
                        body: JSON.stringify(input_data)
                    })
                    .then(res=>res.json())
                    .then((details) => {
                        if(details.length>0)
                        
                        var clinical_trial_component = new ClinicalTrialComponent({
                            button_text:`${field_val} Clinical Trial`
                        });
    
                        $(dom).append(clinical_trial_component.render(details))
                        $(parent).append(dom)
                    })
                    .catch((e) => {console.log(e.stack)})
            })
        }
        return get_trial_by_
    }
    
    const get_drug_detail = async(dom, data) =>{
        var { drug, parent } = data;
        var input_data = {
            "detail-type": "ckb_get_drug",
            "gnameEN":drug
          }
        load_config(async (config)=>{

        fetch(aws_lambda.endPoint,{
                ...json_options,
                body:JSON.stringify(input_data)
            })
            .then(res=>res.json())
            .then((details) => {
                if(details.length>0)
                {
                    var colla_pretty_component = new CollapsePrettyJSONComponent({
                        title:`${drug} Detail`,
                        dom_id:`desease-detail-${drug}`
                    });
                    $(dom).append(colla_pretty_component.render(details[0]))
                }
                $(parent).append(dom)
            })
            .catch((e) => {console.log(e.stack)})
        })
    }
    const get_qa_answer = async(dom, data) =>{
        var {text,question, answer_dom} = data;
        var context = text;
        var input_data = {context, question}
        load_config(
            async(config)=>{
                fetch(
                    rv_url+"/nlp/bioasq",
                    {
                        ...json_options,
                        body:JSON.stringify(input_data)
                    }
                )
                .then(res=>res.json())
                .then(
                    return_data=>{
                        var {answer, score} = return_data;
                        $(answer_dom).html(answer)
                    }
                )
                .catch(
                    e=>{
                        $(answer_dom).html(e.stack)
                    }
                )
            }
        )
    }
    var append_data_on_dom = (dom) =>{
        var wrapper = (data) => {
            console.log("loaded successful", data);
            $(dom).append(pretty_json(data[0]))
        }
        return wrapper
    }

    var render_item_list  = (data_list, get_specific, slug)=>{
        var doms = [];
        for(var i in data_list){
            var name = data_list[i];
            doms[i] = document.createElement("div")
            doms[i].id=`${name}_gc_${slug}_item`
            $(doms[i]).html(`<h4>${slug}:${name}</h4>`)
            get_specific(
                name,
                append_data_on_dom(doms[i]),
                (e)=>{$(doms[i]).append(e)})
        }
        return render_list(doms)
    }

    // how we manage the selected text in modal
    var activate_modal=(text) => {
        var tabs = new Tabs(
            {target_id:"selected_original_text",
            content:text,
            label:"Text", is_active:true},
            {target_id:"find_gene_in_text", 
            label:"🧬 Gene"},
            {target_id:"find_drug_in_text",
            label:"💊 Drug",},
            {target_id:"find_disease_in_text",
            label:"🤧 Disease",},
            {target_id:"find_mutations_in_text",
            label:"Mutation"},
            {target_id:"translate_en_to_cn",
            label:"🇨🇳 to_Zh"},
            {target_id:"qa_bio",
            label:"❓ Q&A"}
            )
        
        create_modal(
            {
                title:"Text Helper",
                dom_id:"selected_text_helper_modal",
                body:tabs.everything()
            })
        
        var get_text_f = ()=>{return {text}};
        /*
        ===============================
        GENE
        ===============================
        */
        var api_find_gene = new APIAsync("find_gene_in_text");

        var genelist_component=new GeneListComponent({callbacks:
            [get_gene_function,]
        });

        api_find_gene.assign_load(
            rv_url+"/nlp/find_gene",get_text_f,genelist_component.render,
        )
        /*
        ===============================
        MUTATION
        ===============================
        */
        var api_find_mutation = new APIAsync("find_mutations_in_text");
        api_find_mutation.assign_load(
            rv_url+"/nlp/find_mutations",get_text_f,
            function(data){
                return data.matched_mutations.length?render_list(data.matched_mutations):"No mutation found"}
            )
        /*
        ===============================
        DRUG
        ===============================
        */
        var druglist_component = new DrugListComponent({
            callbacks:[
                get_drug_detail,
                get_trial_by("drug")
            ]
        })
        var api_find_drug = new APIAsync("find_drug_in_text");
        api_find_drug.assign_load(
            rv_url+"/nlp/drug",get_text_f,druglist_component.render
            )
        /*
        ===============================
        DISEASE
        ===============================
        */
        var diseaselist_component = new DiseaseListComponent({
            callbacks:[
                get_disease_detail,
                get_trial_by("disease")
            ]
        })
        var api_find_disease = new APIAsync("find_disease_in_text");
        api_find_disease.assign_load(
            rv_url+"/nlp/find_disease",
            get_text_f,diseaselist_component.render
            )

        /*
        ===============================
        Question & Anwser
        ===============================
        */

        var qa_component = new QAComponent({
            callbacks:[
                get_qa_answer
            ]
        });

        $("#qa_bio").html(qa_component.render({text}))
        
        /*
        ===============================
        TRANSLATE
        ===============================
        */
        var api_translate = new APIAsync("translate_en_to_cn");
        api_translate.assign_load(
            rv_url+"/nlp/en_to_cn",
            get_text_f,
            (data)=>{
                return data.translation?data.translation:"Translation API failed"
            }
        )

    }

    var load_material = async() =>{
        // load target text material from record
        var hid = new URLSearchParams(window.location.search).get("hid")
        $("#text-work-station").html("Loading text material...")
        await fetch(
            aws_lambda.endPoint,
            {
                ...json_options,
                body:JSON.stringify({id:hid, "detail-type":"read_doc"})
            }
            )
            .then(res=>res.json())
            .then((data)=>{
                var {doc, gc_user, created_at, id} = data[0]
                $("#text-work-station").html(doc)
                $("#doc_created_at").html(created_at)
                $("#gc_user").html(gc_user)
            })
    }
    
    var loud = (text)=>{
        console.log(text)
    }
    
    if($("#gc_user").length>0){
        load_material()

        var activate_selection = new ActivateSelection(
            "#text-work-station",[loud,activate_modal])
    } else {
        $("#analyze").click(function(){
            var doc=$("#text-work-station").val();
            activate_modal(doc)
        })
    }
}
$(document).ready(function(){
    load_config(execute_code)
})

window.CollapseComponent = CollapseComponent