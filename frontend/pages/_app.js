import '../styles/globals.css';
import Layout from '../components/Layout';
import { LanguageProvider } from '../context/LanguageContext';

export default function MyApp({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </LanguageProvider>
  );
}
