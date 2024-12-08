import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { NetworkTrafficLog } from "./types";
import { Info } from "lucide-react";

interface NetworkTrafficTableProps {
  logs: NetworkTrafficLog[];
}

export const NetworkTrafficTable = ({ logs }: NetworkTrafficTableProps) => {
  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">No.</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>
              <div className="flex items-center gap-1">
                Source
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The IP address or hostname of the traffic source</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-1">
                Destination
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The IP address or hostname of the traffic destination</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-1">
                Protocol
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The network protocol used (e.g., TCP, UDP, HTTP)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-1">
                Length
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The size of the network packet in bytes</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-1">
                Info
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Additional details about the network traffic</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log, index) => (
            <TableRow key={log.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</TableCell>
              <TableCell>{log.source_address}</TableCell>
              <TableCell>{log.destination_address}</TableCell>
              <TableCell>{log.protocol}</TableCell>
              <TableCell>{log.length} bytes</TableCell>
              <TableCell>{log.info || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
};