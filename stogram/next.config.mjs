/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer, webpack }) => {
      if (!isServer) {
        // Custom plugin to handle node: protocol
        config.plugins.push(
          new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
            const mod = resource.request.replace(/^node:/, '');
            
            switch (mod) {
              case 'crypto':
                resource.request = 'crypto-browserify';
                break;
              case 'stream':
                resource.request = 'stream-browserify';
                break;
              case 'util':
                resource.request = 'util/';
                break;
              case 'buffer':
                resource.request = 'buffer/';
                break;
              case 'process':
                resource.request = 'process/browser';
                break;
              default:
                // For any other node: imports, try to resolve them
                resource.request = mod;
            }
          })
        );
  
        // Provide proper polyfills for browser
        config.resolve.fallback = {
          ...config.resolve.fallback,
          crypto: false,
          stream: false,
          util: false,
          buffer: false,
          process: false,
          fs: false,
          net: false,
          tls: false,
          child_process: false,
          url: false,
          zlib: false,
          http: false,
          https: false,
          assert: false,
          os: false,
          path: false,
          module: false,
          perf_hooks: false,
          worker_threads: false,
        };
        
        // Provide global variables
        config.plugins.push(
          new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
          })
        );
  
        // Ignore problematic modules
        config.plugins.push(
          new webpack.IgnorePlugin({
            resourceRegExp: /^(child_process|fs|net|tls|perf_hooks|worker_threads)$/,
          })
        );
      }
      return config;
    },
    // Transpile the 0G SDKs
    transpilePackages: ['@0glabs/0g-ts-sdk', '@0glabs/0g-serving-broker'],
  };
  
  export default nextConfig;