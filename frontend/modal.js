
const fetch_loc = async ( valxx ) =>{
    alert("infetch location async");
    alert(valxx);
    var lc_code = valxx.slice(0,2);
    //alert(lc_code);
    var modal2 = document.getElementById("myModal");
    var modal3 = document.getElementById("myModalcontent");
    $("#myModalcontent").empty();

    try
    {

        let rec= await fetch("http://localhost:3000/fetchlocation?loc_id="+lc_code)
            .then(response => response.json());
        console.log(rec);

        //result.forEach(rec => {
            let mesC = document.createElement("div");
            mesC.innerHTML = `<ol><H4>Physical Asset Storage Location</H4><ol>`
            mesC.innerHTML += `<li> Archive Facility: ${rec['AR-NAME']} </li>`
            mesC.innerHTML += `<li> Archive Location: ${rec['AR-CITY']} </li>`
            mesC.innerHTML += `</ol><H4>Asset Metadata Storage</H4><ol>`
            mesC.innerHTML += `<li> Asset Metadata Region: ${rec['COMPUTE-REGION']} </li>`
            mesC.innerHTML += `<li> Asset Metadate CSP: ${rec['CSP']} </li>`
            mesC.innerHTML += `</ol></ol>`
            //output.appendChild(mesC);
            modal3.appendChild(mesC);
        //});
    }catch(e){
        console.error(e);
    }
    modal2.style.display = "block";

};

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
//btn.onclick = function() {
//    modal.style.display = "block";
//}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
};


// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};
