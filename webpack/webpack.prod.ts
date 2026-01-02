import { EnvironmentPlugin } from 'webpack';

import { projectRoot } from './helpers';
import { commonExports } from './webpack.common';

module.exports = Object.assign({}, commonExports, {
  plugins: [
    ...commonExports.plugins,
    new EnvironmentPlugin({
      'process.env': {
        NODE_ENV: 'production',
        AOT: true,
      },
    }),
  ],
  mode: 'production',
  recordsOutputPath: projectRoot('webpack.records.json'),
  entry: projectRoot('./server.ts'),
  target: 'node',
  externals: {
    'chokidar': 'commonjs2 chokidar',
    'fsevents': 'commonjs2 fsevents',
    'js-yaml': 'commonjs2 js-yaml',
  },
});
