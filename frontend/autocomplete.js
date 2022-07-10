$(document).ready(function () { 
    //alert("DJ- captured the event..");
    $("#term").autocomplete({
        source: async function(request, response) {
            console.log("Dhananjay- INN the event..");
            let data = await fetch(`http://localhost:3000/searchac?term=${request.term}`)
                .then(results => results.json())
                .then(results => results.map(result => { 
                    console.log("Thanan..");
                    console.log(result);
                    return { label: result['CS-ID'], value: result['CS-ID'], id: result._id };
                }));
            //console.log("**** autocomplete console-log-client"+data)
            response(data);
        },
        minLength: 2
    });

});