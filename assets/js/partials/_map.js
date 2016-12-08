var google;
var calculate;
var direction;
var waypoints = [];

function getCourseMap() {
    var viewpoint = getUrlParameter('viewpoint'),
        topic = getUrlParameter('topic'),
        topicids = [],
        spatials = [],
        troyes =  new google.maps.LatLng(48.2973725, 4.0721523),
        map,
        direction;

    function affichageParcours(dataTopic){
        dataTopic.rows.forEach(function(row){
          if(row.value.name){
                $('.title').text('Parcours' + ' "' + row.value.name + '"');
            }
        })
    }

    function affichageMenu(dataCorpus){
        
        //Trouver l'id des row permettant de retrouver les endroits
        dataCorpus.rows.forEach(function(row){
            if(row.value.topic && row.value.topic.id == topic){
                topicids.push(row.id);
            }
        });
        
        //Trouver les endroits, afficher le menu
        dataCorpus.rows.forEach(function(row){
            if(row.value.spatial && topicids.indexOf(row.id) != -1 && spatials.indexOf(row.value.spatial) == -1){
                spatials.push(row.value.spatial);
                 $('.table-view').append('<li class="table-view-cell"><a class="navigate-right" href="explore.html?topic=' + topic + '&viewpoint=' + viewpoint + '&spatial=' + row.value.spatial + '" data-transition="slide-in">' + row.value.spatial + '</a></li>');
            }
        })
    } 

    function createMap(center){
           var options = {
                zoom: 14,
                center: center,
                mapTypeId: google.maps.MapTypeId.TERRAIN,
                maxZoom: 20
            };
            map = new google.maps.Map(document.getElementById('map'), options);
            direction = new google.maps.DirectionsRenderer({map:map});     
    }

    function drawDirections(center,endroits){
        var waypoints = [],
            p = new Promise(function(resolve,reject){
                   endroits.map(function(endroit){
            var requestPlaces = {
                location: center,
                radius: 500,
                query: endroit
            },
                servicePlaces = new google.maps.places.PlacesService(map);    
            //Text search utilisant l'API Place de Google afin de trouver un endroit par rapport au nom de l'endroit
            servicePlaces.textSearch(requestPlaces, function(resultats,statusRq){
                if(statusRq === google.maps.places.PlacesServiceStatus.OK){
                    waypoints.push({location:resultats[0].formatted_address,stopover:true});
                    if(waypoints.length == endroits.length){
                        resolve(waypoints);
                    }
                }
            });

        });
            })

        p.then(function(wp){
            calculate(wp[0].location,wp[wp.length-1].location,wp);
        })    
     
    }

    function calculate(origin, destination, waypoints) {
        var request = {
            origin: origin,
            destination: destination,
            waypoints: waypoints,
            travelMode: google.maps.DirectionsTravelMode.WALKING // A pied
        };
        var directionsService = new google.maps.DirectionsService();
        directionsService.route(request, function (response, status) { // Envoie de la requête pour calculer le parcours
            if (status === google.maps.DirectionsStatus.OK) {
                direction.setDirections(response); // Trace l'itinéraire sur la carte
            }
        });
}


    Promise.all([
        requestFactory('http://argos2.hypertopic.org/corpus/Vitraux - Bénel',affichageMenu),
        requestFactory('http://argos2.hypertopic.org/topic/' + viewpoint + '/' + topic,affichageParcours)
        ]).then(function(){
            createMap(troyes);
            drawDirections(troyes,spatials);
        });
}





   