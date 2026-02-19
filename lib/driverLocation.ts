import { supabase } from "@/lib/supabaseClient";

/**
 * Reads the device GPS position and upserts it into driver_locations.
 * Safe to call server-side (navigator guard) or when user is not authenticated.
 */
export async function updateDriverLocation(): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      await supabase.from("driver_locations").upsert({
        driver_id: user.id,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        updated_at: new Date().toISOString(),
      });
    },
    (err) => {
      console.warn("[driverLocation] Geolocation unavailable:", err.message);
    }
  );
}
