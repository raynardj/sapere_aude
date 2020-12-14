import { load_config } from "./load_config.js";
const utf8_dec = new TextDecoder("utf8");
class Recorder{
    constructor(){
    }
    start = (...callbacks) =>{
        /*
        Start recording
        */
        var recorder = this;
        this.audio_chunks=[];
        var audio_chunks = this.audio_chunks;
        window.is_recording=true
        window.recorder_now = this
        navigator.mediaDevices.getUserMedia({audio:true})
        .then(
            (stream)=>{
                recorder.mediaRecorder = new MediaRecorder(stream,
                    {audioBitsPerSecond:16000})
                recorder.mediaRecorder.start();

                recorder.mediaRecorder.addEventListener("dataavailable" , event=>{
                    audio_chunks.push(event.data);
                })

                recorder.mediaRecorder.addEventListener("stop", ()=>{
                    const audioBlob = new Blob(audio_chunks, {mimeType:"audio/webm"});
                    recorder.audioBlob = audioBlob;
                })
            }
        )
        this.run_callbacks(callbacks)
    }
    stop = (...callbacks) =>{
        this.mediaRecorder.stop()
        window.is_recording=false
        
        this.run_callbacks(callbacks)
    }
    play = (...callbacks) =>{
        const audio_url = URL.createObjectURL(this.audioBlob); 
        const audio = new Audio(audio_url);
        audio.play()
        this.run_callbacks(callbacks)
    }
    run_callbacks = (callbacks) =>{
        for(var i in callbacks){
            var cb =callbacks[i];
            cb(this)
        }
    }
}

const to_b64 = (blob, callback)=>{
    var reader = new FileReader();
    reader.readAsDataURL(blob)
    reader.onloadend = function() {
        var base64data = reader.result
        $("#download-btn").attr("href",base64data)
        callback(base64data);
    }
}

const inputing_text_result = data=>{
    if(data.result){
        var text = data.result[0]
        $("#text-work-station").text(
            $("#text-work-station").text()+String(text)
        )
    }
}

const dictate = (recorder) =>{
    load_config(async(config)=>{
        to_b64(recorder.audioBlob,b64data=>{
            var byteslen = recorder.audioBlob.size;
            var format="webm";
            var rate=16000;
            var data = {
                b64data,byteslen,format, rate
            }

            fetch(
                config.ravenclaw.endPoint+"/nlp/dictate_en",
                {
                    method:"POST",
                    headers: {
                                'Content-Type': 'application/json',
                            },
                    body:JSON.stringify(data)
                }
            ).then(
                res=>res.json()
            ).then(inputing_text_result)
            .catch(console.error)
        })
    })
}

const record_btn = ()=>{
    if(window.is_recording){
        var recorder = window.recorder_now;
        recorder.stop(dictate)
    }else{
            var recorder = new Recorder();
            recorder.start()
    }
}

$(document).ready(
    function(){
        $("#record-btn").click(record_btn)
    }
)
