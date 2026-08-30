import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="FashionHub - Explore our exclusive archives of premium outerwear, silk dress shirts, cashmere knitwear, and custom styled collections." />
        <meta name="keywords" content="luxury fashion, cashmere hoodie, wool overcoat, silk shirt, tailored pants" />
        <meta property="og:title" content="FashionHub - Premium E-Commerce Wardrobe" />
        <meta property="og:description" content="Exclusive collection of curated garments featuring personalized AI styling consultations." />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
