import { NetworkLog } from "@/services/networkService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

interface NetworkLogsProps {
  logs: NetworkLog[];
}

export const NetworkLogs = ({ logs }: NetworkLogsProps) => {
  return (
    <div className="rounded-lg border bg-card h-full">
      <div className="p-4 border-b sticky top-0 bg-card z-10">
        <h2 className="text-lg font-semibold">Network Logs</h2>
      </div>
      <Table>
        <TableHeader className="sticky top-[65px] bg-card">
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Event Type</TableHead>
            <TableHead>Source IP</TableHead>
            <TableHead>Destination IP</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</TableCell>
              <TableCell>
                <span className="capitalize">{log.event_type}</span>
              </TableCell>
              <TableCell>{log.source_ip || '-'}</TableCell>
              <TableCell>{log.destination_ip || '-'}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
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
  );
};