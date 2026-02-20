"use client";

import { useMemo, useState } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl";

type Place = { name: string; lat: number; lon: number };

type Segment = {
  mode: "train" | "bus" | "walk";
  from: Place;
  to: Place;
  depart: string;
  arrive: string;
};

type Itinerary = {
  id: string;
  title: string;
  price: number;
  duration: string;
  transfers: number;
  modes: Array<"train" | "bus" | "walk">;
  segments: Segment[];
};

const demo: Itinerary[] = [
  {
    id: "1",
    title: "Fastest",
    price: 129,
    duration: "10h 45m",
    transfers: 1,
    modes: ["train", "train", "bus"],
    segments: [
      {
        mode: "train",
        from: { name: "Amsterdam Centraal", lat: 52.3791, lon: 4.9003 },
        to: { name: "Paris Gare du Nord", lat: 48.8809, lon: 2.3553 },
        depart: "07:10",
        arrive: "10:35",
      },
      {
        mode: "train",
        from: { name: "Paris Gare du Nord", lat: 48.8809, lon: 2.3553 },
        to: { name: "Barcelona Sants", lat: 41.379, lon: 2.14 },
        depart: "12:10",
        arrive: "18:55",
      },
      {
        mode: "bus",
        from: { name: "Barcelona Sants", lat: 41.379, lon: 2.14 },
        to: { name: "Peñíscola", lat: 40.3579, lon: 0.4069 },
        depart: "19:30",
        arrive: "22:55",
      },
    ],
  },
  {
    id: "2",
    title: "Cheapest",
    price: 79,
    duration: "14h 20m",
    transfers: 2,
    modes: ["train", "bus", "bus"],
    segments: [
      {
        mode: "train",
        from: { name: "Amsterdam Centraal", lat: 52.3791, lon: 4.9003 },
        to: { name: "Brussels Midi", lat: 50.8366, lon: 4.336 },
        depart: "06:50",
        arrive: "08:45",
      },
      {
        mode: "bus",
        from: { name: "Brussels Midi", lat: 50.8366, lon: 4.336 },
        to: { name: "Barcelona Nord", lat: 41.3917, lon: 2.181 },
        depart: "09:30",
        arrive: "22:10",
      },
      {
        mode: "bus",
        from: { name: "Barcelona Nord", lat: 41.3917, lon: 2.181 },
        to: { name: "Peñíscola", lat: 40.3579, lon: 0.4069 },
        depart: "22:40",
        arrive: "01:10",
      },
    ],
  },
  {
    id: "3",
    title: "Fewest transfers",
    price: 99,
    duration: "13h 05m",
    transfers: 1,
    modes: ["train", "bus"],
    segments: [
      {
        mode: "train",
        from: { name: "Amsterdam Centraal", lat: 52.3791, lon: 4.9003 },
        to: { name: "Barcelona Sants", lat: 41.379, lon: 2.14 },
        depart: "07:10",
        arrive: "19:40",
      },
      {
        mode: "bus",
        from: { name: "Barcelona Sants", lat: 41.379, lon: 2.14 },
        to: { name: "Peñíscola", lat: 40.3579, lon: 0.4069 },
        depart: "20:10",
        arrive: "23:15",
      },
    ],
  },
];

function toLine(it: Itinerary) {
  const coords: number[][] = [];
  it.segments.forEach((s, idx) => {
    if (idx === 0) coords.push([s.from.lon, s.from.lat]);
    coords.push([s.to.lon, s.to.lat]);
  });
  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: {},
        geometry: { type: "LineString" as const, coordinates: coords },
      },
    ],
  };
}

export default function ResultsPage() {
  const [activeId, setActiveId] = useState(demo[0].id);
  const active = useMemo(
    () => demo.find((d) => d.id === activeId) ?? demo[0],
    [activeId]
  );

  const geojson = useMemo(() => toLine(active), [active]);

  const layer: any = {
    id: "route",
    type: "line",
    paint: { "line-width": 5 },
  };

  const start = active.segments[0].from;
  const end = active.segments[active.segments.length - 1].to;

  return (
    <div style={{ height: "100vh", display: "grid", gridTemplateColumns: "440px 1fr" }}>
      <div style={{ borderRight: "1px solid rgba(0,0,0,0.08)", padding: 16, overflow: "auto" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)" }}>Trains</button>
          <button style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)" }}>Buses</button>
          <button style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)" }}>Mixed</button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input placeholder="From" defaultValue="Amsterdam Centraal" style={{ flex: 1, padding: 10, borderRadius: 12, border: "1px solid rgba(0,0,0,0.15)" }} />
          <input placeholder="To" defaultValue="Peñíscola" style={{ flex: 1, padding: 10, borderRadius: 12, border: "1px solid rgba(0,0,0,0.15)" }} />
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <select style={{ flex: 1, padding: 10, borderRadius: 12, border: "1px solid rgba(0,0,0,0.15)" }}>
            <option>Sort: Best</option>
            <option>Sort: Price</option>
            <option>Sort: Duration</option>
          </select>
          <select style={{ flex: 1, padding: 10, borderRadius: 12, border: "1px solid rgba(0,0,0,0.15)" }}>
            <option>Stops</option>
            <option>0 to 1</option>
            <option>2+</option>
          </select>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {demo.map((it) => (
            <button
              key={it.id}
              onClick={() => setActiveId(it.id)}
              style={{
                textAlign: "left",
                padding: 12,
                borderRadius: 14,
                border: it.id === activeId ? "2px solid rgba(0,0,0,0.35)" : "1px solid rgba(0,0,0,0.15)",
                background: "white",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 700 }}>{it.title}</div>
                <div style={{ fontWeight: 700 }}>€{it.price}</div>
              </div>
              <div style={{ marginTop: 6, opacity: 0.8 }}>
                {it.duration} • {it.transfers} transfer
              </div>
              <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {it.modes.map((m, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 12,
                      padding: "4px 8px",
                      borderRadius: 999,
                      border: "1px solid rgba(0,0,0,0.15)",
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <Map
          initialViewState={{ latitude: 47.3, longitude: 2.0, zoom: 4 }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
        >
          <Source id="routeSource" type="geojson" data={geojson as any}>
            <Layer {...layer} />
          </Source>

          <Marker longitude={start.lon} latitude={start.lat} anchor="bottom" />
          <Marker longitude={end.lon} latitude={end.lat} anchor="bottom" />
        </Map>
      </div>
    </div>
  );
}
