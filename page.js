// app/[image]/page.js

import Head from 'next/head';
import { useRouter } from 'next/router';

export default function ImagePage() {
  const router = useRouter();
  const { image } = router.query;

  const imageUrl = `https://i.imgur.com/${image}.png`; // Adaptez cette ligne selon votre format d'URL

  return (
    <>
      <Head>
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@your_twitter_handle" />
        <meta name="twitter:title" content="Discover My NFT Mini-Game" />
        <meta name="twitter:description" content="Check out this cool NFT I discovered!" />
        <meta name="twitter:image" content={imageUrl} />
        <title>NFT Mini-Game</title>
      </Head>
      <h1>Discover My NFT Mini-Game</h1>
      <img src={imageUrl} alt="NFT Image" />
    </>
  );
}
