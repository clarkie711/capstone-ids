import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { getSeverityColor } from './utils/alertUtils';

interface SnortAlertRowProps {
  alert: {
    id: number;
    timestamp: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    signature_name: string;
    source_ip: string;
    source_port?: number;
    destination_ip: string;
    destination_port?: number;
    protocol?: string;
    false_positive: boolean;
  };
  onMarkFalsePositive: (alertId: number) => void;
}

export const SnortAlertRow = ({ alert, onMarkFalsePositive }: SnortAlertRowProps) => {
  return (
    <TableRow key={alert.id}>
      <TableCell>
        {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
      </TableCell>
      <TableCell>
        <span className={`font-semibold ${getSeverityColor(alert.severity)}`}>
          {alert.severity.toUpperCase()}
        </span>
      </TableCell>
      <TableCell>
        <div className="max-w-[300px] truncate">
          {alert.signature_name}
        </div>
      </TableCell>
      <TableCell>
        {alert.source_ip}
        {alert.source_port && `:${alert.source_port}`}
      </TableCell>
      <TableCell>
        {alert.destination_ip}
        {alert.destination_port && `:${alert.destination_port}`}
      </TableCell>
      <TableCell>{alert.protocol || 'N/A'}</TableCell>
      <TableCell>
        {!alert.false_positive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkFalsePositive(alert.id)}
          >
            Mark as False Positive
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};