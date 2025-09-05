import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";

    export const metadata = {
      title: "Sentiment analizer",
      description: "Sentiment analizer of CSV file.",
    };

    export default function RootLayout({ children }) {
      return (
        <html lang="pt-br" data-bs-theme="dark">
          <body>
            {children}
          </body>
        </html>
      );
    }