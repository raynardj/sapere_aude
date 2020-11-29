console.log("select.js loaded");

var selected_text = ()=>{
    /* 
    return selected text, String
    */
   return document.getSelection().toString()
}

class ActivateSelection{
    /*
    Selection management 
    Use with callbacks
    
    */
    constructor(query_select,callbacks){
        this.dom = document.querySelector(query_select);
        this.callbacks = callbacks;
        this.start_now = false;
        document.onselectstart=this.record_start;
        document.onmouseup = this.select_change;
    }
    record_start=()=>{
        this.start_now = true;
    }
    select_change = () =>{
        if(this.start_now)
        {
            this.start_now = false
            var text = selected_text();
            if(text==""){
                return 
            }else{
                for(var i in this.callbacks){
                    this.callbacks[i](text)
                }
            }
        }
        else{
            return 
        }
    }
}