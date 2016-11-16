window.$            = window.jQuery = require('jquery');
window.Backbone     = require('backbone');
var mapboxgl 		= require('mapbox-gl');
var geojsonvt 		= require('geojson-vt');
var fs 				= require("browserify-fs");
var vtpbf 			= require('vt-pbf')
var VectorTile 		= require('vector-tile').VectorTile
var Protobuf 		= require('pbf');

var AppView = Backbone.View.extend({

	render: function() {
		if(this.running){ return;}
		this.loadMap();
		this.loadCrimeStyle();
		this.loadParcelStyle();
		this.setCursorStyle();
		this.addLayerToggle();
		this.running = true;
	},

	loadMap: function() {
		mapboxgl.accessToken = 'pk.eyJ1Ijoib3dlbmxhbWIiLCJhIjoiY2lleWljcnF4MDBiOXQ0bHR0anRvamtucSJ9.t3YnHHqvQZ8Y0MTCNy0NNw';
		map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/dark-v9',
			center: [-104.9903, 39.7392],
			zoom: 11,
			hash: true
		});

	},

	loadCrimeStyle: function() {
		map.on('style.load', function() {
			map.addSource('crime', {
				"type": 'vector',
				"tiles": ["http://localhost:7777/v2/crime/{z}/{x}/{y}.vector.pbf"]
			});

			map.addLayer({
				"id": "crime",
				"type": "circle",
				"source": "crime",
				"source-layer": 'crime',
				"paint": {
					'circle-radius': {
						stops: [[8, 1],[12, 2],[14, 5],[18, 12]]
					},
					'circle-color': {
						property: 'OFFENSE_CA',
						type: 'categorical',
						stops: [
							['aggrivated-assault', '#FF0000'],
							['all-other-crimes', '#FAFAFA'],
							['auto-theft', '#FF5800'],
							['burglary', '#FF5800'],
							['drug-alcohol', '#FFFF00'],
							['larceny', '#FFFF00'],
							['other-crimes-against-persons', '#FFFF00'],
							['public-disorder', '#FFFF00'],
							['robbery', '#FF5800'],
							['theft-from-motor-vehicle', '#FF5800'],
							['traffic-accident', '#FFFF00'],
							['white-collar-crime', '#FAFAFA']
						]
					},
					"circle-opacity": 0.7
				}
			});
		});
		this.setCrimeListeners();
	},

	loadParcelStyle: function() {
		map.on('style.load', function() {
			map.addSource('parcel', {
				"type": 'vector',
				"tiles": ["http://localhost:7777/v2/parcels/{z}/{x}/{y}.vector.pbf"]
			});

			map.addLayer({
				"id": "Parcels",
				"type": "fill",
				"source": "parcel",
				"source-layer": 'Parcels',
				"paint": {
					'fill-outline-color': '#000',
					'fill-color': "#3887BE",
					'fill-opacity': 0.3
				}
			});
		});
		this.setParcelListeners();
	},

	setCrimeListeners: function() {
		map.on('click', function (e) {
			var features = map.queryRenderedFeatures(e.point, { layers: ['crime'] });

			if (!features.length) {
				return;
			}

			var feature = features[0];
			var popup = new mapboxgl.Popup()
				.setLngLat(map.unproject(e.point))
				.setHTML('<b>Crime:</b><br>'+ feature.properties.OFFENSE_TY)
				.addTo(map);
		});
	},

	setParcelListeners: function() {
		map.on('click', function (e) {
			var features = map.queryRenderedFeatures(e.point, { layers: ['Parcels'] });

			if (!features.length) {
				return;
			}

			var feature = features[0];
			var popup = new mapboxgl.Popup()
				.setLngLat(map.unproject(e.point))
				.setHTML('<b>Parcel Number:</b><br>'+ feature.properties.PARCEL_NO)
				.addTo(map);
		});
	},

	setCursorStyle: function() {
		map.on('mousemove', function (e) {
			var features = map.queryRenderedFeatures(e.point, { layers: [ 'crime', 'Parcels'] });
			map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
		});
	},

	addLayerToggle: function() {
		var toggleableLayerIds = [ 'crime', 'Parcels'];
		for (var i = 0; i < toggleableLayerIds.length; i++) {
		    var id = toggleableLayerIds[i];

		    var link = document.createElement('a');
		    link.href = '#';
		    link.className = 'active';
		    link.textContent = id;

		    link.onclick = function (e) {
		        var clickedLayer = this.textContent;
		        e.preventDefault();
		        e.stopPropagation();

		        var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

		        if (visibility === 'visible') {
		            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
		            this.className = '';
		        } else {
		            this.className = 'active';
		            map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
		        }
		    };

		    var layers = document.getElementById('menu');
		    layers.appendChild(link);
		}
	}

});
var appView = new AppView();
appView.render();
