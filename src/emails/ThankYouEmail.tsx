import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Button,
  Section,
  Img,
} from '@react-email/components';
import * as React from 'react';

interface ThankYouEmailProps {
  donorName: string;
  amount: number;
  donationType: 'one-time' | 'monthly' | 'recurring';
  recurringInterval?: 'weekly' | 'biweekly' | 'monthly';
  impact: {
    description: string;
    metrics: Array<{
      label: string;
      value: string;
    }>;
  };
  organizationInfo: {
    name: string;
    website: string;
    socialLinks: {
      twitter?: string;
      facebook?: string;
      instagram?: string;
    };
  };
}

export const ThankYouEmail: React.FC<ThankYouEmailProps> = ({
  donorName,
  amount,
  donationType,
  recurringInterval = 'monthly',
  impact,
  organizationInfo,
}) => {
  const previewText = \`Thank you for your support, \${donorName}!\`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Image */}
          <Section style={header}>
            <Img
              src={\`\${organizationInfo.website}/thank-you-header.jpg\`}
              width="600"
              height="200"
              alt="Thank You"
              style={headerImage}
            />
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={heading}>Thank You for Your Support!</Heading>
            
            <Text style={paragraph}>Dear {donorName},</Text>
            
            <Text style={paragraph}>
              We are deeply grateful for your {donationType === 'one-time' ? 'one-time' : recurringInterval}{' '}
              donation of ${amount.toLocaleString()}. Your generosity makes a real difference in
              helping us provide essential healthcare services to those who need it most.
            </Text>

            {/* Impact Section */}
            <Section style={impactSection}>
              <Heading as="h2" style={subheading}>Your Impact</Heading>
              <Text style={paragraph}>{impact.description}</Text>
              
              <Section style={metricsContainer}>
                {impact.metrics.map((metric, index) => (
                  <div key={index} style={metricBox}>
                    <Text style={metricValue}>{metric.value}</Text>
                    <Text style={metricLabel}>{metric.label}</Text>
                  </div>
                ))}
              </Section>
            </Section>

            {/* Next Steps */}
            {donationType !== 'one-time' && (
              <Section style={nextSteps}>
                <Heading as="h2" style={subheading}>What's Next?</Heading>
                <Text style={paragraph}>
                  • Your next donation will be processed automatically
                  {donationType === 'recurring' ? \` every \${recurringInterval}\` : ' monthly'}
                </Text>
                <Text style={paragraph}>
                  • You'll receive regular updates about the impact of your support
                </Text>
                <Text style={paragraph}>
                  • Tax receipts will be sent to you annually
                </Text>
              </Section>
            )}

            {/* Call to Action */}
            <Section style={ctaContainer}>
              <Button pX={20} pY={12} style={button} href={organizationInfo.website + '/impact'}>
                See Your Impact Dashboard
              </Button>
            </Section>

            {/* Social Sharing */}
            <Section style={socialSection}>
              <Text style={socialText}>Share your support:</Text>
              <div style={socialLinks}>
                {organizationInfo.socialLinks.twitter && (
                  <Link href={organizationInfo.socialLinks.twitter} style={socialLink}>Twitter</Link>
                )}
                {organizationInfo.socialLinks.facebook && (
                  <Link href={organizationInfo.socialLinks.facebook} style={socialLink}>Facebook</Link>
                )}
                {organizationInfo.socialLinks.instagram && (
                  <Link href={organizationInfo.socialLinks.instagram} style={socialLink}>Instagram</Link>
                )}
              </div>
            </Section>

            {/* Footer */}
            <Section style={footer}>
              <Text style={footerText}>
                With gratitude,<br />
                The {organizationInfo.name} Team
              </Text>
              <Text style={footerLinks}>
                <Link href={\`\${organizationInfo.website}/privacy\`} style={link}>Privacy Policy</Link>
                {' • '}
                <Link href={\`\${organizationInfo.website}/contact\`} style={link}>Contact Us</Link>
                {' • '}
                <Link href={\`\${organizationInfo.website}/unsubscribe\`} style={link}>Unsubscribe</Link>
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0 0 48px',
  marginBottom: '64px',
};

const header = {
  marginBottom: '32px',
};

const headerImage = {
  width: '100%',
  objectFit: 'cover' as const,
  borderRadius: '8px 8px 0 0',
};

const content = {
  padding: '0 48px',
};

const heading = {
  fontSize: '32px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#1f2937',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const subheading = {
  fontSize: '24px',
  lineHeight: '1.3',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 16px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#4b5563',
  margin: '0 0 16px',
};

const impactSection = {
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
};

const metricsContainer = {
  display: 'flex' as const,
  justifyContent: 'space-around' as const,
  margin: '24px 0',
};

const metricBox = {
  textAlign: 'center' as const,
  padding: '16px',
};

const metricValue = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#e11d48',
  margin: '0 0 8px',
};

const metricLabel = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
};

const nextSteps = {
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#fff7ed',
  borderRadius: '8px',
};

const ctaContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#e11d48',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
};

const socialSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const socialText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 16px',
};

const socialLinks = {
  display: 'flex' as const,
  justifyContent: 'center' as const,
  gap: '16px',
};

const socialLink = {
  color: '#e11d48',
  textDecoration: 'none',
  fontSize: '14px',
};

const footer = {
  textAlign: 'center' as const,
  marginTop: '48px',
  padding: '32px 0',
  borderTop: '1px solid #e5e7eb',
};

const footerText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 16px',
};

const footerLinks = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0',
};

const link = {
  color: '#6b7280',
  textDecoration: 'underline',
};

export default ThankYouEmail;
