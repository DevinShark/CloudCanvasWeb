import React from "react";

const PrivacyPolicy: React.FC = () => (
  <div className="max-w-3xl mx-auto py-12 px-4">
    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
    <p className="mb-4 text-gray-700">
      <strong>Cloud Canvas</strong> is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights as a user.
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-2">1. What Information We Collect</h2>
    <ul className="list-disc ml-6 mb-4 text-gray-700">
      <li><strong>Account Information:</strong> Name, email address, company, and password (securely hashed).</li>
      <li><strong>Usage Data:</strong> Information about how you use Cloud Canvas, such as feature usage and preferences.</li>
      <li><strong>Communication Preferences:</strong> Your choices for receiving newsletters, product updates, and promotions.</li>
      <li><strong>Support & Feedback:</strong> Any information you provide when contacting support or giving feedback.</li>
    </ul>

    <h2 className="text-xl font-semibold mt-8 mb-2">2. How We Use Your Information</h2>
    <ul className="list-disc ml-6 mb-4 text-gray-700">
      <li>To provide and improve our services.</li>
      <li>To personalize your experience and remember your preferences.</li>
      <li>To communicate important updates, product news, and (if you opt in) promotions.</li>
      <li>To respond to your support requests and feedback.</li>
      <li>To comply with legal obligations and protect Cloud Canvas and its users.</li>
    </ul>

    <h2 className="text-xl font-semibold mt-8 mb-2">3. How We Protect Your Data</h2>
    <ul className="list-disc ml-6 mb-4 text-gray-700">
      <li>We use industry-standard security practices to protect your data.</li>
      <li>Passwords are securely hashed and never stored in plain text.</li>
      <li>Access to your data is restricted to authorized personnel only.</li>
    </ul>

    <h2 className="text-xl font-semibold mt-8 mb-2">4. Your Rights & Choices</h2>
    <ul className="list-disc ml-6 mb-4 text-gray-700">
      <li>You can update your profile and communication preferences at any time in your account settings.</li>
      <li>You can request to download or delete your data by contacting us.</li>
      <li>You can opt out of marketing emails at any time.</li>
    </ul>

    <h2 className="text-xl font-semibold mt-8 mb-2">5. Data Sharing</h2>
    <ul className="list-disc ml-6 mb-4 text-gray-700">
      <li>We do <strong>not</strong> sell your personal data.</li>
      <li>We only share data with trusted service providers as needed to operate Cloud Canvas (e.g., email delivery, payment processing).</li>
      <li>We may share data if required by law or to protect our users and services.</li>
    </ul>

    <h2 className="text-xl font-semibold mt-8 mb-2">6. Contact Us</h2>
    <p className="mb-4 text-gray-700">
      If you have any questions or concerns about your privacy, please contact us at:
      <br />
      <a href="mailto:dms@live.co.za" className="text-primary underline">dms@live.co.za</a>
    </p>

    <p className="text-xs text-gray-500 mt-8">
      This policy may be updated from time to time. We will notify you of any significant changes.
    </p>
  </div>
);

export default PrivacyPolicy; 