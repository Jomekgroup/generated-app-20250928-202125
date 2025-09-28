import { Link } from "react-router-dom";
export function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50/50 dark:bg-black/50">
      <div className="container max-w-4xl mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="prose dark:prose-invert lg:prose-lg mx-auto">
          <h1>Privacy Policy</h1>
          <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>
          <h2>1. Introduction</h2>
          <p>
            Welcome to CleanConnect. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at privacy@cleanconnect.com.
          </p>
          <h2>2. Information We Collect</h2>
          <p>
            [Placeholder] This section will detail the types of personal information we collect from users, such as name, email, address (for service), and payment information. It will explain how and why this information is collected (e.g., during account registration, booking).
          </p>
          <h2>3. How We Use Your Information</h2>
          <p>
            [Placeholder] This section will describe the purposes for which we use the collected information, such as to facilitate account creation, process transactions, send administrative information, and connect clients with cleaners.
          </p>
          <h2>4. Will Your Information Be Shared?</h2>
          <p>
            [Placeholder] This section will explain the circumstances under which user information might be shared, for example, sharing a client's address with a booked cleaner. It will also state our policy on not selling data to third parties.
          </p>
          <h2>5. How We Keep Your Information Safe</h2>
          <p>
            [Placeholder] This section will outline the security measures we have in place to protect user data, such as encryption and secure servers.
          </p>
          <h2>6. Your Privacy Rights</h2>
          <p>
            [Placeholder] This section will inform users of their rights regarding their personal data, such as the right to access, update, or delete their information.
          </p>
          <h2>7. Contact Us</h2>
          <p>
            If you have questions or comments about this policy, you may email us at <strong>privacy@cleanconnect.com</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}