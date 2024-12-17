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

interface CampaignUpdateEmailProps {
  recipientName: string;
  campaignName: string;
  campaignProgress: {
    raised: number;
    goal: number;
    donorCount: number;
    daysLeft: number;
  };
  recentUpdates: Array<{
    date: string;
    title: string;
    description: string;
    imageUrl?: string;
  }>;
  upcomingMilestones: Array<{
    title: string;
    description: string;
    date: string;
  }>;
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    imageUrl?: string;
  };
  socialStats?: {
    shares: number;
    comments: number;
    likes: number;
  };
}

export const CampaignUpdateEmail = ({
  recipientName,
  campaignName,
  campaignProgress,
  recentUpdates,
  upcomingMilestones,
  testimonial,
  socialStats,
}: CampaignUpdateEmailProps) => {
  const previewText = `Campaign Update: ${campaignName} - See our latest progress and upcoming milestones!`;

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

          {/* Campaign Progress */}
          <Section style={progressSection}>
            <Heading style={heading}>Campaign Update: {campaignName}</Heading>
            <Text style={paragraph}>
              Dear {recipientName},
            </Text>
            <Text style={paragraph}>
              Thank you for being part of our mission. Here's the latest update on our progress.
            </Text>

            <Section style={statsGrid}>
              <div style={statBox}>
                <Text style={statValue}>
                  ${campaignProgress.raised.toLocaleString()}
                </Text>
                <Text style={statLabel}>
                  Raised of ${campaignProgress.goal.toLocaleString()} Goal
                </Text>
                <Section style={progressBar}>
                  <Section
                    style={{
                      ...progressBarFill,
                      width: \`\${(campaignProgress.raised / campaignProgress.goal) * 100}%\`,
                    }}
                  />
                </Section>
              </div>

              <div style={statBox}>
                <Text style={statValue}>{campaignProgress.donorCount}</Text>
                <Text style={statLabel}>Generous Donors</Text>
              </div>

              <div style={statBox}>
                <Text style={statValue}>{campaignProgress.daysLeft}</Text>
                <Text style={statLabel}>Days Left</Text>
              </div>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Recent Updates */}
          <Heading style={subheading}>Recent Progress</Heading>
          {recentUpdates.map((update, index) => (
            <Section key={index} style={updateContainer}>
              {update.imageUrl && (
                <Img
                  src={update.imageUrl}
                  width="100%"
                  height="200"
                  alt={update.title}
                  style={updateImage}
                />
              )}
              <Text style={updateDate}>{update.date}</Text>
              <Heading style={updateTitle}>{update.title}</Heading>
              <Text style={paragraph}>{update.description}</Text>
            </Section>
          ))}

          <Hr style={hr} />

          {/* Upcoming Milestones */}
          <Heading style={subheading}>What's Coming Next</Heading>
          <Section style={milestonesContainer}>
            {upcomingMilestones.map((milestone, index) => (
              <Section key={index} style={milestoneBox}>
                <Text style={milestoneDate}>{milestone.date}</Text>
                <Heading style={milestoneTitle}>{milestone.title}</Heading>
                <Text style={paragraph}>{milestone.description}</Text>
              </Section>
            ))}
          </Section>

          {testimonial && (
            <>
              <Hr style={hr} />
              <Section style={testimonialContainer}>
                {testimonial.imageUrl && (
                  <Img
                    src={testimonial.imageUrl}
                    width="60"
                    height="60"
                    alt={testimonial.author}
                    style={testimonialImage}
                  />
                )}
                <Text style={testimonialQuote}>"{testimonial.quote}"</Text>
                <Text style={testimonialAuthor}>
                  {testimonial.author}
                </Text>
                <Text style={testimonialRole}>
                  {testimonial.role}
                </Text>
              </Section>
            </>
          )}

          {socialStats && (
            <Section style={socialContainer}>
              <Text style={socialText}>
                Join {socialStats.shares.toLocaleString()} others in sharing our campaign
              </Text>
              <div style={socialStats}>
                <Text style={socialStat}>
                  {socialStats.likes} Likes
                </Text>
                <Text style={socialStat}>
                  {socialStats.comments} Comments
                </Text>
                <Text style={socialStat}>
                  {socialStats.shares} Shares
                </Text>
              </div>
            </Section>
          )}

          {/* Call to Action */}
          <Section style={ctaContainer}>
            <Button
              pX={20}
              pY={12}
              style={button}
              href={\`\${process.env.NEXT_PUBLIC_APP_URL}/campaign/\${campaignName}\`}
            >
              View Full Campaign
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Thank you for supporting {campaignName}
            </Text>
            <Text style={footerLinks}>
              <Link href="#" style={link}>View Online</Link> •{' '}
              <Link href="#" style={link}>Unsubscribe</Link> •{' '}
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

export default CampaignUpdateEmail;

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

const progressSection = {
  padding: '24px',
  backgroundColor: '#f9fafb',
  borderRadius: '5px',
  marginBottom: '24px',
};

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '16px',
  padding: '16px 0',
};

const statBox = {
  textAlign: 'center' as const,
  padding: '16px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

const statValue = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#e11d48',
  margin: '0',
};

const statLabel = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '4px 0 0',
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

const updateContainer = {
  marginBottom: '32px',
};

const updateImage = {
  borderRadius: '8px',
  marginBottom: '16px',
};

const updateDate = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 8px',
};

const updateTitle = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#484848',
  margin: '0 0 12px',
};

const milestonesContainer = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '16px',
};

const milestoneBox = {
  padding: '16px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
};

const milestoneDate = {
  fontSize: '14px',
  color: '#e11d48',
  fontWeight: '500',
  margin: '0 0 8px',
};

const milestoneTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#484848',
  margin: '0 0 8px',
};

const testimonialContainer = {
  textAlign: 'center' as const,
  padding: '32px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  margin: '24px 0',
};

const testimonialImage = {
  borderRadius: '50%',
  marginBottom: '16px',
};

const testimonialQuote = {
  fontSize: '18px',
  fontStyle: 'italic',
  color: '#484848',
  margin: '0 0 16px',
  lineHeight: '1.6',
};

const testimonialAuthor = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#484848',
  margin: '0 0 4px',
};

const testimonialRole = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
};

const socialContainer = {
  textAlign: 'center' as const,
  padding: '24px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  margin: '24px 0',
};

const socialText = {
  fontSize: '16px',
  color: '#484848',
  margin: '0 0 16px',
};

const socialStats = {
  display: 'flex',
  justifyContent: 'center',
  gap: '24px',
};

const socialStat = {
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
