import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Creative Hauz Automation Scanner"

interface ReportSummaryProps {
  name?: string
  totalHoursSaved?: number
  recommendations?: Array<{ title: string; hoursSaved: number; roi: string }>
}

const ReportSummaryEmail = ({ name, totalHoursSaved, recommendations }: ReportSummaryProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your AI Automation Report from Creative Hauz — {totalHoursSaved ?? 0}+ hours/month savings identified</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={headerSection}>
          <Text style={logoText}>
            Creative <span style={logoAccent}>Hauz</span>
          </Text>
        </Section>

        <Heading style={h1}>
          {name ? `${name}, your automation report is ready!` : 'Your automation report is ready!'}
        </Heading>

        <Text style={text}>
          Thank you for completing the Creative Hauz Automation Scanner. Here's a summary of the AI automation opportunities we identified for your business.
        </Text>

        {/* Hours saved highlight */}
        <Section style={highlightBox}>
          <Text style={highlightNumber}>{totalHoursSaved ?? 0}+</Text>
          <Text style={highlightLabel}>Hours/Month You Could Save</Text>
        </Section>

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <Section>
            <Heading style={h2}>Top Automation Opportunities</Heading>
            {recommendations.map((rec, i) => (
              <Section key={i} style={recCard}>
                <Text style={recTitle}>{rec.title}</Text>
                <Text style={recDetail}>
                  ⏱ {rec.hoursSaved} hrs/month saved &nbsp;·&nbsp; 💰 {rec.roi} ROI
                </Text>
              </Section>
            ))}
          </Section>
        )}

        <Hr style={divider} />

        {/* CTA */}
        <Section style={ctaSection}>
          <Text style={ctaText}>
            Ready to implement these automations and start saving time?
          </Text>
          <Button style={ctaButton} href="https://calendar.app.google/r7Q8bwxVH5JBsmJW9">
            Book a Free Discovery Call
          </Button>
        </Section>

        <Hr style={divider} />

        {/* Footer */}
        <Text style={footer}>
          Built by Creative Hauz · <a href="https://creativehauz.space" style={footerLink}>creativehauz.space</a>
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ReportSummaryEmail,
  subject: (data: Record<string, any>) =>
    `Your AI Automation Report — ${data.totalHoursSaved ?? 0}+ Hours/Month Savings`,
  displayName: 'Automation Report Summary',
  previewData: {
    name: 'Jane',
    totalHoursSaved: 42,
    recommendations: [
      { title: 'AI-Powered Lead Follow-Up', hoursSaved: 15, roi: '320%' },
      { title: 'Automated Appointment Scheduling', hoursSaved: 12, roi: '280%' },
      { title: 'Smart Document Processing', hoursSaved: 8, roi: '200%' },
    ],
  },
} satisfies TemplateEntry

// Styles — Creative Hauz terracotta/green brand
const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '580px', margin: '0 auto' }
const headerSection = { marginBottom: '24px' }
const logoText = { fontSize: '22px', fontWeight: '700' as const, color: '#1a1a1a', margin: '0' }
const logoAccent = { color: '#c4572a' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#1a1a1a', margin: '0 0 16px', lineHeight: '1.3' }
const h2 = { fontSize: '18px', fontWeight: '600' as const, color: '#1a1a1a', margin: '24px 0 12px' }
const text = { fontSize: '15px', color: '#555555', lineHeight: '1.6', margin: '0 0 20px' }
const highlightBox = {
  backgroundColor: '#fdf3ef',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '0 0 24px',
  border: '1px solid #f5d5c8',
}
const highlightNumber = { fontSize: '42px', fontWeight: '800' as const, color: '#c4572a', margin: '0', lineHeight: '1' }
const highlightLabel = { fontSize: '14px', color: '#777777', margin: '8px 0 0', fontWeight: '500' as const }
const recCard = {
  backgroundColor: '#f8f8f6',
  borderRadius: '8px',
  padding: '14px 16px',
  marginBottom: '8px',
  borderLeft: '4px solid #4a9e7a',
}
const recTitle = { fontSize: '15px', fontWeight: '600' as const, color: '#1a1a1a', margin: '0 0 4px' }
const recDetail = { fontSize: '13px', color: '#777777', margin: '0' }
const divider = { borderColor: '#eeeeee', margin: '28px 0' }
const ctaSection = { textAlign: 'center' as const }
const ctaText = { fontSize: '15px', color: '#555555', margin: '0 0 16px' }
const ctaButton = {
  backgroundColor: '#c4572a',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  display: 'inline-block',
}
const footer = { fontSize: '12px', color: '#999999', textAlign: 'center' as const, margin: '0' }
const footerLink = { color: '#c4572a', textDecoration: 'underline' }
