
//$('#lk-location').on('ready', function (event) {
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

/*
$('#showtable').change(function() {
    // this will contain a reference to the checkbox   
    if (this.checked) {
        alert("checked show tables");
        $("#output").empty();
        // the checkbox is now checked 
        $('#table_out').DataTable();
    } else {
        // the checkbox is now no longer checked
        $('#table_out').hide();
    }
});
*/

$( document ).ready(function() {    

    //$('#table_out').hide();
    //$('#table_out').DataTable();
    let geo_location = getUrlParameter("location");
    if (typeof(geo_location) == "undefined"){
        geo_location = "US";
    }
 
   
    $("#lk-customer").empty();
    //var optionSelected = $("option:selected", this);
    //var valueSelected = this.value;
    var us_customers = ['CNASC','1ANKB','F1051','QONHA',  'NNDSA','2S10K','3111G','1RFTK','5PM1J','HALPW' ];
    var de_customers =  ['5CH6F','5B15G' ,'5W01G','4BM0B','7QG5F','1QE4F','2YA1F','KPUPB','9C06I','0D80I'];
    
    try
    {
        //let result = await fetch("http://localhost:3000/fetch_cust_byloc?loc=US")
        //    .then(response => response.json());
        //console.log(result);
        if(geo_location == "US"){
            us_customers.forEach(chat => {
                $("#lk-customer").append('<option>'+chat+'</option>');
            });
        }else{
            de_customers.forEach(chat => {
                $("#lk-customer").append('<option>'+chat+'</option>');
            });
        }
        $('#lk-location').val(geo_location);
       

        //run Database Search and Facet 1st time
        dbsearch();
        //till I figure out empty facet queries
        //dbsearchfacet();

    }catch(e){
        console.error(e);
    }
    
});
            