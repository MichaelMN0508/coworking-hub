import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Vite's default asset handling breaks Leaflet's default icon URLs, so we re-point them here.
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });
