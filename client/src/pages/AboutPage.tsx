import Header from '../components/public/Header'
import Footer from '../components/public/Footer'
import { usePageMeta } from '@/lib/usePageMeta'

const VALUES = [
  {
    title: 'Transparency',
    description: 'No hidden fees, no fine print. Our pricing is straightforward and our processes are clear. You always know where your money stands.',
  },
  {
    title: 'Simplicity',
    description: 'Accounting should not require a degree. We strip away complexity and give you the tools you actually need, designed for clarity.',
  },
  {
    title: 'Reliability',
    description: 'Your financial data is mission-critical. We build for uptime, accuracy, and security — so you can focus on running your business.',
  },
  {
    title: 'US-First',
    description: 'Built from the ground up for American small businesses. IRS Schedule C categories, federal tax deadlines, and USD accounting are native, not afterthoughts.',
  },
]

const TEAM = [
  { name: 'Alex Rivera', role: 'Founder & CEO', initials: 'AR' },
  { name: 'Sarah Chen', role: 'Head of Product', initials: 'SC' },
  { name: 'Marcus Johnson', role: 'Lead Engineer', initials: 'MJ' },
  { name: 'Priya Patel', role: 'Head of Design', initials: 'PP' },
]

export default function AboutPage() {
  usePageMeta({ title: 'About', description: 'Learn about Cashaflux � our mission, values, and the team behind the simple accounting platform for small businesses.' })
  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />

      {/* Hero */}
      <section className="pt-36 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Accounting software built for the independent
          </h1>
          <p className="text-lg text-text-muted leading-relaxed max-w-2xl mx-auto">
            Cashaflux was founded on a simple idea: small business owners should not need an accounting degree to understand their finances. We are on a mission to make financial management as simple as checking your email.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Our mission</h2>
          <p className="text-text-muted leading-relaxed text-lg">
            Every day, millions of American freelancers and small business owners spend hours wrestling with spreadsheets or expensive accounting software that was designed for enterprises, not for them. We believe that understanding your cash flow, sending invoices, and preparing for tax season should take minutes, not hours.
          </p>
          <p className="text-text-muted leading-relaxed text-lg mt-4">
            Cashaflux gives you a real-time view of your business finances — outstanding invoices, upcoming expenses, tax obligations — all in one place. No learning curve, no clutter, no surprises.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-12">Our values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {VALUES.map((value) => (
              <div key={value.title} className="p-6 rounded-2xl border border-border bg-surface">
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-4">Meet the team</h2>
          <p className="text-text-muted text-center mb-12 max-w-lg mx-auto">
            A small team passionate about helping small businesses thrive.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="text-center p-6 rounded-2xl border border-border bg-bg">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-semibold text-accent">{member.initials}</span>
                </div>
                <h3 className="font-semibold text-sm">{member.name}</h3>
                <p className="text-text-muted text-xs mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}