import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type MapItem = {
  id: string;
  name: string;
  type:
    | "DISASTER"
    | "CAMP"
    | "WAREHOUSE"
    | "HOSPITAL"
    | "NGO"
    | "DISTRIBUTION"
    | "VEHICLE"
    | "VOLUNTEER";
  lat: number;
  lng: number;
  description: string;
};

const items: MapItem[] = [
  {
    id: "D-001",
    name: "Assam Flood Zone",
    type: "DISASTER",
    lat: 27.4728,
    lng: 94.912,
    description: "Critical flood affected area.",
  },
  {
    id: "C-001",
    name: "Dibrugarh Relief Camp",
    type: "CAMP",
    lat: 27.4728,
    lng: 94.912,
    description: "Relief camp serving affected families.",
  },
  {
    id: "W-001",
    name: "Central Relief Warehouse",
    type: "WAREHOUSE",
    lat: 27.49,
    lng: 94.93,
    description: "Food, water and medical inventory.",
  },
  {
    id: "H-001",
    name: "Emergency Hospital",
    type: "HOSPITAL",
    lat: 27.485,
    lng: 94.9,
    description: "Emergency medical support.",
  },
  {
    id: "N-001",
    name: "Assam Relief NGO",
    type: "NGO",
    lat: 27.478,
    lng: 94.925,
    description: "Verified NGO operations center.",
  },
  {
    id: "P-001",
    name: "Distribution Point A",
    type: "DISTRIBUTION",
    lat: 27.46,
    lng: 94.91,
    description: "Relief distribution point.",
  },
  {
    id: "V-001",
    name: "Relief Truck RC-09",
    type: "VEHICLE",
    lat: 27.47,
    lng: 94.94,
    description: "Relief delivery vehicle.",
  },
  {
    id: "VOL-001",
    name: "Volunteer Team A",
    type: "VOLUNTEER",
    lat: 27.465,
    lng: 94.92,
    description: "Active volunteer team.",
  },
];

const iconEmoji: Record<MapItem["type"], string> = {
  DISASTER: "⚠️",
  CAMP: "🏕️",
  WAREHOUSE: "📦",
  HOSPITAL: "🏥",
  NGO: "🤝",
  DISTRIBUTION: "📍",
  VEHICLE: "🚚",
  VOLUNTEER: "🧑‍🤝‍🧑",
};

const createIcon = (type: MapItem["type"]) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        width:36px;
        height:36px;
        border-radius:50%;
        background:white;
        border:2px solid #1e293b;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:18px;
        box-shadow:0 3px 10px rgba(0,0,0,.2);
      ">
        ${iconEmoji[type]}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

export default function DisasterMap() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="border-b p-5">
        <h2 className="text-xl font-bold">ReliefChain Disaster Map</h2>

        <p className="mt-1 text-sm text-slate-500">
          Monitor disasters, camps, warehouses, hospitals, NGOs,
          distribution points, vehicles and volunteers.
        </p>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_240px]">
        <div className="h-[560px]">
          <MapContainer
            center={[27.475, 94.92]}
            zoom={12}
            scrollWheelZoom
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Circle
              center={[27.4728, 94.912]}
              radius={5500}
              pathOptions={{
                color: "#dc2626",
                fillColor: "#ef4444",
                fillOpacity: 0.12,
              }}
            />

            {items.map((item) => (
              <Marker
                key={item.id}
                position={[item.lat, item.lng]}
                icon={createIcon(item.type)}
              >
                <Popup>
                  <div className="min-w-[180px]">
                    <strong>{item.name}</strong>

                    <div className="mt-1 text-xs">
                      {item.type}
                    </div>

                    <p className="mt-2 text-xs">
                      {item.description}
                    </p>

                    <p className="mt-2 font-mono text-[10px]">
                      {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="border-l bg-slate-50 p-4">
          <h3 className="font-bold">Map Legend</h3>

          <div className="mt-4 space-y-3">
            {Object.entries(iconEmoji).map(([type, emoji]) => (
              <div
                key={type}
                className="flex items-center gap-3 text-sm"
              >
                <span className="text-lg">{emoji}</span>

                <span>
                  {type.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-xs font-semibold text-red-700">
              Active disaster zone
            </p>

            <p className="mt-1 text-xs text-red-600">
              Monitoring area requiring active relief operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}