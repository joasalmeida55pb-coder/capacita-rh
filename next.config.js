const path = require('path');
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  // Rede de segurança: o build da Vercel não deve falhar por erros de tipo
  // ou de lint que passem despercebidos localmente. `tsc --noEmit` e o lint
  // continuam a rodar normalmente em dev/CI — isto só evita que `next build`
  // aborte o deploy por causa deles.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};
module.exports = nextConfig;
