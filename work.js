import { gene_component } from "./tools/comp.js";
import { load_config } from "./tools/load_config.js";
import {ActivateSelection, selected_text} from "./tools/select.js";
import {APIAsync, create_modal, clean_modal, ce, Tabs} from "./tools/hover_tip.js"

var execute_code = (config) =>{
    var {ravenclaw, aws_lambda} = config

    var json_options = {
        method:"POST",
        headers: {
                "x-api-key":aws_lambda.api_key,
                'Content-Type': 'application/json',
            }
    }

    var render_list=(l)=>{

        var ul = ce("ul");
        ul.className="list-group";
        
        for(var i in l){
            var li = ce("li");
            li.className="list-group-item";
            $(li).html(l[i]);
            $(ul).append(li);
        }
        return ul
    }

    var pretty_json = (data) => {
        /*
        print json to pretty bs format
        */
        var table = ce("table")
        table.className="table"
        for(var k in data){
            var row = ce("tr")
            table.append(row)
            var v = data[k];
            var th = ce("th"); $(th).html(k);$(row).append(th)
            var td = ce("td"); $(td).html(String(v));$(row).append(td)
        }
        return table
    }

    var get_drug_detail= async (drug_name, success, fail)=>{
        var input_data = {
            "detail-type": "ckb_get_drug",
            "gnameEN":drug_name
          }
        await fetch(aws_lambda.endPoint,{
            ...json_options,
            body:JSON.stringify(input_data)
        })
        .then(res=>res.json()).then(success).catch(fail)
    }

    var get_disease_detail = async (disease_name, success, fail) =>{
        var input_data = {
            "detail-type": "ckb_get_disease",
            "name_cn":disease_name
        }

        await fetch(aws_lambda.endPoint,{
            ...json_options,
            body:JSON.stringify(input_data),
        })
        .then(res=>res.json()).then(success).catch(fail)
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
            {target_id:"translate_en_to_cn", label:"to_Zh"}
            )
    
        var modal = create_modal(
            {
                title:"Text Helper",
                dom_id:"selected_text_helper_modal",
                body:tabs.everything()
            })
        
        var get_text_f = ()=>{return {text}};
        var api_find_mutation = new APIAsync("find_mutations_in_text");

        var api_find_gene = new APIAsync("find_gene_in_text");
        api_find_gene.assign_load(
            ravenclaw.endPoint+"/nlp/find_gene",get_text_f,gene_component.render,
        )
        
        api_find_mutation.assign_load(
            ravenclaw.endPoint+"/nlp/find_mutations",
            get_text_f,
            function(data){
                return data.matched_mutations.length?render_list(data.matched_mutations):"No mutation found"}
            )

        var api_find_drug = new APIAsync("find_drug_in_text");
        api_find_drug.assign_load(
            ravenclaw.endPoint+"/nlp/drug",
            get_text_f,
            function(data){
                return data.drugs.length?render_item_list(
                    data.drugs, get_drug_detail, "drug"):"No drug found"}
            )

        var api_find_disease = new APIAsync("find_disease_in_text");
        api_find_disease.assign_load(
            ravenclaw.endPoint+"/nlp/find_disease",
            get_text_f,
            function(data){
                return data.diseases.length?render_item_list(
                    data.diseases, get_disease_detail, "disease"):"No disease found"}
            )
        

        var api_translate = new APIAsync("translate_en_to_cn");
        api_translate.assign_load(
            ravenclaw.endPoint+"/nlp/en_to_cn",
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