interface MapEmbedProps {
  // A place name / full address to locate. Preferred over lat/lng for accuracy.
  query: string;
  label: string;
}

export default function MapEmbed({ query, label }: MapEmbedProps) {
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-md border border-border">
      <iframe
        title={`Mapa a ${label}`}
        src={src}
        width="100%"
        height="300"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block"
      />
    </div>
  );
}
