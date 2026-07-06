import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { Place } from "../types";
import { amenityLabels, formatPrice } from "../utils/amenities";
import "../utils/leafletIcons";

const DEFAULT_CENTER: [number, number] = [55.7558, 37.6176];

export default function MapPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Place[]>("/places")
      .then(setPlaces)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col gap-3 p-3">
      <h1 className="text-lg font-semibold text-ink">Коворкинги рядом</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200">
        <MapContainer center={DEFAULT_CENTER} zoom={13} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {places.map((place) => (
            <Marker key={place.id} position={[place.lat, place.lng]}>
              <Popup minWidth={220}>
                <div className="space-y-1">
                  <p className="font-semibold">{place.name}</p>
                  <p className="text-xs text-slate-500">{place.address}</p>
                  {place.description && <p className="text-sm">{place.description}</p>}
                  <p className="text-sm font-medium">
                    {formatPrice(place.pricePerHour, place.pricePerDay)}
                  </p>
                  <div className="flex flex-wrap gap-1 text-xs">
                    {amenityLabels(place.amenities).map((label) => (
                      <span key={label} className="rounded-full bg-slate-100 px-2 py-0.5">
                        {label}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Link
                      to={`/places/${place.id}`}
                      className="rounded-lg bg-primary px-2 py-1 text-xs font-medium text-white"
                    >
                      Подробнее
                    </Link>
                    <Link
                      to={`/sessions/new?placeId=${place.id}`}
                      className="rounded-lg border border-primary px-2 py-1 text-xs font-medium text-primary"
                    >
                      Собрать встречу
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
