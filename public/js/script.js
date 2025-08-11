const socket = io("https://your-app-name.onrender.com");


if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { longitude, latitude } = position.coords;
            socket.emit("send-location", { longitude, latitude });
        },
        (error) => {
            console.log(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
} else {
    alert("Geolocation not supported");
}

const map = L.map('map').setView([20, 78], 5); // default view to India
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const markers={};
//testing code:
socket.on('receive-location', (data) => {
    const { id, latitude, longitude } = data;

    let displayLat = latitude;
    let displayLng = longitude;

    // For testing: shift other users by +0.001 so they don't overlap
    if (id !== socket.id) {
        displayLat += 0.0001;
        displayLng += 0.0001;
    }

    if (markers[id]) {
        markers[id].setLatLng([displayLat, displayLng]);
    } else {
        markers[id] = L.marker([displayLat, displayLng]).addTo(map);
    }

    if (id === socket.id) {
        map.setView([displayLat, displayLng], 16);
    }
});



//real code
// socket.on('receive-location', (data) => {
//     const { id, latitude, longitude } = data;
//     map.setView([latitude, longitude] );
//     if (markers[id]) {
//         markers[id].setLatLng([latitude, longitude]);
//     } else {
//         markers[id] = L.marker([latitude, longitude]).addTo(map);
//     }
//      if (id === myId) {
//         map.setView([latitude, longitude], 16);
//     }
// });

// Remove marker when user disconnects
socket.on('user-disconnected', (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});