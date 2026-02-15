import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  numeric,
  jsonb,
  boolean,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core'

/**
 * Sessions table - tracks execution sessions
 */
export const sessions = pgTable(
  'sessions',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    agentId: varchar('agent_id', { length: 255 }).notNull(),
    agentName: varchar('agent_name', { length: 255 }),
    status: varchar('status', {
      enum: ['active', 'completed', 'failed', 'cancelled'],
      length: 20,
    }).notNull(),
    policyId: varchar('policy_id', { length: 36 }),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
  },
  (table) => ({
    agentIdIdx: index('sessions_agent_id_idx').on(table.agentId),
    statusIdx: index('sessions_status_idx').on(table.status),
    createdAtIdx: index('sessions_created_at_idx').on(table.createdAt),
  })
)

/**
 * Executions table - individual command execution records
 */
export const executions = pgTable(
  'executions',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    sessionId: varchar('session_id', { length: 36 }).notNull(),
    command: text('command').notNull(),
    runtime: varchar('runtime', { length: 50 }).notNull(),
    status: varchar('status', {
      enum: ['queued', 'running', 'success', 'failed', 'timeout'],
      length: 20,
    }).notNull(),
    exitCode: integer('exit_code'),
    output: text('output'),
    error: text('error'),
    duration: integer('duration'), // in milliseconds
    cpuUsage: numeric('cpu_usage', { precision: 5, scale: 2 }),
    memoryUsage: numeric('memory_usage', { precision: 10, scale: 2 }), // in bytes
    containerId: varchar('container_id', { length: 255 }),
    startedAt: timestamp('started_at').notNull(),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    sessionIdIdx: index('executions_session_id_idx').on(table.sessionId),
    statusIdx: index('executions_status_idx').on(table.status),
    createdAtIdx: index('executions_created_at_idx').on(table.createdAt),
    runtimeIdx: index('executions_runtime_idx').on(table.runtime),
  })
)

/**
 * Audit logs table - comprehensive audit trail
 */
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    sessionId: varchar('session_id', { length: 36 }),
    executionId: varchar('execution_id', { length: 36 }),
    action: varchar('action', {
      enum: [
        'execute',
        'block',
        'policy_change',
        'session_create',
        'session_close',
        'node_register',
        'node_offline',
      ],
      length: 50,
    }).notNull(),
    severity: varchar('severity', {
      enum: ['info', 'warning', 'error', 'critical'],
      length: 20,
    }).notNull(),
    message: text('message').notNull(),
    actor: varchar('actor', { length: 255 }),
    details: jsonb('details'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    sessionIdIdx: index('audit_logs_session_id_idx').on(table.sessionId),
    executionIdIdx: index('audit_logs_execution_id_idx').on(table.executionId),
    actionIdx: index('audit_logs_action_idx').on(table.action),
    severityIdx: index('audit_logs_severity_idx').on(table.severity),
    createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt),
  })
)

/**
 * Policies table - execution policies with versioning
 */
export const policies = pgTable(
  'policies',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    description: text('description'),
    version: integer('version').notNull().default(1),
    isActive: boolean('is_active').notNull().default(true),
    config: jsonb('config').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdBy: varchar('created_by', { length: 255 }),
  },
  (table) => ({
    nameIdx: index('policies_name_idx').on(table.name),
    isActiveIdx: index('policies_is_active_idx').on(table.isActive),
  })
)

/**
 * Policy history table - track policy changes over time
 */
export const policyHistory = pgTable(
  'policy_history',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    policyId: varchar('policy_id', { length: 36 }).notNull(),
    version: integer('version').notNull(),
    config: jsonb('config').notNull(),
    changeReason: text('change_reason'),
    changedAt: timestamp('changed_at').defaultNow().notNull(),
    changedBy: varchar('changed_by', { length: 255 }),
  },
  (table) => ({
    policyIdIdx: index('policy_history_policy_id_idx').on(table.policyId),
    versionIdx: index('policy_history_version_idx').on(table.version),
  })
)

/**
 * Nodes table - runtime node registration and health
 */
export const nodes = pgTable(
  'nodes',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    hostname: varchar('hostname', { length: 255 }).notNull(),
    nodeType: varchar('node_type', {
      enum: ['local', 'remote_ssh', 'docker_api', 'cluster'],
      length: 50,
    }).notNull(),
    status: varchar('status', {
      enum: ['healthy', 'degraded', 'offline'],
      length: 20,
    }).notNull(),
    cpuCores: integer('cpu_cores'),
    memoryBytes: numeric('memory_bytes', { precision: 20, scale: 0 }),
    cpuUsagePercent: numeric('cpu_usage_percent', { precision: 5, scale: 2 }),
    memoryUsagePercent: numeric('memory_usage_percent', { precision: 5, scale: 2 }),
    containerCount: integer('container_count'),
    lastHealthCheck: timestamp('last_health_check'),
    metadata: jsonb('metadata'),
    registeredAt: timestamp('registered_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    hostnameIdx: index('nodes_hostname_idx').on(table.hostname),
    statusIdx: index('nodes_status_idx').on(table.status),
    nodeTypeIdx: index('nodes_node_type_idx').on(table.nodeType),
  })
)

/**
 * Execution metrics table - detailed performance metrics
 */
export const executionMetrics = pgTable(
  'execution_metrics',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    executionId: varchar('execution_id', { length: 36 }).notNull(),
    cpuUsage: numeric('cpu_usage', { precision: 5, scale: 2 }),
    memoryUsage: numeric('memory_usage', { precision: 10, scale: 2 }),
    diskIORead: numeric('disk_io_read', { precision: 15, scale: 2 }),
    diskIOWrite: numeric('disk_io_write', { precision: 15, scale: 2 }),
    networkBytesIn: numeric('network_bytes_in', { precision: 15, scale: 0 }),
    networkBytesOut: numeric('network_bytes_out', { precision: 15, scale: 0 }),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
  },
  (table) => ({
    executionIdIdx: index('execution_metrics_execution_id_idx').on(
      table.executionId
    ),
    timestampIdx: index('execution_metrics_timestamp_idx').on(table.timestamp),
  })
)

export type Session = typeof sessions.$inferSelect
export type Execution = typeof executions.$inferSelect
export type AuditLog = typeof auditLogs.$inferSelect
export type Policy = typeof policies.$inferSelect
export type Node = typeof nodes.$inferSelect
export type ExecutionMetric = typeof executionMetrics.$inferSelect
