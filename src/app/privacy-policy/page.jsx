import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-5">
      <div className="card text-bg-dark">
        <div className="card-body p-5">
          <h1 className="card-title">Política de Privacidade</h1>
          <p className="lead mt-4">Nós levamos sua privacidade a sério.</p>
          <p>Este aplicativo foi desenvolvido para fins de demonstração e aprendizado.</p>
          <ul>
            <li><strong>Nós não armazenamos seus arquivos CSV.</strong> O arquivo é processado em tempo real e descartado imediatamente após a análise.</li>
            <li>Os dados da coluna 'message' são enviados para a API da Hugging Face para realizar a análise de sentimento.</li>
            <li>A Hugging Face processa estes dados para fornecer o resultado e não os retém para outros fins, de acordo com sua política.</li>
            <li>Nenhum dado pessoal, como 'username' ou o conteúdo das mensagens, é salvo em nossos servidores.</li>
          </ul>
          <Link href="/" className="btn btn-primary mt-4">
            Voltar para a Home
          </Link>
        </div>
      </div>
    </div>
  );
}