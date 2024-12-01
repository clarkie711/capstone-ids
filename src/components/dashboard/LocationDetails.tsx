import { MapPin, Globe2 } from "lucide-react";
import { NetworkThreat } from "@/services/networkService";

interface LocationDetailsProps {
  location: NetworkThreat['location'];
}

export const LocationDetails = ({ location }: LocationDetailsProps) => {
  const formatCoordinates = (lat: number, lon: number) => {
    return `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(4)}°${lon >= 0 ? 'E' : 'W'}`;
  };

  return (
    <div className="bg-secondary/50 p-3 rounded-lg space-y-2">
      <div className="flex items-center gap-2">
        <Globe2 className="h-5 w-5 text-primary" />
        <span className="font-medium text-foreground">
          Location Details
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        {location ? (
          <>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {location.city || 'Unknown City'}, {location.region || 'Unknown Region'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe2 className="h-4 w-4" />
              <span>{location.country || 'Unknown Country'}</span>
            </div>
            {location.lat && location.lon && (
              <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                <MapPin className="h-4 w-4" />
                <span>
                  Coordinates: {formatCoordinates(location.lat, location.lon)}
                </span>
                <a
                  href={`https://www.google.com/maps?q=${location.lat},${location.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline ml-2"
                >
                  View on Map
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="col-span-2 text-muted-foreground italic">
            Location information unavailable
          </div>
        )}
      </div>
    </div>
  );
};