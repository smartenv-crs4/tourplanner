import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Platform, ModalController, NavController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { PoiDetailsPage } from './poi-details';

declare var google;

@Component({
  selector: 'map-component',
  templateUrl: 'map.html',
})
export class MapComponent {
  @ViewChild('map') mapElement: ElementRef;


  //@Input() points: Array<any>;

 // private startPosition: any;
  private map: any;
  private items: any;
  private directionsService: any;
  private directionsDisplay: any;
  private routeResponse: any;
  private pathway = false;


  constructor(public nav: NavController, public platform: Platform, public zone: NgZone, public modalCtrl: ModalController) {
    console.log("Map constructor")
    this.nav = nav;

  }

  ngAfterViewInit() {
    this.loadMap();
  }


  loadMap(item?) {
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: false});

    let mapOptions = {
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    };

    if (item !== undefined) {
      mapOptions['center'] = new google.maps.LatLng(item.lat, item.lng);
      mapOptions['zoom'] = 12
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.directionsDisplay.setMap(this.map);

    if (item !== undefined) {
      let marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: new google.maps.LatLng(item.lat, item.lng),
      });

      this.addInfoWindow(item, marker, item.title);
    }
  }

  loadPois(pois, kindoflist) {

  if (kindoflist== "pathway"){
    this.pathway= true;
    }

    this.items = pois;
    this.getPointsBounds((bounds) => {
      this.loadMap();
      this.map.fitBounds(bounds);
      console.log("items count " + this.items.length);

      if(kindoflist == "pois"){


        for (let i = 0; i < this.items.length; i++) {
          if (this.items[i].lat && this.items[i].lng) {
            //console.log(this.items[i].title + ": " + this.items[i].lat + " - " + this.items[i].lng)

            let marker = new google.maps.Marker({
              map: this.map,
              animation: google.maps.Animation.DROP,
              position: new google.maps.LatLng(this.items[i].lat, this.items[i].lng),
            });

            this.addInfoWindow(this.items[i], marker, this.items[i].title);

          }
        }
      }

    })
  }

  setMapHeight(height){
    this.mapElement.nativeElement.style.height = height;
  }

  getPointsBounds(_cb) {
    var bound = new google.maps.LatLngBounds();

    for (let i = 0; i < this.items.length; i++)
      if (this.items[i].lat && this.items[i].lng)
        bound.extend(new google.maps.LatLng(this.items[i].lat, this.items[i].lng));

    console.log("center of the map: " + bound.getCenter().toString());
    // let zoom = this.getMapZoom(bound);
    _cb(bound);
  }

  getMapZoom(bound) {
    let pixelWidth = 328; // a constant in Google's map projection
    let GLOBE_WIDTH = 256; // a constant in Google's map projection
    let west = bound.northeast;
    let east = bound.southwest;

    console.log(west + " - " + east);

    let angle = east - west;
    if (angle < 0) {
      angle += 360;
    }

    console.log(Math.LN2);

    let zoom = Math.round(Math.log(pixelWidth * 360 / angle / GLOBE_WIDTH) / Math.LN2);
    console.log(zoom);
    return zoom;
  }

  addInfoWindow(item, marker, content) {

    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
      //this.itemTapped("click", item)
    });
  }


   itemTapped(event, item) {
     let modal = this.modalCtrl.create(PoiDetailsPage, { item });
     modal.present();
   }



  calculateAndDisplayRoute(origin, destination ,waypts){
    console.log("FUNCTION calculateAndDisplayRoute ");
    //let stepDisplay = new google.maps.InfoWindow;

    // Start/Finish icons
    let icons = {
      start: new google.maps.MarkerImage(
          // URL
          'img/start.png',
          // (width,height)
          new google.maps.Size( 44, 32 ),
          // The origin point (x,y)
          new google.maps.Point( 0, 0 ),
          // The anchor point (x,y)
          new google.maps.Point( 22, 32 )
      ),
      end: new google.maps.MarkerImage(
          // URL
          'img/end.png',
          // (width,height)
          new google.maps.Size( 44, 32 ),
          // The origin point (x,y)
          new google.maps.Point( 0, 0 ),
          // The anchor point (x,y)
          new google.maps.Point( 22, 32 )
      )
    };
    /**
     * waypoints[]specifies an array of DirectionsWaypoints.
     * Waypoints alter a route by routing it through the specified location(s).
     * A waypoint is specified as an object literal with fields shown below:
     * - location specifies the location of the waypoint, as a LatLng, as a google.maps.Place object or as a String which will be geocoded.
     * - stopover is a boolean which indicates that the waypoint is a stop on the route, which has the effect of splitting the route into two routes.
     * */
    let waypoints = [];
    let waypoints_titles = [];
    for (let i=1; i<waypts.length-1;i++){
      if(waypts[i].lat && waypts[i].lng){
        waypoints.push({ location : new google.maps.LatLng(waypts[i].lat, waypts[i].lng), stopover: true});
      }
    }

    //tutti i title
    for (let i in waypts){
      if(waypts[i].lat && waypts[i].lng){
        waypoints_titles.push(waypts[i].title);
      }
    }
//non va
   /* for (let i in waypoints) {
      waypoints[i].setMap(null);
      console.log(JSON.stringify(waypoints[i]));
    }

    let origin_address = "";
    let dest_address = "";

    let geocoder = new google.maps.Geocoder;*/
    let latlng_origin = { location : new google.maps.LatLng(origin.lat, origin.lng)};
    let latlng_destination = { location : new google.maps.LatLng(destination.lat, destination.lng)};

    console.log("origin: " + JSON.stringify(latlng_origin));
    console.log("destination: " + JSON.stringify(latlng_destination));

    this.routeResponse = null;
    //console.log('this.routeResponse: ' + lthis.routeResponse);
    if (typeof google !== "undefined") {
      //console.log("typeof google: " + typeof google);
      /**
       * The DirectionsRequest object literal contains the following fields:
       {
       origin: LatLng | String | google.maps.Place,
       destination: LatLng | String | google.maps.Place,
       travelMode: TravelMode, //DRIVING (Default), BICYCLING, TRANSIT (public transport), WALKING
       transitOptions: TransitOptions, //(optional) specifies values that apply only to requests where travelMode is TRANSIT
       drivingOptions: DrivingOptions, //(optional) specifies values that apply only to requests where travelMode is DRIVING
       unitSystem: UnitSystem,
       waypoints[]: DirectionsWaypoint,
       optimizeWaypoints: Boolean, //By default, the Directions service calculates a route through the provided waypoints in their given order. Optionally, you may pass optimizeWaypoints: true within the DirectionsRequest to allow the Directions service to optimize the provided route by rearranging the waypoints in a more efficient order.
       provideRouteAlternatives: Boolean,
       avoidHighways: Boolean,
       avoidTolls: Boolean,
       region: String
       }
       **/
      let routeRequest = {
        origin: latlng_origin,
        destination: latlng_destination,
        waypoints: waypoints,
        optimizeWaypoints: false,
        provideRouteAlternatives: false,
        travelMode: 'WALKING'
      };
      //console.log("routeRequest: " + JSON.stringify(routeRequest));
      this.directionsService.route(routeRequest, (response, status) => {
        //console.log('status directionservice.route: ' + status);

        if (status === 'OK') {
          this.directionsDisplay.setDirections(response);
          let leg = response.routes[0].legs[0];
          console.log(waypoints_titles[0]);
          //this.makeMarker( leg.start_location, icons.start, waypoints_titles[0] );
          //this.makeMarker( leg.end_location, icons.end, waypoints_titles[waypoints_titles.length-1] );
        } else {
          window.alert('Directions request failed due to ' + status);
        }
        /*if (status == google.maps.DirectionsStatus.OK) {
          console.log('directionservice.route STATUS OK');
          this.directionsDisplay.setDirections(response);
          //this.showSteps(response, waypoints, stepDisplay, this.map);
          // Save the response so we access it from controller
          this.routeResponse = response;
          //console.log(status);
          //console.log("////////////////////////")
        }*/

      });
      //console.log("route response: " + this.routeResponse);
    }
  }

  makeMarker( position, icon, title ) {
    new google.maps.Marker({
      position: position,
      map: this.map,
      icon: icon,
      title: title
    });
  }


  /*showSteps(directionResult, markerArray, stepDisplay, map) {
    // For each step, place a marker, and add the text to the marker's infowindow.
    // Also attach the marker to an array so we can keep track of it and remove it
    // when calculating new routes.
    var myRoute = directionResult.routes[0].legs[0];
    console.log(myRoute.steps[0].instructions);
    for (let i in myRoute.steps.length) {
      let marker = markerArray[i] = markerArray[i] || new google.maps.Marker;
      marker.setMap(map);
      marker.setPosition(myRoute.steps[i].start_location);
      console.log(myRoute.steps[i].instructions);
      this.attachInstructionText(
          stepDisplay, marker, myRoute.steps[i].instructions, map);
    }
  }

  attachInstructionText(stepDisplay, marker, text, map) {

    google.maps.event.addListener(marker, 'click', function() {
      // Open an info window when the marker is clicked on, containing the text
      // of the step.
      stepDisplay.setContent(text);
      stepDisplay.open(map, marker);
    });
  }*/
}