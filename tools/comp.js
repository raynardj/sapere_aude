import {load_config} from "./load_config.js";

const dom_parser = new DOMParser()

class Component{
    constructor(render_callback, event_assign){
        this.render_callback = render_callback;
        this.event_assign = event_assign;
    }

    render=(data)=>{
        this.data=data;
        this.dom = dom_parser.parseFromString(this.render_callback(data), "text/xml").firstChild;
        this.event_assign(this.dom, data)
        return this.dom
    }
}

var gene_component = new Component(
    (d) => {
        if(d.genes.length==0){
            return "No gene specified"
        }
        var gene_list = ""
        for(var i in d.genes){
            var gene = d.genes[i];
            gene_list += `<div class='list-group-item gene_item_frame'
            id="gene_item_${gene}"><strong>${gene}</strong></div>`
        }
        return `
        <ul class="list-group">${gene_list}</ul>
        `
    },
    (dom, data) => {
        var genes=data.genes;
        load_config((config)=>{

            var json_options = {
                method:"POST",
                headers: {
                        "x-api-key":config.aws_lambda.api_key,
                        'Content-Type': 'application/json',
                    }
            }
            for(var i in genes){
                var gene=genes[i];
                var input_data = {gene, "detail-type":"get_gene_functions"}
                fetch(
                    config.aws_lambda.endPoint, {
                        ...json_options,
                        body: JSON.stringify(input_data)
                    }
                )
                .then(res=>res.json())
                .then((gfs) => {
                    console.log(gfs)
                })
                .catch(
                    (e) => {
                        console.log(e.stack)
                    }
                )
            }
        })
    }
)

export {gene_component}