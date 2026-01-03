import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import useToast from "../hooks/useToast";

// Fix for default markers in react-leaflet
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapPage = () => {
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({ name: "", latitude: "", longitude: "" });
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  // Fetch user's locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setMapLoading(true);
        const res = await api.get("/locations");

        // console.log("API Response:", res.data); // Debug log

        // FIX: Check if res.data is an array or has a locations property
        let locationsData = [];

        if (Array.isArray(res.data)) {
          locationsData = res.data;
        } else if (
          res.data &&
          res.data.locations &&
          Array.isArray(res.data.locations)
        ) {
          locationsData = res.data.locations;
        } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
          locationsData = res.data.data;
        } else if (
          res.data &&
          res.data.success &&
          Array.isArray(res.data.locations)
        ) {
          locationsData = res.data.locations;
        }

        // Ensure coordinates are numbers
        locationsData = locationsData.map((loc) => ({
          ...loc,
          latitude: parseFloat(loc.latitude) || 0,
          longitude: parseFloat(loc.longitude) || 0,
        }));

        setLocations(locationsData);

        if (locationsData.length === 0) {
          // showInfo("No location added from you.");
          // console.log("No locations found for user");
        }
      } catch (err) {
        // console.error("Error fetching locations:", err);
        showError("Failed to load locations. Please refresh the page.");
        setLocations([]); // Set to empty array on error
      } finally {
        setMapLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const handleAddLocation = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.name.trim() || !form.latitude || !form.longitude) {
      showError("Please fill in all fields");
      return;
    }

    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      showError("Please enter valid coordinates");
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      showError(
        "Invalid coordinates. Latitude must be between -90 and 90, Longitude between -180 and 180",
      );
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/locations", {
        name: form.name.trim(),
        latitude: lat,
        longitude: lng,
      });

      // console.log("Add location response:", res.data); // Debug log

      // FIX: Check response structure
      let newLocation = null;

      if (res.data.location) {
        newLocation = res.data.location;
      } else if (res.data) {
        newLocation = res.data;
      }

      // Ensure coordinates are numbers
      if (newLocation) {
        newLocation = {
          ...newLocation,
          latitude: parseFloat(newLocation.latitude) || lat,
          longitude: parseFloat(newLocation.longitude) || lng,
        };

        setLocations((prev) => [...prev, newLocation]);
        showSuccess(`"${form.name}" added successfully!`);
      } else {
        throw new Error("Invalid response from server");
      }

      // Clear form
      setForm({ name: "", latitude: "", longitude: "" });
    } catch (err) {
      console.error("Add location error:", err);
      const errorMsg = err.response?.data?.message || "Failed to add location";
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // FIX: Ensure locations is always an array before mapping
  const safeLocations = Array.isArray(locations) ? locations : [];

  return (
    <div className="d-flex vh-100">
      <Sidebar />

      <div className="container-fluid p-4" style={{ flex: 1 }}>
        <div className="row">
          {/* Left Column - Form */}
          <div className="col-lg-4 mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="card-title mb-4">📍 Add New Location</h4>
                <form onSubmit={handleAddLocation}>
                  <div className="mb-3">
                    <label className="form-label">Location Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      placeholder="e.g., Suria KLCC"
                      value={form.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        name="latitude"
                        placeholder="3.157324"
                        value={form.latitude}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        name="longitude"
                        placeholder="101.712198"
                        value={form.longitude}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <button
                    className="btn btn-success w-100"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Adding...
                      </>
                    ) : (
                      "Add to Map"
                    )}
                  </button>
                </form>

                {/* Location Count */}
                <div className="mt-4 pt-3 border-top">
                  <p className="text-muted mb-1">
                    <i className="bi bi-pin-map me-2"></i>
                    <strong>{safeLocations.length}</strong> locations on your
                    map
                  </p>
                  {safeLocations.length === 0 && !mapLoading && (
                    <p className="text-info small">
                      Add your first location using the form above!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="col-lg-8">
            <div className="card shadow-sm h-100">
              <div className="card-body p-0 position-relative">
                {mapLoading ? (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="text-center">
                      <div className="spinner-border text-primary mb-3"></div>
                      <p>Loading map...</p>
                    </div>
                  </div>
                ) : (
                  <MapContainer
                    center={[3.15, 101.71]}
                    zoom={12}
                    style={{ height: "100%", minHeight: "500px" }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {safeLocations
                      .map((location) => {
                        // Convert to numbers and validate
                        const lat = parseFloat(location.latitude);
                        const lng = parseFloat(location.longitude);

                        // Skip invalid coordinates
                        if (isNaN(lat) || isNaN(lng)) {
                          console.warn(
                            "Invalid coordinates for location:",
                            location,
                          );
                          return null;
                        }

                        return (
                          <Marker
                            key={location.id || location.name + lat + lng}
                            position={[lat, lng]}
                          >
                            <Popup>
                              <div>
                                <strong>
                                  {location.name || "Unnamed Location"}
                                </strong>
                                <br />
                                <small className="text-muted">
                                  Lat: {lat.toFixed(6)}
                                  <br />
                                  Lng: {lng.toFixed(6)}
                                </small>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })
                      .filter(Boolean)}
                  </MapContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
