import React from "react";
import LegalShell from "./legal/LegalShell";

const Terms: React.FC = () => (
  <LegalShell title="Terms of Service" lastUpdated="July 2025">
    <h2>Acceptance of Terms</h2>
    <p>By using BaziGPT, you agree to these terms of service.</p>

    <h2>Service Description</h2>
    <p>
      BaziGPT provides AI-powered Chinese astrology readings based on your birth
      date and time. This service is for entertainment purposes only.
    </p>

    <h2>Disclaimer</h2>
    <p>
      <strong>Important:</strong> The readings provided by BaziGPT are for
      entertainment purposes only. They should not be considered as professional
      advice, medical guidance, or factual predictions. Do not make important
      life decisions based solely on these readings.
    </p>

    <h2>User Responsibilities</h2>
    <ul>
      <li>Provide accurate birth information</li>
      <li>Use the service responsibly</li>
      <li>Not rely on readings for critical decisions</li>
      <li>Respect the entertainment nature of the service</li>
    </ul>

    <h2>Limitation of Liability</h2>
    <p>
      BaziGPT is provided "as is" without any warranties. We are not liable for
      any decisions made based on the readings provided.
    </p>

    <h2>Intellectual Property</h2>
    <p>
      The BaziGPT service and its content are protected by copyright and other
      intellectual property laws.
    </p>

    <h2>Changes to Terms</h2>
    <p>
      We may update these terms from time to time. Continued use of the service
      constitutes acceptance of any changes.
    </p>

    <h2>Contact</h2>
    <p>
      For questions about these terms, contact me on Telegram at{" "}
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

export default Terms;
