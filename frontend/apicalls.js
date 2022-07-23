const opendoc = async () =>{
    
    let bx_majdesc = document.getElementById("BX-MAJDESC");
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
const apply_facet = async ( facet_term ) =>{
    alert(facet_term);
    search_desc(facet_term);
};

const dbsearchfacet = async ( facet_term ) =>{
    let bx_majdesc = document.getElementById("BX-MAJDESC");
    let bx_loc = document.getElementById("lk-location");

    let output = document.getElementById("facet1")
    output.innerHTML = "";

    try
    {
        let result = await fetch("http://localhost:3000/fetchfacet?loc="+bx_loc.value+"&BX-MAJDESC="+bx_majdesc.value)
            .then(response => response.json());
        console.log(result);
        //alert(result);
        result.forEach(chat => {
            let facetlink = document.createElement("dl");
            const myArray = chat._id.split("-");
            facetlink.innerHTML = `<dt onclick="apply_facet(${myArray[0]})">${myArray[0]}(${chat.count})</dt>` 
            //facetlink.innerHTML += `</br>`
            output.appendChild(facetlink);
        });
    }catch(e){
        console.error(e);
    }

};

const dbsearch_doc = async ( val ) =>{
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

const search_BCK_OLD_CODE = async ( valx ) =>{
    //global Variables;
    let loc_term = document.getElementById("lk-location");
    let cs_term = document.getElementById("lk-customer");

    let term = "";
    let facet_flg = false;
    let path_var = "";

    if( valx.localeCompare("facet_n_search") == 0)
    {
        term = document.getElementById("BX-MAJDESC")
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
            //alert(chat);
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

const search_desc = async ( valx ) =>{
    
    //alert("search_desc");
    let loc_term = document.getElementById("lk-location");
    let cs_term = document.getElementById("lk-customer");
    let bx_plusid = document.getElementById("BX-PLUSID");
    let bx_majdesc = document.getElementById("BX-MAJDESC");
    let rn_reccode = document.getElementById("RN-RECCODE");
    let barcode = document.getElementById("barcode");

    //buildstring
    params  =  "location="+loc_term.value;
    params += "&CS-ID="+cs_term.value;
    params += "&bx_plusid="+bx_plusid.value;
    params += "&bx_majdesc="+bx_majdesc.value;
    params += "&rn_reccode="+rn_reccode.value;
    params += "&barcode="+barcode.value;
    params += "&year="+valx;
    console.log(params);

    let cust_id = document.getElementById("lk-customer");
    let desc_term = document.getElementById("BX-MAJDESC");
    let path_var = "BX-MAJDESC";

    let output = document.getElementById("tbody_rows");
    output.innerHTML = "";

    try{
        dbsearchfacet(desc_term.value,);
    }catch(e){
        console.error(e);
    }


    try
    {
        //let result = await fetch("http://localhost:3000/search_cpd?cust_id="+cust_id.value+"&desc_term="+desc_term.value+"&path_var="+path_var)
        let result = await fetch("http://localhost:3000/search_cpd?"+params)
            .then(response => response.json());
        
        
        result.forEach(chat => {
            
            
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
                console.log("=====>"+originals);
                console.log("=====>"+replacements);  
                
                chat['BX-MAJDESC'] = chat['BX-MAJDESC'].replace(originals, replacements);

                let tab_row = document.createElement("tr");
                tab_row.innerHTML += `<td id='${chat._id}' onclick=pop_doc('${chat._id}')><a>${chat['CS-ID']}</a></td>`
                tab_row.innerHTML += `<td> ${chat['LC-ID']}</td>`
                tab_row.innerHTML += `<td> ${chat['BX-PLUSID']}</td>`
                tab_row.innerHTML += `<td> ${chat['RN-RECCODE']}</td>`
                tab_row.innerHTML += `<td> ${chat['BX-MAJDESC']}</td>`
                tab_row.innerHTML += `<td> ${chat['BX-MINDESC']}</td>`
                tab_row.innerHTML += `<td> ${chat['BX-DESTDATE']}</td>`
                tab_row.innerHTML += `<td><button type="button" onclick="fetch_loc('${chat['LC-ID']}')" id="myBtn">Get Location</button></td>`
                
                output.appendChild(tab_row);
            });
            
            
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
    let path_var = "";

    if( valx.localeCompare("facet_n_search") == 0)
    {
        term = document.getElementById("BX-MAJDESC")
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
            //alert(chat);
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


const dbsearch = async ( val ) =>{
    let loc_term = document.getElementById("lk-location");
    let cs_term = document.getElementById("lk-customer");
    let bx_plusid = document.getElementById("BX-PLUSID");
    let rn_reccode = document.getElementById("RN-RECCODE");
    let barcode = document.getElementById("barcode");
    //buildstring
    params  =  "location="+loc_term.value;
    params += "&CS-ID="+cs_term.value;
    params += "&bx_plusid="+bx_plusid.value;
    params += "&rn_reccode="+rn_reccode.value;
    params += "&barcode="+barcode.value;
    console.log(params);
    //alert(params);

    let output = document.getElementById("tbody_rows");
    output.innerHTML = "";

    try
    {
        let result = await fetch("http://localhost:3000/dbsearch?"+ params )
            .then(response => response.json());
        console.log(result);

        result.forEach(chat => {
            let tab_row = document.createElement("tr");
            tab_row.innerHTML += `<td id='${chat._id}' onclick=pop_doc('${chat._id}','${chat['location']}','${chat['CS-ID']}')><a>${chat['CS-ID']}</a></td>`
            tab_row.innerHTML += `<td> ${chat['LC-ID']}</td>`
            tab_row.innerHTML += `<td> ${chat['BX-PLUSID']}</td>`
            tab_row.innerHTML += `<td> ${chat['RN-RECCODE']}</td>`
            tab_row.innerHTML += `<td> ${chat['BX-MAJDESC']}</td>`
            tab_row.innerHTML += `<td> ${chat['BX-MINDESC']}</td>`
            tab_row.innerHTML += `<td> ${chat['BX-DESTDATE']}</td>`
            tab_row.innerHTML += `<td><button type="button" onclick="fetch_loc('${chat['LC-ID']}')" id="myBtn">Get Location</button></td>`
            output.appendChild(tab_row);
        });

    }catch(e){
        console.error(e);
    }

};

