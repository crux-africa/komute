import { MapPin } from "lucide-react";

export function RouteMarquee() {
  const routes = [
    "Ikorodu → Victoria Island",
    "Ajah → Lekki Phase 1",
    "Mowe → Ikeja",
    "Berger → Maryland",
    "Ojo → Apapa",
    "Festac → CMS",
    "Surulere → Yaba",
    "Ogba → Allen Avenue",
    "Ketu → Ojota",
    "Sangotedo → Chevron",
  ];
  return (
    <div className="relative overflow-hidden py-4">
      <div className="marquee-track flex w-max gap-6">
        {[...routes, ...routes].map((route, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-primary/20 bg-primary/5 px-5 py-2.5 text-sm font-medium text-primary"
          >
            <MapPin className="h-3.5 w-3.5" />
            {route}
          </span>
        ))}
      </div>
    </div>
  );
}