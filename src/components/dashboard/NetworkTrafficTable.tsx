import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { NetworkTrafficLog } from "./types";

interface NetworkTrafficTableProps {
  logs: NetworkTrafficLog[];
}

export const NetworkTrafficTable = ({ logs }: NetworkTrafficTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">No.</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Destination</TableHead>
          <TableHead>Protocol</TableHead>
          <TableHead>Length</TableHead>
          <TableHead>Info</TableHead>
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
  );
};