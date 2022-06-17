let tripData = [];
let currentTrip = {};
let page = 1;
let perPage = 10;
let map = null;

let tableRows = _.template(`
    <% _.forEach(tripData,function(trip){ %>
        <tr data-id="<%- trip._id %>" class="<%- trip.usertype %>">
            <td> <%- trip.bikeid %> </td>
            <td> <%- trip["start station name"] %> </td>
            <td> <%- trip["end station name"] %> </td>
            <td> <%- (trip.tripduration / 60).toFixed(2) %> </td>
        </tr>
    <% }); %>
`)



function loadTripData(){
    fetch(`https://vast-basin-93738.herokuapp.com/api/trips?page=${page}&perPage=${perPage}`)
    .then((response)=>{
        return response.json();
    })
    .then((data)=>{
        tripData = data;
        const temp = tableRows({trips:data}); //invoke the template created using lodash
        $("#trips-table tbody").html(temp);
        //$("#trips-table tbody").html(tableRows({trips:data})); //better way
        $("#current-page").html(page);
    })
    .catch(function(err){
        console.error("Failed to fetch data");
    });
}

$(function(){
    loadTripData();

    $('tbody').on('click','tr',function(e){
        let id = $(this).attr("data-id");  
        currentTrip = _.find(tripData,{'_id':id}); // to find element from array whose id matches the selected item's id

        
        $('.modal-title').text(`Trip Details (Bike: ${currentTrip.bikeid})`);
    
        $('#map-details').html(`
            <div> <strong>Start Location: </strong>${currentTrip["start station name"]} </div>
            <div> <strong>End Location: </strong>${currentTrip["end station name"]} </div>
            <div> <strong>Duration: </strong>${(currentTrip.tripduration / 60).toFixed(2)} minutes </div>
        `);

        $('#trip-modal').modal({
            backdrop: 'static', // disable clicking on the backdrop to close
            keyboard: false // disable using the keyboard to close
        });
         
    })

    $('#previous-page').on('click',function(){
        if(page > 1){
            page--;
            loadTripData();
        }
    })

    $('#next-page').on('click',function(){
        page++;
        loadTripData();
    })

    $('#trip-modal').on('shown.bs.modal', function () {
        map = new L.Map('leaflet', {
            layers: [
                new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
            ]
        });
        let start = L.marker([currentTrip["start station location"].coordinates[1], 
                currentTrip["start station location"].coordinates[0]]) .bindTooltip(currentTrip["start station name"],
        {
            permanent: true,
            direction: 'right'
        }).addTo(map);
        let end = L.marker([currentTrip["end station location"].coordinates[1], 
                currentTrip["end station location"].coordinates[0]]) .bindTooltip(currentTrip["end station name"],
        {
            permanent: true,
            direction: 'right'
        }).addTo(map);
        var group = new L.featureGroup([start, end]);
        map.fitBounds(group.getBounds(), { padding: [60, 60] });
    });

    $('#trip-modal').on('hidden.bs.modal', function () {
        map.remove();
    });


    
});

