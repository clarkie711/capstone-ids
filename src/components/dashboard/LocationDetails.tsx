import { MapPin, Globe2, Info } from "lucide-react";
import { Location } from "@/types/network";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LocationDetailsProps {
  location: Location;
  sourceIp?: string;
}

export const LocationDetails = ({ location, sourceIp }: LocationDetailsProps) => {
  const [locationData, setLocationData] = useState<Location | null>(location);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!locationData?.lat && !locationData?.lon && sourceIp) {
        try {
          const { data, error } = await supabase.functions.invoke('get-ip-location', {
            body: { ip: sourceIp }
          });

          if (error) {
            console.error('Error fetching location:', error);
            return;
          }

          if (data) {
            console.log('Retrieved location data:', data);
            setLocationData(data);
          }
        } catch (error) {
          console.error('Failed to fetch location:', error);
        }
      }
    };

    fetchLocation();
  }, [sourceIp, locationData]);

  const formatCoordinates = (lat: number, lon: number) => {
    return `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(4)}°${lon >= 0 ? 'E' : 'W'}`;
  };

  const getGoogleMapsUrl = (lat: number, lon: number) => {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  };

  if (!locationData) {
    return (
      <div className="bg-secondary/50 p-3 rounded-lg">
        <div className="text-sm text-muted-foreground italic">
          Location information unavailable
        </div>
      </div>
    );
  }

  const hasBasicInfo = locationData.country || locationData.city || locationData.region;
  const hasCoordinates = typeof locationData.lat === 'number' && typeof locationData.lon === 'number';

  if (!hasBasicInfo && !hasCoordinates) {
    return (
      <div className="bg-secondary/50 p-3 rounded-lg">
        <div className="text-sm text-muted-foreground italic">
          Location information unavailable
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary/50 p-3 rounded-lg space-y-2">
      <div className="flex items-center gap-2">
        <Globe2 className="h-5 w-5 text-primary" />
        <span className="font-medium text-foreground">
          Location Details
        </span>
        {locationData?.metadata && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1 text-xs">
                  <p>Source: {locationData.metadata.source}</p>
                  {locationData.metadata.isp && <p>ISP: {locationData.metadata.isp}</p>}
                  {locationData.metadata.org && <p>Organization: {locationData.metadata.org}</p>}
                  {locationData.metadata.timezone && <p>Timezone: {locationData.metadata.timezone}</p>}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        {hasBasicInfo && (
          <>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {locationData.city || 'Unknown City'}, {locationData.region || 'Unknown Region'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe2 className="h-4 w-4" />
              <span>{locationData.country || 'Unknown Country'}</span>
            </div>
          </>
        )}
        {hasCoordinates && (
          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
            <MapPin className="h-4 w-4" />
            <span>
              Coordinates: {formatCoordinates(locationData.lat, locationData.lon)}
            </span>
            <a
              href={getGoogleMapsUrl(locationData.lat, locationData.lon)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline ml-2"
            >
              View on Map
            </a>
          </div>
        )}
      </div>
    </div>
  );
};