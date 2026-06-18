import React from "react";
import LegalShell from "./legal/LegalShell";

const Privacy: React.FC = () => (
  <LegalShell title="Privacy Policy" lastUpdated="July 2025">
    <h2>Information We Collect</h2>
    <p>
      BaziGPT only collects the minimum information necessary to provide your
      Chinese astrology reading:
    </p>
    <ul>
      <li>Birth date (required)</li>
      <li>Birth time (optional)</li>
    </ul>

    <h2>How We Use Your Information</h2>
    <p>Your birth information is used solely to:</p>
    <ul>
      <li>Generate your personalized BaZi reading</li>
      <li>Provide follow-up insights about specific life areas</li>
    </ul>

    <h2>Data Storage</h2>
    <p>
      We do not store any of your personal information. Your birth data is
      processed in real-time to generate your reading and is not saved to our
      servers.
    </p>

    <h2>Third-Party Services</h2>
    <p>
      We use OpenAI's API to generate readings. Your birth information is sent to
      OpenAI for processing but is not stored by them.
    </p>

    <h2>Analytics</h2>
    <p>
      We use Vercel Analytics to understand how our service is used. This data is
      anonymous and does not include personal information.
    </p>

    <h2>Contact</h2>
    <p>
      If you have questions about this privacy policy, please contact me on
      Telegram at{" "}
      <a
        href="https://t.me/ZeroXBarnum"
        target="_blank"
        rel="noopener noreferrer"
      >
        @ZeroXBarnum
      </a>
      .
    </p>
  </LegalShell>
);

export default Privacy;
