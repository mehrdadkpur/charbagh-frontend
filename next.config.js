/** @type {import('next').NextConfig} */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const config = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'localhost',
            pathname: '/uploads/**',
          }
        ],
      },
      experimental: {
        serverActions: {
          bodySizeLimit: '20mb',
        },
      },
}

export default config

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'http',
//         hostname: 'localhost',
//         port: '5000',
//         pathname: '/uploads/**',
//       },
//     ],
//   },

//   experimental: {
//     serverActions: {
//       bodySizeLimit: '20mb',
//     },
//   },
// };

// export default nextConfig;


  