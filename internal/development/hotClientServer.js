import Koa from 'koa';
import koaWebpack from 'koa-webpack';
import ListenerManager from './listenerManager';
import config from '../../config';
import { log } from '../utils';

class HotClientServer {
  constructor(compiler) {
    const app = new Koa();

    const httpPathRegex = /^https?:\/\/(.*):([\d]{1,5})/i;
    const httpPath = compiler.options.output.publicPath;
    if (!httpPath.startsWith('http') && !httpPathRegex.test(httpPath)) {
      throw new Error(
        'You must supply an absolute public path to a development build of a web target bundle as it will be hosted on a seperate development server to any node target bundles.',
      );
    }

    // eslint-disable-next-line no-unused-vars
    const [_, host, port] = httpPathRegex.exec(httpPath);

    this.webpackKoaMiddleware = koaWebpack({
      compiler,
      hot: {
        hot: true,
        port: config('clientDevServerPort'),
      },
      dev: {
        hot: true,
        quiet: true,
        noInfo: true,
        headers: {
          'Access-Control-Allow-Origin': `http://${config('host')}:${config('port')}`,
        },
        // Ensure that the public path is taken from the compiler webpack config
        // as it will have been created as an absolute path to avoid conflicts
        // with an node servers.
        publicPath: compiler.options.output.publicPath,
      },
    });

    app.use(this.webpackKoaMiddleware);

    const listener = app.listen(port);

    this.listenerManager = new ListenerManager(listener, 'client');

    compiler.plugin('compile', () => {
      log({
        title: 'client',
        level: 'info',
        message: 'Building new bundle...',
      });
    });

    compiler.plugin('done', (stats) => {
      if (stats.hasErrors()) {
        log({
          title: 'client',
          level: 'error',
          message: 'Build failed, please check the console for more information.',
          notify: true,
        });
        console.error(stats.toString());
      } else {
        log({
          title: 'client',
          level: 'info',
          message: 'Running with latest changes.',
          notify: true,
        });
      }
    });
  }

  dispose() {
    this.webpackDevMiddleware.close();

    return this.listenerManager ? this.listenerManager.dispose() : Promise.resolve();
  }
}

export default HotClientServer;
