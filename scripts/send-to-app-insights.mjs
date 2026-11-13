// Sends the stripe's result to Application Insights as one TestRun event.
// Usage: node scripts/send-to-app-insights.mjs [summary file]
// Needs APPINSIGHTS_CONNECTION_STRING. Without it the script does nothing, so a stripe can opt in later.
import { readFileSync } from 'node:fs';

const connection = process.env.APPINSIGHTS_CONNECTION_STRING ?? '';
const parts = Object.fromEntries(
  connection.split(';').filter(Boolean).map((p) => [p.slice(0, p.indexOf('=')).trim(), p.slice(p.indexOf('=') + 1).trim()]),
);
const ikey = parts.InstrumentationKey;
if (!ikey) {
  console.log('No Application Insights connection string set, skipping.');
  process.exit(0);
}
const endpoint = (parts.IngestionEndpoint ?? 'https://dc.services.visualstudio.com').replace(/\/+$/, '');

const summary = JSON.parse(readFileSync(process.argv[2] ?? 'summary/summary.json', 'utf8'));
const level = (name) => summary.levels?.[name] ?? { total: 0, failed: 0 };

const events = [{
  name: 'Microsoft.ApplicationInsights.Event',
  time: summary.runDate,
  iKey: ikey,
  tags: { 'ai.cloud.role': summary.folder },
  data: {
    baseType: 'EventData',
    baseData: {
      ver: 2,
      name: 'TestRun',
      properties: {
        project: summary.project, folder: summary.folder, repo: summary.repo, branch: summary.branch,
        commit: summary.commit, actor: summary.actor, runUrl: summary.runUrl, jobStatus: summary.jobStatus,
      },
      measurements: {
        dotnetTotal: level('dotnet').total, dotnetFailed: level('dotnet').failed,
        angularTotal: level('angular').total, angularFailed: level('angular').failed,
        brunoTotal: level('bruno').total, brunoFailed: level('bruno').failed,
        playwrightTotal: level('playwright').total, playwrightFailed: level('playwright').failed,
      },
    },
  },
}];

const response = await fetch(`${endpoint}/v2/track`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(events),
});
const body = await response.json().catch(() => ({}));
if (!response.ok || body.itemsAccepted !== 1) {
  console.error(`Application Insights rejected the event: ${response.status} ${JSON.stringify(body)}`);
  // The workflow marks this step as allowed to fail, so show a warning on the run instead of a red stripe.
  console.log(`::warning title=Application Insights::The result was not sent (status ${response.status}). Check the resource and its workspace.`);
  process.exit(1);
}
console.log(`Sent the TestRun event for ${summary.folder}`);
