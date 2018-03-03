// Declare some global variables
const mapDiv = document.getElementById("map");
const neighborhoods = ["wellawatta", "Dehiwela", "Mount Lavinia"];
const locations = [
	{
		name: "Nolimit - Women",
		position: {lat: 6.872549, lng: 79.861619},
		neighborhood: "wellawatta",
		venue_id: "4cd652b789eb6dcb4ef62e1e",
		image: "img/image-1.jpg"
	},
	{
		name: "Nolimit Image",
		position: {lat: 6.876872, lng: 79.860297},
		neighborhood: "wellawatta",
		venue_id: "4e69ede0e4cdb3755155236c",
		image: "img/image-2.jpg"
	},
	{
		name: "Hameedia Designers & Tailors",
		position: {lat: 6.878502, lng: 79.859911},
		neighborhood: "wellawatta",
		venue_id: "4c868000d34ca14332705080",
		image: "img/image-3.jpg" 
	},
	{
		name: "Nolimit - Men",
		position: {lat: 6.851505, lng: 79.866280},
		neighborhood: "Dehiwela",
		venue_id: "4c0d3a705272d13a31e5de5b",
		image: "img/image-4.jpg"
	},
	{
		name: "Glitz",
		position: {lat: 6.845391, lng: 79.866378},
		neighborhood: "Mount Lavinia",
		venue_id: "4f379a9be4b017ad7b359196",
		image: "img/image-5.jpg" 
	},
	{
		name: "Kandy Selection",
		position: {lat: 6.854448, lng: 79.865409},
		neighborhood: "Dehiwela",
		venue_id: "50b05ff2e4b014937a93f5dd",
		image: "img/image-6.jpg"
	},
	{
		name: "Fashion Bug",
		position: {lat: 6.878138, lng: 79.860077},
		neighborhood: "wellawatta",
		venue_id: "51962c2f498ea8ef6512a4d1",
		image: "img/image-7.jpg"
	}
];
let map, infoWindows = [];

// To control the animated sidebar
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

// Function to execute if Google Maps API failed for some reason
function failed() {
	alert("An error has occurred when accesing the Google Maps API. Please reload the page.");
}

// Model class
class Location {
	constructor(loc) {
		this.name = loc.name;
		this.position = loc.position;
		this.neighborhood = loc.neighborhood;
		this.image = loc.image;
		this.website = ""; 
		this.tel = "";
		this.stars = "";

		// Time to use FourSquare API
		let URL = "https://api.foursquare.com/v2/venues/" + loc.venue_id + "?&client_id=JEKATVRYQP34TF0PENV5053IRYMZFIVJ2ZYLOWRDKUI1JPH4&client_secret=OV0MBRYD3KMOWDVBWU1ODYBA0QQXSYRGDMINY55UN4NVDBQS&v=20180122";

		fetch(URL).then(response => {
			if (response.ok) {
				return response.json();
			}
			else {
				return Promise.reject("something went wrong!");
			}
		}).then(data => {
			this.website = data.response.venue.url || "";
			this.tel = data.response.venue.contact.formattedPhone || "No phone provided &#x2639";
			this.stars = data.response.venue.rating || "No ratings provided &#x2639";
		}).catch(error => alert("An error has occured when accessing the Foursquare API. Please reload the page."));

		this.marker = new google.maps.Marker({
			position: this.position,
			map: map,
			animation: google.maps.Animation.DROP,
			title: this.name
		});

		this.marker.addListener("click", () => {
			map.panTo(this.position);

			// The bounce animation timed for exactly 3 bounces
			this.marker.setAnimation(google.maps.Animation.BOUNCE);
				setTimeout(() => { this.marker.setAnimation(null);}, 2100);

			// The infowindow
			this.infoWindow = new google.maps.InfoWindow({
				content: `<h3>${this.name}</h3>
				<img src="${this.image}" width="300px" alt="image" class="img">
				<p class="tel"> Tel: ${this.tel} </p>
				<p class="stars">&#x2b50 ${this.stars}/10</p>
				<p class="link"><a href="${this.website}">Website</a>`
			});
			infoWindows.forEach(iw => iw.close());
			this.infoWindow.open(map, this.marker);
			infoWindows.push(this.infoWindow);
		});
	}

	selected() {
		google.maps.event.trigger(this.marker, 'click');
	}
}

// View-Model class
class ViewModel {
	constructor() {
		this.selectedNeighborhood = ko.observable("Colombo");
		this.nehdArray = ko.observableArray(["Colombo"]);
		this.locationArray = ko.observableArray([]);

		// Initialize map
		map = new google.maps.Map(mapDiv, {
			center: {lat: 6.878138, lng: 79.860077},
			zoom: 14,
			mapTypeControlOptions: {
	        	position: google.maps.ControlPosition.TOP_CENTER
	    	}
		});

		// Initialize the model
		locations.forEach(loc => {
			let location = new Location(loc);
			this.locationArray.push(location);
		});

		neighborhoods.forEach(nehd => this.nehdArray.push(nehd));

		// Filter locations
		this.filteredArray = ko.computed(() => {
			let filter = this.selectedNeighborhood();
			if (filter == "Colombo") {
				return this.locationArray();
			}
			else {
				return ko.utils.arrayFilter(this.locationArray(), loc => {
					let str = loc.neighborhood;
					if (str == filter) {
						return true;
					}
					else {
						return false;
					}
				});
			}
		});

		// place markers
		this.ko_compute = ko.computed(() => {
			this.locationArray().forEach(loc => loc.marker.setVisible(false));
			this.filteredArray().forEach(loc => loc.marker.setVisible(true));
		});
	}
}

// Callback function to initialize the view-model
function nowItBegins() {
	ko.applyBindings(new ViewModel());	
}
