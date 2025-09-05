import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    
    <div className="container py-5">
      <div className="card text-bg-dark">
        <div className="card-body p-5">
          <h1 className="card-title">Privacy Policy</h1>
          <p className="lead mt-4">We take your privacy seriously.</p>
          <p>This application was developed for demonstration and learning purposes.</p>
          <ul>
            <li><strong>We do not store your CSV files.</strong> The file is processed in real-time and discarded immediately after the analysis.</li>
            <li>The data from the 'message' column is sent to the Hugging Face API to perform the sentiment analysis.</li>
            <li>Hugging Face processes this data to provide the result and does not retain it for other purposes, according to its policy.</li>
            <li>No personal data, such as 'username' or the content of the messages, is saved on our servers.</li>
          </ul>
          <Link href="/" className="btn btn-primary mt-4">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}