import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";

    export const metadata = {
      title: "Analisador de Sentimento",
      description: "Análise de sentimentos de arquivos CSV.",
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