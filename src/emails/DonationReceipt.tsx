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
  Row,
  Column,
  Img,
} from '@react-email/components';
import * as React from 'react';

interface DonationReceiptEmailProps {
  donorName: string;
  amount: number;
  donationType: 'one-time' | 'monthly' | 'recurring';
  recurringInterval?: 'weekly' | 'biweekly' | 'monthly';
  transactionId: string;
  date: string;
  taxDeductible: boolean;
  organizationInfo: {
    name: string;
    address: string;
    taxId: string;
    website: string;
  };
}

export const DonationReceiptEmail: React.FC<DonationReceiptEmailProps> = ({
  donorName,
  amount,
  donationType,
  recurringInterval = 'monthly',
  transactionId,
  date,
  taxDeductible,
  organizationInfo,
}) => {
  const previewText = \`Thank you for your \${donationType === 'one-time' ? '' : recurringInterval + ' '
    }donation of $\${amount}\`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={\`\${organizationInfo.website}/logo.png\`}
              width="150"
              height="50"
              alt={organizationInfo.name}
            />
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={heading}>Donation Receipt</Heading>
            <Text style={paragraph}>Dear {donorName},</Text>
            <Text style={paragraph}>
              Thank you for your generous {donationType === 'one-time' ? 'one-time' : recurringInterval}{' '}
              donation of ${amount.toLocaleString()}. Your support helps us continue our mission
              of providing essential healthcare services to those in need.
            </Text>

            {/* Donation Details */}
            <Section style={detailsContainer}>
              <Row>
                <Column>
                  <Text style={detailLabel}>Amount:</Text>
                </Column>
                <Column>
                  <Text style={detailValue}>
                    ${amount.toLocaleString()}
                    {donationType !== 'one-time' && \`/\${recurringInterval}\`}
                  </Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={detailLabel}>Date:</Text>
                </Column>
                <Column>
                  <Text style={detailValue}>{date}</Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={detailLabel}>Transaction ID:</Text>
                </Column>
                <Column>
                  <Text style={detailValue}>{transactionId}</Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={detailLabel}>Type:</Text>
                </Column>
                <Column>
                  <Text style={detailValue}>
                    {donationType === 'one-time'
                      ? 'One-time donation'
                      : \`\${recurringInterval.charAt(0).toUpperCase() + 
                          recurringInterval.slice(1)} donation\`}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Tax Information */}
            {taxDeductible && (
              <Section style={taxInfo}>
                <Text style={paragraph}>
                  This letter serves as your official receipt for tax purposes. {organizationInfo.name}{' '}
                  is a registered non-profit organization (Tax ID: {organizationInfo.taxId}).
                  No goods or services were provided in exchange for this contribution.
                </Text>
              </Section>
            )}

            {/* Organization Info */}
            <Section style={orgInfo}>
              <Text style={smallText}>{organizationInfo.name}</Text>
              <Text style={smallText}>{organizationInfo.address}</Text>
              <Text style={smallText}>Tax ID: {organizationInfo.taxId}</Text>
            </Section>

            {/* Call to Action */}
            <Section style={ctaContainer}>
              <Button
                pX={20}
                pY={12}
                style={button}
                href={organizationInfo.website + '/account'}
              >
                View Your Donation History
              </Button>
            </Section>

            {/* Footer */}
            <Section style={footer}>
              <Text style={footerText}>
                Questions? Contact us at{' '}
                <Link href={\`mailto:support@\${organizationInfo.website}\`} style={link}>
                  support@{organizationInfo.website}
                </Link>
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
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '32px',
  textAlign: 'center' as const,
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
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#4b5563',
  margin: '0 0 16px',
};

const detailsContainer = {
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
};

const detailLabel = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
  padding: '8px 0',
};

const detailValue = {
  fontSize: '14px',
  color: '#1f2937',
  fontWeight: '500',
  margin: '0',
  padding: '8px 0',
};

const taxInfo = {
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#fff7ed',
  borderRadius: '8px',
};

const orgInfo = {
  marginTop: '32px',
  padding: '24px',
  borderTop: '1px solid #e5e7eb',
};

const smallText = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0 0 4px',
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

const footer = {
  textAlign: 'center' as const,
  marginTop: '32px',
};

const footerText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
};

const link = {
  color: '#e11d48',
  textDecoration: 'underline',
};

export default DonationReceiptEmail;
