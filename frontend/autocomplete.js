$(document).ready(function () { 
    //alert("DJ- captured the event..");
    $("#term").autocomplete({
        source: async function(request, response) {
            console.log("Dhananjay- INN the event..");
            let data = await fetch(`http://localhost:3000/searchac?term=${request.term}`)
                .then(results => results.json())
                .then(results => results.map(result => { 
                    return { label: result['CS-ID'], value: result['CS-ID'], id: result._id };
                }));
            //console.log("**** autocomplete console-log-client"+data)
            response(data);
        },
        minLength: 2
    });

    $("#RN-RECCODE").autocomplete({
        
        source: async function(request, response) {
            console.log("tapping RN-RECCODE Event");
            let cs_id = document.getElementById("lk-customer").value
            let lkup_field = "RN-RECCODE";
            console.log(cs_id);
            let data = await fetch(`http://localhost:3000/searchac2?term=${request.term}&cs_id=${cs_id}&lkup_field=${lkup_field}`)
                .then(results => results.json())
                .then(results => results.map(result => { 
                    return { label: result['_id'], value: result['_id'] };
                }));
            console.log("**** autocomplete console-log-client"+data)
            //alert(data);
            response(data);
        },
        minLength: 2
    });

});