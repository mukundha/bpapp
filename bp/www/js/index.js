/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
  var client = new Apigee.Client({
                orgName:'ashokbeen', // Your Apigee.com username for App Services
                appName:'testapp' // Your Apigee App Services app name
        });
var map, currentLocation = {  coords : { latitude: "37.426360" , longitude : "-122.140905" } }  ;

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //  app.receivedEvent('deviceready');
       $('#blabsmap').on('showpage',function () {
            console.log('showing page blabs map');
            mapInit();
        });

        var pushNotification = window.plugins.pushNotification;     
        pushNotification.register(successHandler, errorHandler,{"senderID":"1099067318981","ecb":"onNotificationGCM"});

        if (navigator.geolocation) {
            console.log('finding location');
            //navigator.geolocation.getCurrentPosition(success, error);
        } else {
            error('not supported');
        }
        success(currentLocation);
        
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

 function successHandler(result){
        console.log(JSON.stringify(result));
    }
    function errorHandler (err){
        console.log(err);
    }
    function onNotificationGCM (event){
        console.log(JSON.stringify(event));
        if ( event.event == 'registered'){
            var options = {notifier:'google',deviceToken:event.regid};
            client.registerDevice(options,function(err,res){
                console.log('device registration done');
                console.log(JSON.stringify(res));
                var path = '/users/ash/devices/' + res.entities[0].uuid;
                var option = { method:'POST', endpoint : path  };
                client.request(option, function (err, data ){
                    if ( err ){
                        console.log('user registration failed');
                    }else{
                        console.log(JSON.stringify(data));
                    }
                });
               // navigator.notification.alert("Device Registered");
            });
        }else if ( event.event == 'message'){
            navigator.notification.alert(event.payload.data);
        }
    }


function showPage (page){   
    $('div[divtype="page"]').hide();
    $('#' + page).show();
    $('#' + page).trigger ('showpage');
} 


function success(position){
 currentLocation = position;
 console.log(position);
  if (!map) {
    loadMapScript();
  }
}

function loadMapScript() {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.id = "googleMaps"
  script.src = "https://maps.googleapis.com/maps/api/js?sensor=false&callback=mapInit&key=AIzaSyBi4SD5bRCoxC_fJSNgjIFo_Y1NfPO4b0E";
  document.body.appendChild(script);
}


function error(err){
    console.log(err);
}

function mapInit(){

    var api = 'http://ashokbeen-test.apigee.net/v1/docs?lat=' + currentLocation.coords.latitude+ '&lng=' + currentLocation.coords.longitude ;

    $.ajax (
        {   
            url:api ,
            complete: function (xhr,status){
                if ( status == 'success'){
                    console.log(xhr.responseText);
                    var res = JSON.parse(xhr.responseText);
                    console.log('map init');
                    var position = currentLocation;
                    console.log(position);
                      var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                      var myOptions = {
                        zoom: 15,
                        center: latlng,
                        mapTypeControl: false,
                        navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                      };      
                      map = new google.maps.Map(document.getElementById("blabsmap"), myOptions);
                      var marker = new google.maps.Marker({
                          position: latlng, 
                          map: map, 
                          title:"You are here! (at least within a "+position.coords.accuracy+" meter radius)"
                        });  
                    var x = 0;
                      for(x=0;x<res.results.length;x++){
                        var doc = res.results[x];
                        var docPos = new google.maps.LatLng(doc.lat, doc.lng);
                        var docMarkers = new google.maps.Marker({
                          position: docPos, 
                          map: map, 
                          title:doc.name
                        });    
                        addlistener (docMarkers,doc);
                      }
                        
                }else{

                }
            }
        }
        ); 
    
}

function addlistener (marker,doc){
    google.maps.event.addListener(marker, 'click', function() {
        
        if ( doc.logo_url )
            $('#image-doctor').attr('src',doc.logo_url);
        if ( doc.name )
            $('#doctor-name').html(doc.name);
        if ( doc.tagline)
            $('#doc-tagline').html(doc.tagline);
        if ( doc.phone)
            $('#doc-phone').html(doc.phone);
        if ( doc.street && doc.city )
            $('#doc-address').html(doc.street + ' ' + doc.city);

        $('#detailsmodal').modal('show');
    });
}
