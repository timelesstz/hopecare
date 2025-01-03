import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface MonthlyImpactEmailProps {
  donorName: string;
  month: string;
  year: string;
  totalDonation: number;
  impactMetrics: {
    livesImpacted: number;
    communitiesServed: number;
    medicalSuppliesDelivered: number;
    emergencyCareProvided: number;
  };
  upcomingProjects: Array<{
    name: string;
    description: string;
    goal: number;
    progress: number;
  }>;
  testimonial?: {
    quote: string;
    author: string;
    location: string;
  };
}

export const MonthlyImpactEmail = ({
  donorName,
  month,
  year,
  totalDonation,
  impactMetrics,
  upcomingProjects,
  testimonial,
}: MonthlyImpactEmailProps) => {
  const previewText = `Your Impact Report for ${month} ${year} - See how your support is making a difference`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={\`\${process.env.NEXT_PUBLIC_APP_URL}/images/logo.png\`}
              width="150"
              height="50"
              alt="HopeCare"
            />
          </Section>

          {/* Greeting */}
          <Heading style={heading}>
            Your Impact Report for {month} {year}
          </Heading>
          <Text style={paragraph}>
            Dear {donorName},
          </Text>
          <Text style={paragraph}>
            Thank you for your continued support of HopeCare. Your generous donations
            are making a real difference in the lives of those we serve. Here's a look
            at what we've achieved together this month.
          </Text>

          {/* Impact Metrics */}
          <Section style={metricsContainer}>
            <Section style={metric}>
              <Heading style={metricValue}>{impactMetrics.livesImpacted}</Heading>
              <Text style={metricLabel}>Lives Impacted</Text>
            </Section>
            <Section style={metric}>
              <Heading style={metricValue}>{impactMetrics.communitiesServed}</Heading>
              <Text style={metricLabel}>Communities Served</Text>
            </Section>
            <Section style={metric}>
              <Heading style={metricValue}>{impactMetrics.medicalSuppliesDelivered}</Heading>
              <Text style={metricLabel}>Medical Supplies Delivered</Text>
            </Section>
            <Section style={metric}>
              <Heading style={metricValue}>{impactMetrics.emergencyCareProvided}</Heading>
              <Text style={metricLabel}>Emergency Care Services</Text>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Upcoming Projects */}
          <Heading style={subheading}>Upcoming Projects</Heading>
          {upcomingProjects.map((project, index) => (
            <Section key={index} style={projectContainer}>
              <Heading style={projectTitle}>{project.name}</Heading>
              <Text style={paragraph}>{project.description}</Text>
              <Section style={progressBar}>
                <Section
                  style={{
                    ...progressBarFill,
                    width: \`\${(project.progress / project.goal) * 100}%\`,
                  }}
                />
              </Section>
              <Text style={progressText}>
                ${project.progress.toLocaleString()} raised of ${project.goal.toLocaleString()} goal
              </Text>
            </Section>
          ))}

          {testimonial && (
            <>
              <Hr style={hr} />
              <Section style={testimonialContainer}>
                <Text style={testimonialQuote}>"{testimonial.quote}"</Text>
                <Text style={testimonialAuthor}>
                  - {testimonial.author}, {testimonial.location}
                </Text>
              </Section>
            </>
          )}

          <Hr style={hr} />

          {/* Call to Action */}
          <Section style={ctaContainer}>
            <Text style={paragraph}>
              Your monthly donation of ${totalDonation} is helping us create lasting change.
              Want to make an even bigger impact?
            </Text>
            <Button
              pX={20}
              pY={12}
              style={button}
              href={\`\${process.env.NEXT_PUBLIC_APP_URL}/donate\`}
            >
              Increase Your Impact
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Thank you for being part of the HopeCare community.
            </Text>
            <Text style={footerLinks}>
              <Link href="#" style={link}>View Online</Link> •{' '}
              <Link href="#" style={link}>Manage Subscription</Link> •{' '}
              <Link href="#" style={link}>Privacy Policy</Link>
            </Text>
            <Text style={footerAddress}>
              HopeCare Foundation • 123 Hope Street • Cityville, ST 12345
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default MonthlyImpactEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
};

const header = {
  padding: '0 48px',
  textAlign: 'center' as const,
};

const heading = {
  fontSize: '32px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#484848',
  padding: '17px 0 0',
};

const paragraph = {
  margin: '0 0 15px',
  fontSize: '16px',
  lineHeight: '1.4',
  color: '#484848',
};

const metricsContainer = {
  padding: '20px',
  backgroundColor: '#f9fafb',
  borderRadius: '5px',
  display: 'flex' as const,
  flexDirection: 'row' as const,
  justifyContent: 'space-between' as const,
  marginBottom: '24px',
};

const metric = {
  textAlign: 'center' as const,
  flex: '1',
};

const metricValue = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#e11d48',
  margin: '0',
};

const metricLabel = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '4px 0 0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const subheading = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#484848',
  margin: '0 0 20px',
};

const projectContainer = {
  marginBottom: '24px',
};

const projectTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#484848',
  margin: '0 0 8px',
};

const progressBar = {
  width: '100%',
  height: '8px',
  backgroundColor: '#e5e7eb',
  borderRadius: '4px',
  overflow: 'hidden',
  margin: '8px 0',
};

const progressBarFill = {
  height: '100%',
  backgroundColor: '#e11d48',
  borderRadius: '4px',
};

const progressText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '4px 0 0',
};

const testimonialContainer = {
  padding: '24px',
  backgroundColor: '#f9fafb',
  borderRadius: '5px',
  margin: '24px 0',
};

const testimonialQuote = {
  fontSize: '16px',
  fontStyle: 'italic',
  color: '#484848',
  margin: '0 0 12px',
};

const testimonialAuthor = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
};

const ctaContainer = {
  textAlign: 'center' as const,
  padding: '24px 0',
};

const button = {
  backgroundColor: '#e11d48',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
};

const footer = {
  textAlign: 'center' as const,
  padding: '24px 0 0',
};

const footerText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 8px',
};

const footerLinks = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 8px',
};

const link = {
  color: '#e11d48',
  textDecoration: 'none',
};

const footerAddress = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '0',
};
