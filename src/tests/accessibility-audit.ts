import { AxePuppeteer } from '@axe-core/puppeteer';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

/**
 * Accessibility Audit Script
 * 
 * This script runs an accessibility audit on the application using axe-core.
 * It generates a report of accessibility issues found on each page.
 * 
 * Usage:
 * 1. Start the development server: npm run dev
 * 2. Run this script: npx ts-node src/tests/accessibility-audit.ts
 */

// Configuration
const config = {
  baseUrl: 'http://localhost:4174', // Update this to match your dev server URL
  outputDir: './accessibility-reports',
  routes: [
    { path: '/', name: 'Home' },
    { path: '/about', name: 'About' },
    { path: '/donate', name: 'Donate' },
    { path: '/blog', name: 'Blog' },
    { path: '/contact', name: 'Contact' },
    { path: '/projects', name: 'Projects' }
  ],
  // Axe configuration
  axeConfig: {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
    }
  }
};

// Ensure output directory exists
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Format date for filenames
const formatDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}`;
};

// Generate HTML report
const generateHtmlReport = (results: any, pageName: string) => {
  const violations = results.violations || [];
  
  let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Accessibility Audit - ${pageName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c3e50; }
        h2 { color: #3498db; margin-top: 30px; }
        h3 { margin-top: 20px; }
        .summary { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .violation { background-color: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin-bottom: 20px; }
        .violation.critical { border-left: 5px solid #e74c3c; }
        .violation.serious { border-left: 5px solid #e67e22; }
        .violation.moderate { border-left: 5px solid #f1c40f; }
        .violation.minor { border-left: 5px solid #3498db; }
        .impact { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 0.8em; font-weight: bold; text-transform: uppercase; }
        .impact.critical { background-color: #e74c3c; color: white; }
        .impact.serious { background-color: #e67e22; color: white; }
        .impact.moderate { background-color: #f1c40f; color: #333; }
        .impact.minor { background-color: #3498db; color: white; }
        .nodes { background-color: #f8f9fa; padding: 10px; border-radius: 3px; margin-top: 10px; font-family: monospace; white-space: pre-wrap; }
        .help { margin-top: 10px; }
        .help a { color: #3498db; text-decoration: none; }
        .help a:hover { text-decoration: underline; }
        .pass { color: #27ae60; }
        .timestamp { color: #7f8c8d; font-size: 0.9em; }
        .no-violations { color: #27ae60; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>Accessibility Audit Report</h1>
      <p class="timestamp">Generated on ${new Date().toLocaleString()}</p>
      
      <div class="summary">
        <h2>Summary for ${pageName}</h2>
        <p>URL: ${config.baseUrl}${results.url}</p>
        <p>Total violations: ${violations.length}</p>
        <p>Critical: ${violations.filter(v => v.impact === 'critical').length}</p>
        <p>Serious: ${violations.filter(v => v.impact === 'serious').length}</p>
        <p>Moderate: ${violations.filter(v => v.impact === 'moderate').length}</p>
        <p>Minor: ${violations.filter(v => v.impact === 'minor').length}</p>
      </div>
  `;
  
  if (violations.length === 0) {
    html += `<p class="no-violations">No accessibility violations found! 🎉</p>`;
  } else {
    html += `<h2>Violations</h2>`;
    
    violations.forEach((violation, index) => {
      const impactClass = violation.impact || 'minor';
      
      html += `
        <div class="violation ${impactClass}">
          <h3>${index + 1}. ${violation.help}</h3>
          <p><span class="impact ${impactClass}">${violation.impact || 'minor'}</span> Impact</p>
          <p>${violation.description}</p>
          <p>Rule: ${violation.id} (${violation.tags.join(', ')})</p>
          
          <div class="help">
            <p>How to fix: <a href="${violation.helpUrl}" target="_blank">${violation.helpUrl}</a></p>
          </div>
          
          <h4>Affected Elements (${violation.nodes.length}):</h4>
          ${violation.nodes.map(node => `
            <div class="nodes">
              <p>HTML: ${node.html}</p>
              <p>Failure Summary: ${node.failureSummary}</p>
            </div>
          `).join('')}
        </div>
      `;
    });
  }
  
  html += `
      </body>
      </html>
  `;
  
  return html;
};

// Run the audit
const runAudit = async () => {
  console.log('Starting accessibility audit...');
  
  const browser = await puppeteer.launch({ headless: 'new' });
  const summaryResults = [];
  
  try {
    for (const route of config.routes) {
      console.log(`Auditing ${route.name} (${route.path})...`);
      
      const page = await browser.newPage();
      await page.setBypassCSP(true);
      
      // Navigate to the page
      await page.goto(`${config.baseUrl}${route.path}`, { waitUntil: 'networkidle0' });
      
      // Wait for any client-side rendering to complete
      await page.waitForTimeout(2000);
      
      // Run axe
      const results = await new AxePuppeteer(page)
        .configure(config.axeConfig)
        .analyze();
      
      // Add URL to results
      results.url = route.path;
      
      // Generate report
      const htmlReport = generateHtmlReport(results, route.name);
      const reportPath = path.join(config.outputDir, `${formatDate()}_${route.name.toLowerCase()}.html`);
      fs.writeFileSync(reportPath, htmlReport);
      
      // Add to summary
      summaryResults.push({
        name: route.name,
        path: route.path,
        violations: results.violations.length,
        critical: results.violations.filter(v => v.impact === 'critical').length,
        serious: results.violations.filter(v => v.impact === 'serious').length,
        moderate: results.violations.filter(v => v.impact === 'moderate').length,
        minor: results.violations.filter(v => v.impact === 'minor').length,
      });
      
      await page.close();
    }
    
    // Generate summary report
    console.log('\nAudit Summary:');
    console.log('=============');
    
    let totalViolations = 0;
    let totalCritical = 0;
    let totalSerious = 0;
    let totalModerate = 0;
    let totalMinor = 0;
    
    summaryResults.forEach(result => {
      console.log(`${result.name} (${result.path}): ${result.violations} violations`);
      console.log(`  Critical: ${result.critical}, Serious: ${result.serious}, Moderate: ${result.moderate}, Minor: ${result.minor}`);
      
      totalViolations += result.violations;
      totalCritical += result.critical;
      totalSerious += result.serious;
      totalModerate += result.moderate;
      totalMinor += result.minor;
    });
    
    console.log('\nTotal:');
    console.log(`  Violations: ${totalViolations}`);
    console.log(`  Critical: ${totalCritical}, Serious: ${totalSerious}, Moderate: ${totalModerate}, Minor: ${totalMinor}`);
    
    console.log(`\nReports saved to ${config.outputDir}/`);
  } catch (error) {
    console.error('Error running accessibility audit:', error);
  } finally {
    await browser.close();
  }
};

// Run the audit
runAudit(); 