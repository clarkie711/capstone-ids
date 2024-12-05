import { NetworkLog } from "@/services/networkService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { HelpCircle, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface NetworkLogsProps {
  logs: NetworkLog[];
}

export const NetworkLogs = ({ logs }: NetworkLogsProps) => {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['networkLogs'] });
  };

  // Sort logs by timestamp in descending order (newest first)
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="rounded-lg border bg-card h-full overflow-hidden">
      <div className="p-4 border-b sticky top-0 bg-card z-10 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Network Logs</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      <div className="overflow-auto max-h-[calc(100vh-12rem)]">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="w-[120px]">Time</TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  Event Type
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px] p-4">
                        <p className="text-sm text-muted-foreground">
                          Types of network events that are logged:
                          <br />- <span className="font-medium">connection:</span> New network connections
                          <br />- <span className="font-medium">traffic:</span> Network traffic patterns
                          <br />- <span className="font-medium">security:</span> Security-related events
                          <br />- <span className="font-medium">system:</span> System-level events
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  Source IP
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm text-muted-foreground">
                          The IP address where the network activity originated from
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  Destination IP
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Some events may not have a destination IP depending on the type of network activity</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  Status
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px] p-4">
                        <p className="text-sm text-muted-foreground">
                          Event status indicators:
                          <br />- <span className="font-medium">success:</span> Event completed normally
                          <br />- <span className="font-medium">warning:</span> Potential issues detected
                          <br />- <span className="font-medium">error:</span> Event failed or was blocked
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead className="min-w-[200px]">Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLogs.map((log) => (
              <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="whitespace-nowrap">
                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <span className="capitalize">{log.event_type}</span>
                </TableCell>
                <TableCell className="whitespace-nowrap">{log.source_ip || '-'}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {log.destination_ip ? (
                    log.destination_ip
                  ) : (
                    <span className="text-muted-foreground italic">No destination</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap
                    ${log.status === 'success' ? 'bg-green-100 text-green-800' : 
                      log.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {log.status}
                  </span>
                </TableCell>
                <TableCell className="max-w-md truncate">{log.message}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};