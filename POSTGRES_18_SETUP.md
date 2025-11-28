# PostgreSQL 18 Configuration ✅

## Installation Details

Based on the PostgreSQL 18.1-1 installer:

- **Port**: `5433` (not 5432!)
- **Superuser**: `postgres`
- **Installation Directory**: `/Library/PostgreSQL/18`
- **Data Directory**: `/Library/PostgreSQL/18/data`
- **Service**: `postgresql-18`

## Important Notes

### Port Change ⚠️
PostgreSQL 18 uses **port 5433** by default (not 5432) to avoid conflicts with other PostgreSQL installations.

### User Configuration
The installer creates a `postgres` superuser. You'll need to set the password for this user during or after installation.

## Configuration Updated

All configuration files have been updated to use:
- ✅ Port: `5433`
- ✅ User: `postgres`
- ✅ Password: Set during installation (you'll need to configure this)

## After Installation

1. **Start PostgreSQL Service:**
   ```bash
   # Check if service is running
   brew services list | grep postgresql
   
   # Or start manually
   /Library/PostgreSQL/18/bin/pg_ctl -D /Library/PostgreSQL/18/data start
   ```

2. **Set Password for postgres user:**
   ```bash
   # Connect and set password
   /Library/PostgreSQL/18/bin/psql -U postgres -p 5433 -c "ALTER USER postgres WITH PASSWORD 'your_password';"
   ```

3. **Update Environment Variables:**
   ```bash
   export POSTGRES_PASSWORD='your_password'
   export POSTGRES_PORT=5433
   export POSTGRES_USER=postgres
   ```

4. **Initialize Database:**
   ```bash
   POSTGRES_PASSWORD='your_password' POSTGRES_PORT=5433 POSTGRES_USER=postgres node init-db.js
   ```

5. **Start Dashboard:**
   ```bash
   POSTGRES_PASSWORD='your_password' POSTGRES_PORT=5433 POSTGRES_USER=postgres ./run-dashboard.sh
   ```

## Quick Start After Install

```bash
# 1. Set the password you chose during installation
export POSTGRES_PASSWORD='your_chosen_password'
export POSTGRES_PORT=5433
export POSTGRES_USER=postgres

# 2. Initialize database
node init-db.js

# 3. Start dashboard
./run-dashboard.sh
```

## Files Updated

✅ `src/integrations/postgres.ts` - Port 5433, user postgres
✅ `dashboard-server.js` - Port 5433, user postgres
✅ `init-db.js` - Port 5433, user postgres
✅ `start-services.sh` - Port 5433, user postgres
✅ `run-dashboard.sh` - Port 5433, user postgres

## Default Settings

If environment variables are not set, the system now defaults to:
- Port: `5433`
- User: `postgres`
- Password: Set during installation (must be provided)

## Testing Connection

```bash
# Test connection with your password
/Library/PostgreSQL/18/bin/psql -U postgres -p 5433 -d postgres
```

Once connected, you can:
- Create the bugbounty database: `CREATE DATABASE bugbounty;`
- Set up tables using: `node init-db.js`



