const opendoc = async () =>{
    
    let bx_majdesc = document.getElementById("fterm");
    let output = document.getElementById("doc_text")
    output.innerHTML = "";

    try
    {
        let result = await fetch("http://localhost:3000/get?doc_id=628d2f04238357006cb2334a")
            .then(response => response.json());
        console.log(result);
        result.forEach(chat => {
            let messageContainer = document.createElement("p");
            messageContainer.innerHTML = `${chat.value}`
            output.appendChild(messageContainer);
        });
    }catch(e){
        console.error(e);
    }

};

const dbsearchfacet = async ( facet_term ) =>{
    let bx_majdesc = "";
    let bx_loc = "US";

    if (facet_term){
        bx_majdesc = facet_term
    }else{
        bx_majdesc = document.getElementById("fterm");
        bx_loc = document.getElementById("lk-location");
    }
    let output = document.getElementById("facet1")
    output.innerHTML = "";

    try
    {
        let result = await fetch("http://localhost:3000/fetchfacet?loc="+bx_loc.value+"&BX-MAJDESC="+bx_majdesc.value)
            .then(response => response.json());
        console.log(result);
        result.forEach(chat => {
            let messageContainer = document.createElement("a");
            messageContainer.innerHTML = `${chat._id}(${chat.count})` 
            messageContainer.innerHTML += `</br>`
            output.appendChild(messageContainer);
        });
    }catch(e){
        console.error(e);
    }

};

const dbsearch = async ( val ) =>{
    let loc_term = document.getElementById("lk-location");
    let cs_term = document.getElementById("lk-customer");
    let bx_plusid = document.getElementById("BX-PLUSID");
    let rn_reccode = document.getElementById("RN-RECCODE");
    let barcode = document.getElementById("barcode");
    
    //alert(loc_term.value + cs_term.value + bx_term.value);
    $("#output").empty();
    //buildstring
    params  =  "location="+loc_term.value;
    params += "&CS-ID="+cs_term.value;
    params += "&bx_plusid="+bx_plusid.value;
    params += "&rn_reccode="+rn_reccode.value;
    params += "&barcode="+barcode.value;
    console.log(params);
    try
    {

        let result = await fetch("http://localhost:3000/dbsearch?BX-PLUSID="+ bx_plusid.value+"&location="+loc_term.value+"&CS-ID="+cs_term.value )
            .then(response => response.json());
        console.log(result);
                //89827347
        result.forEach(chat => {
            let messageContainer = document.createElement("div");
            let lc_id_val = `${chat['LC-ID']}`;
            //messageContainer.setAttribute("id", "opendoc_handel");
            messageContainer.innerHTML = `<ol>`
            //messageContainer.innerHTML +=`<li> Document ID: <a onclick="document.getElementById('id01').style.display='block'"'>${chat._id}</a></li>`
            messageContainer.innerHTML += `<li> Document ID: ${chat._id} </li>`
            messageContainer.innerHTML += `<li> Customer ID: ${chat['CS-ID']}</li>`
            messageContainer.innerHTML += `<li> Location ID: ${chat['LC-ID']}</li>`
            messageContainer.innerHTML += `<li> Box Plus ID: ${chat['BX-PLUSID']}</li>`
            messageContainer.innerHTML += `<li> Box RN-RECCODE: ${chat['RN-RECCODE']}</li>`
            messageContainer.innerHTML += `<li> Bx Major Description: ${chat['BX-MAJDESC']}</li>`
            messageContainer.innerHTML += `<li> Bx Min Description: ${chat['BX-MINDESC']}</li>`
            messageContainer.innerHTML += `<li> BX DESTRUCTION DATE: ${chat['BX-DESTDATE']}</li>`
            messageContainer.innerHTML += `</ol>`
            //messageContainer.innerHTML += `<button type="button" onclick="fetchlocation()" class="btn btn-default btn-lg" id="opendoc_handel">Get Location</button>`
            messageContainer.innerHTML += `<button type="button" onclick="fetch_loc('${chat['LC-ID']}')" id="myBtn">Get Location</button>`
            messageContainer.innerHTML += `<hr>`
            
            output.appendChild(messageContainer);
        });
    }catch(e){
        console.error(e);
    }

};

const search = async ( valx ) =>{
    //global Variables;
    let loc_term = document.getElementById("lk-location");
    let cs_term = document.getElementById("lk-customer");

    let term = "";
    let facet_flg = false;
    //let marker = "";
    let path_var = "";

    if( valx.localeCompare("facet_n_search") == 0)
    {
        term = document.getElementById("fterm")
        dbsearchfacet(term);
        facet_flg = true;
        path_var = "BX-MAJDESC";

    }else if( valx.localeCompare("search") == 0) {
        path_var = "CS-ID";
    }else{
        alert("check input");
    }

    let output = document.getElementById("output")
    output.innerHTML = "";

    try{

        let result = await fetch("http://localhost:3000/search?term="+cs_term.value+"&path_var="+path_var)
            .then(response => response.json());

        console.log("atlas search seults .." + result);
    
        result.forEach(chat => {
            let messageContainer = document.createElement("div");
            messageContainer.innerHTML = `<ol>`
            messageContainer.innerHTML +=`<li> Document ID:${chat._id}</li>`
            messageContainer.innerHTML += `<li> Customer ID: ${chat['CS-ID']}</li>`
            messageContainer.innerHTML += `<li> Location ID: ${chat['LC-ID']}</li>`
            messageContainer.innerHTML += `<li> Major Desc ID: ${chat['BX-MAJDESC']}</li>`
            messageContainer.innerHTML += `</ol>`
        
            console.log("Messsage part 1 search seults ..");


            //chat.forEach(msg => {
                let message = document.createElement("p");
                
                chat.highlights.forEach(highlights =>{
                    let texts = highlights.texts;
                    let replacements = texts.map(text =>{
                        if (text.type == "hit"){
                            return `<mark>${text.value}</mark>`
                        } else {
                            return text.value;
                        }
                    }).join("");
                    let originals = texts.map(text =>{
                        return text.value;
                    }).join("");
                    
                    console.log(chat)
                    console.log(originals);
                    console.log(replacements);
                    if (path_var.localeCompare("CS-ID") == 0){
                        chat['CS-ID'] = chat['CS-ID'].replace(originals, replacements);
                    }else if (path_var.localeCompare("BX-MAJDESC") == 0){
                        chat['BX-MAJDESC'] = chat['BX-MAJDESC'].replace(originals, replacements);
                    }
                    
                    //chat["$marker"] = chat['CS-ID'].replace(originals, replacements);

                });
                if (path_var.localeCompare("CS-ID") == 0){
                    message.innerHTML = chat['BX-PLUSID'] + ": == "+ chat['CS-ID'];
                }else if (path_var.localeCompare("BX-MAJDESC") == 0){
                    message.innerHTML = chat['BX-PLUSID'] + ": == "+ chat['BX-MAJDESC'];
                }
                
                message.innerHTML = message.innerHTML + "<hr>";
                messageContainer.appendChild(message);
            output.appendChild(messageContainer);
        });
    }catch(e){
        console.error(e);
    }
}; 
