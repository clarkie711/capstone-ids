import { NetworkLog } from "@/services/networkService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

interface NetworkLogsProps {
  logs: NetworkLog[];
}

export const NetworkLogs = ({ logs }: NetworkLogsProps) => {
  // Sort logs by timestamp in descending order (newest first)
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="rounded-lg border bg-card h-full overflow-hidden">
      <div className="p-4 border-b sticky top-0 bg-card z-10">
        <h2 className="text-lg font-semibold">Network Logs</h2>
      </div>
      <div className="overflow-auto max-h-[calc(100vh-12rem)]">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Source IP</TableHead>
              <TableHead>Destination IP</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="min-w-[200px]">Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap">
                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <span className="capitalize">{log.event_type}</span>
                </TableCell>
                <TableCell className="whitespace-nowrap">{log.source_ip || '-'}</TableCell>
                <TableCell className="whitespace-nowrap">{log.destination_ip || '-'}</TableCell>
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