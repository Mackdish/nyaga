import { SHIPPING_ZONES, ZONES_BY_REGION, getZoneById, FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import { useShipping } from "@/lib/store";
import { KES } from "@/lib/catalog";
import { MapPin, Truck } from "lucide-react";

export function ShippingSelector({ subtotal, compact = false }: { subtotal: number; compact?: boolean }) {
  const zoneId = useShipping((s) => s.zoneId);
  const setZoneId = useShipping((s) => s.setZoneId);
  const zone = getZoneById(zoneId) ?? SHIPPING_ZONES[0];
  const free = subtotal >= FREE_SHIPPING_THRESHOLD;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <label className="block">
        <span className="text-sm font-semibold flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-primary" /> Delivery location
        </span>
        <select
          value={zoneId}
          onChange={(e) => setZoneId(e.target.value)}
          className="mt-1.5 w-full h-11 px-3 rounded-md border border-border bg-background outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          {Object.entries(ZONES_BY_REGION).map(([region, zones]) => (
            <optgroup key={region} label={region}>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} — {KES(z.cost)} ({z.eta})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <div className="flex items-start gap-2 text-xs bg-accent/50 border border-border rounded-md p-2.5">
        <Truck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-medium text-foreground">
            {free ? (
              <span className="text-success">Free shipping unlocked! 🎉</span>
            ) : (
              <>Shipping to {zone.name}: <span className="font-bold">{KES(zone.cost)}</span></>
            )}
          </div>
          <div className="text-muted-foreground mt-0.5">
            ETA: {zone.eta}
            {!free && remaining > 0 && (
              <> · Add {KES(remaining)} more for free shipping</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
