interface MapEmbedProps {
  lat: number;
  lng: number;
  label: string;
}

export default function MapEmbed({ lat, lng, label }: MapEmbedProps) {
  const src = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-md border border-border">
      <iframe
        title={`Map to ${label}`}
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
