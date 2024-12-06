import { MapPin, Globe2, Info } from "lucide-react";
import { Location } from "@/types/network";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LocationDetailsProps {
  location: Location;
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
        {location?.metadata && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1 text-xs">
                  <p>Source: {location.metadata.source}</p>
                  {location.metadata.isp && <p>ISP: {location.metadata.isp}</p>}
                  {location.metadata.org && <p>Organization: {location.metadata.org}</p>}
                  {location.metadata.timezone && <p>Timezone: {location.metadata.timezone}</p>}
                  {location.metadata.proxy !== undefined && (
                    <p>Proxy: {location.metadata.proxy ? 'Yes' : 'No'}</p>
                  )}
                  {location.metadata.hosting !== undefined && (
                    <p>Hosting: {location.metadata.hosting ? 'Yes' : 'No'}</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
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