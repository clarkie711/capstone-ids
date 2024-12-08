# Packet Capture Service

This service captures network packets using tshark and sends them to Supabase.

## Prerequisites

1. Install Node.js and npm
2. Install Wireshark and tshark:
   ```bash
   sudo apt update
   sudo apt install wireshark tshark
   ```

3. Configure permissions:
   ```bash
   sudo usermod -aG wireshark $USER
   sudo chmod +x /usr/bin/dumpcap
   ```

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy .env.example to .env and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
4. Edit .env and set:
   - SUPABASE_URL: Your Supabase project URL
   - SUPABASE_KEY: Your Supabase service role key
   - INTERFACE: Your network interface (e.g., eth0)

## Running the Service

Start the service:
```bash
npm start
```

The service will:
1. Capture packets using tshark
2. Process the packet data
3. Send it to your Supabase database
4. Display logs of captured packets

## Stopping the Service

Press Ctrl+C to stop the service gracefully.