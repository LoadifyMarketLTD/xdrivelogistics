import { NextResponse } from "next/server";

interface Coords {
  lat: number;
  lng: number;
}

function isValidCoords(c: unknown): c is Coords {
  return (
    typeof c === "object" &&
    c !== null &&
    typeof (c as Coords).lat === "number" &&
    typeof (c as Coords).lng === "number" &&
    isFinite((c as Coords).lat) &&
    isFinite((c as Coords).lng)
  );
}

export async function POST(req: Request) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return NextResponse.json({ error: "Missing API key" }, { status: 500 });

  const { origin, destination } = await req.json();

  if (!isValidCoords(origin) || !isValidCoords(destination)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const url =
    `https://maps.googleapis.com/maps/api/directions/json` +
    `?origin=${origin.lat},${origin.lng}` +
    `&destination=${destination.lat},${destination.lng}` +
    `&mode=driving&units=imperial&key=${key}`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  const leg = data?.routes?.[0]?.legs?.[0];
  if (!leg) return NextResponse.json({ error: "No route found" }, { status: 400 });

  return NextResponse.json({
    miles: leg.distance.text,
    duration: leg.duration.text,
    polyline: data.routes[0].overview_polyline?.points ?? null
  });
}
