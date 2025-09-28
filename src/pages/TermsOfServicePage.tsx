import { Link } from "react-router-dom";
export function TermsOfServicePage() {
  return (
    <div className="bg-gray-50/50 dark:bg-black/50">
      <div className="container max-w-4xl mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="prose dark:prose-invert lg:prose-lg mx-auto">
          <h1>Terms of Service</h1>
          <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>
          <h2>1. Introduction</h2>
          <p>
            Welcome to CleanConnect ("Company", "we", "our", "us")! These Terms of Service ("Terms", "Terms of Service") govern your use of our web pages located at <Link to="/">cleanconnect.com</Link> (together or individually "Service") operated by CleanConnect.
          </p>
          <p>
            Our Privacy Policy also governs your use of our Service and explains how we collect, safeguard and disclose information that results from your use of our web pages. Please read it here <Link to="/privacy">/privacy</Link>.
          </p>
          <h2>2. Using Our Service</h2>
          <p>
            [Placeholder] This section will detail the acceptable use of the CleanConnect platform for both clients and cleaners. It will cover account creation, responsibilities, and prohibited activities.
          </p>
          <h2>3. Bookings and Payments</h2>
          <p>
            [Placeholder] This section will outline the terms related to booking services, payment processing, cancellations, and refunds. It will clarify the roles of CleanConnect, the client, and the cleaner in financial transactions.
          </p>
          <h2>4. Content</h2>
          <p>
            [Placeholder] This section will describe the rights and responsibilities regarding user-generated content, such as profiles, reviews, and messages.
          </p>
          <h2>5. Limitation of Liability</h2>
          <p>
            [Placeholder] This section will clarify the extent of CleanConnect's liability in disputes between clients and cleaners or other issues arising from the use of the service.
          </p>
          <h2>6. Changes to Service</h2>
          <p>
            We reserve the right to withdraw or amend our Service, and any service or material we provide via Service, in our sole discretion without notice.
          </p>
          <h2>7. Contact Us</h2>
          <p>
            Please send your feedback, comments, requests for technical support by email: <strong>support@cleanconnect.com</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}