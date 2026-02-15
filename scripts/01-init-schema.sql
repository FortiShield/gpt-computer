-- GPT Computer Production Database Schema
-- Created for Neon PostgreSQL

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(36) PRIMARY KEY,
  agent_id VARCHAR(255) NOT NULL,
  agent_name VARCHAR(255),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'completed', 'failed', 'cancelled')),
  policy_id VARCHAR(36),
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS sessions_agent_id_idx ON sessions(agent_id);
CREATE INDEX IF NOT EXISTS sessions_status_idx ON sessions(status);
CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON sessions(created_at);

-- Executions table
CREATE TABLE IF NOT EXISTS executions (
  id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(36) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  command TEXT NOT NULL,
  runtime VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('queued', 'running', 'success', 'failed', 'timeout')),
  exit_code INTEGER,
  output TEXT,
  error TEXT,
  duration INTEGER,
  cpu_usage NUMERIC(5, 2),
  memory_usage NUMERIC(10, 2),
  container_id VARCHAR(255),
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS executions_session_id_idx ON executions(session_id);
CREATE INDEX IF NOT EXISTS executions_status_idx ON executions(status);
CREATE INDEX IF NOT EXISTS executions_created_at_idx ON executions(created_at);
CREATE INDEX IF NOT EXISTS executions_runtime_idx ON executions(runtime);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(36) REFERENCES sessions(id) ON DELETE SET NULL,
  execution_id VARCHAR(36) REFERENCES executions(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL CHECK (
    action IN (
      'execute',
      'block',
      'policy_change',
      'session_create',
      'session_close',
      'node_register',
      'node_offline'
    )
  ),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  message TEXT NOT NULL,
  actor VARCHAR(255),
  details JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_logs_session_id_idx ON audit_logs(session_id);
CREATE INDEX IF NOT EXISTS audit_logs_execution_id_idx ON audit_logs(execution_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_severity_idx ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at);

-- Policies table
CREATE TABLE IF NOT EXISTS policies (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS policies_name_idx ON policies(name);
CREATE INDEX IF NOT EXISTS policies_is_active_idx ON policies(is_active);

-- Policy history table
CREATE TABLE IF NOT EXISTS policy_history (
  id VARCHAR(36) PRIMARY KEY,
  policy_id VARCHAR(36) NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  config JSONB NOT NULL,
  change_reason TEXT,
  changed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  changed_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS policy_history_policy_id_idx ON policy_history(policy_id);
CREATE INDEX IF NOT EXISTS policy_history_version_idx ON policy_history(version);

-- Nodes table
CREATE TABLE IF NOT EXISTS nodes (
  id VARCHAR(36) PRIMARY KEY,
  hostname VARCHAR(255) NOT NULL,
  node_type VARCHAR(50) NOT NULL CHECK (node_type IN ('local', 'remote_ssh', 'docker_api', 'cluster')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'degraded', 'offline')),
  cpu_cores INTEGER,
  memory_bytes NUMERIC(20, 0),
  cpu_usage_percent NUMERIC(5, 2),
  memory_usage_percent NUMERIC(5, 2),
  container_count INTEGER,
  last_health_check TIMESTAMP,
  metadata JSONB,
  registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS nodes_hostname_idx ON nodes(hostname);
CREATE INDEX IF NOT EXISTS nodes_status_idx ON nodes(status);
CREATE INDEX IF NOT EXISTS nodes_node_type_idx ON nodes(node_type);

-- Execution metrics table
CREATE TABLE IF NOT EXISTS execution_metrics (
  id VARCHAR(36) PRIMARY KEY,
  execution_id VARCHAR(36) NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
  cpu_usage NUMERIC(5, 2),
  memory_usage NUMERIC(10, 2),
  disk_io_read NUMERIC(15, 2),
  disk_io_write NUMERIC(15, 2),
  network_bytes_in NUMERIC(15, 0),
  network_bytes_out NUMERIC(15, 0),
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS execution_metrics_execution_id_idx ON execution_metrics(execution_id);
CREATE INDEX IF NOT EXISTS execution_metrics_timestamp_idx ON execution_metrics(timestamp);

-- Insert default policy
INSERT INTO policies (id, name, description, version, is_active, config, created_at, updated_at)
VALUES (
  'policy-default-001',
  'default',
  'Default execution policy - allows basic command execution',
  1,
  true,
  '{
    "allowedRuntimes": ["bash", "node", "python"],
    "allowNetwork": false,
    "allowFilesystemWrite": false,
    "cpuLimit": 1.0,
    "memoryLimitMB": 512,
    "timeoutSeconds": 30,
    "allowedCommandPatterns": [".*"],
    "blockedCommandPatterns": ["rm -rf /", "sudo", "dd"]
  }',
  NOW(),
  NOW()
)
ON CONFLICT (name) DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nodes_updated_at BEFORE UPDATE ON nodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for time-range queries (for analytics)
CREATE INDEX IF NOT EXISTS executions_created_at_range ON executions(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_range ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS sessions_created_at_range ON sessions(created_at DESC);
