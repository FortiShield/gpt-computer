import Link from 'next/link'
import { ArrowRight, Shield, Zap, Lock, Eye, Terminal, Network } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-block px-4 py-2 rounded bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/20">
              <p className="text-sm font-medium text-[hsl(var(--accent))]">
                Secure Sandbox Execution Engine
              </p>
            </div>

            <h1 className="heading-1 text-5xl md:text-6xl">
              Execute Code Safely in Isolated Sandboxes
            </h1>

            <p className="text-lg text-muted max-w-2xl mx-auto">
              GPT Computer provides a secure, scalable platform for executing AI agent commands in isolated sandbox environments with real-time monitoring, policy enforcement, and comprehensive audit logging.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] font-semibold hover:brightness-110 transition-all"
            >
              Enter Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded bg-[hsl(var(--secondary))] text-foreground font-semibold border border-[hsl(var(--card-border))] hover:bg-opacity-80 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-[hsl(var(--secondary))]">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="heading-2">Enterprise-Grade Security</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Built with security-first architecture for AI agent command execution
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-8 w-8" />,
                title: 'Policy Enforcement',
                description: 'Define and enforce execution policies with granular control over allowed commands, resources, and filesystem access.',
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: 'Real-Time Streaming',
                description: 'Stream command output in real-time with WebSocket/SSE support for immediate feedback and monitoring.',
              },
              {
                icon: <Lock className="h-8 w-8" />,
                title: 'Multi-Runtime Support',
                description: 'Execute in Docker containers, Firecracker microVMs, or local restricted shells with configurable limits.',
              },
              {
                icon: <Eye className="h-8 w-8" />,
                title: 'Comprehensive Audit Logging',
                description: 'Complete audit trail of all executions, policy changes, and security events for compliance and debugging.',
              },
              {
                icon: <Terminal className="h-8 w-8" />,
                title: 'Session Management',
                description: 'Manage active sessions, queued jobs, and historical execution records with detailed analytics.',
              },
              {
                icon: <Network className="h-8 w-8" />,
                title: 'Node Management',
                description: 'Monitor and manage distributed execution nodes with real-time health metrics and resource utilization.',
              },
            ].map((feature, i) => (
              <div key={i} className="card p-6 space-y-3">
                <div className="text-[hsl(var(--accent))]">{feature.icon}</div>
                <h3 className="heading-3">{feature.title}</h3>
                <p className="text-muted text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-8 card p-12">
          <h2 className="heading-2">Ready to Secure Your AI Agents?</h2>
          <p className="text-muted text-lg">
            Deploy GPT Computer to safely execute agent commands in production environments.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] font-semibold hover:brightness-110 transition-all"
          >
            Launch Dashboard
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  )
}
