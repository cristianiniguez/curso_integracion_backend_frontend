import express from 'express';
import dotenv from 'dotenv';
import webpack from 'webpack';
import helmet from 'helmet';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { renderRoutes } from 'react-router-config';
import { StaticRouter } from 'react-router-dom';

import cookieParser from 'cookie-parser';
import boom from '@hapi/boom';
import passport from 'passport';
import axios from 'axios';

import serverRoutes from '../frontend/routes/serverRoutes';
import reducer from '../frontend/reducers';
import initialState from '../frontend/initialState';
import getManifest from './getManifest';

dotenv.config();

const { ENV, PORT } = process.env;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

// Basic Strategy
require('./utils/auth/strategies/basic');

if (ENV === 'development') {
  console.log('Development config');
  const webpackConfig = require('../../webpack.config'); // eslint-disable-line
  const webpacDevMiddleware = require('webpack-dev-middleware'); // eslint-disable-line
  const webpacHotMiddleware = require('webpack-hot-middleware'); // eslint-disable-line
  const compiler = webpack(webpackConfig);
  const serverConfig = {
    port: PORT,
    hot: true,
  };
  app.use(webpacDevMiddleware(compiler, serverConfig));
  app.use(webpacHotMiddleware(compiler));
} else {
  app.use((req, res, next) => {
    if (!req.hashManifest) {
      req.hashManifest = getManifest();
      next();
    }
  });
  app.use(express.static(`${__dirname}/public`));
  app.use(helmet());
  app.use(helmet.permittedCrossDomainPolicies());
  app.disable('x-powered-by');
}

const setResponse = (html, preloadedState, manifest) => {
  const mainStyles = manifest ? manifest['main.css'] : 'assets/app.css';
  const mainBuild = manifest ? manifest['main.js'] : 'assets/app.js';
  const vendorBuild = manifest ? manifest['vendors.js'] : 'assets/vendor.js';
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="${mainStyles}" type="text/css">
        <title>Platzi Videos</title>
      </head>
      <body>
        <div id="app">${html}</div>
        <script>
          window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g, '\\u003c')}
        </script>
        <script src="${vendorBuild}" type="text/javascript"></script>
        <script src="${mainBuild}" type="text/javascript"></script>
      </body>
    </html>
  `;
};

const renderApp = (req, res) => {
  const store = createStore(reducer, initialState);
  const preloadedState = store.getState();
  const html = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.url} context={{}}>
        {renderRoutes(serverRoutes)}
      </StaticRouter>
    </Provider>,
  );
  res.set(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' http://dummyimage.com https://gravatar.com; script-src 'self' 'sha256-n1jHrI2lN4ngk5Sy5hSo1W6k3uUvYHNkOoNvPbtTTo8=' 'unsafe-eval'; style-src-elem 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; media-src 'self' https://mdstrm.com",
  );
  res.send(setResponse(html, preloadedState, req.hashManifest));
};

app.post('/auth/sign-in', async (req, res, next) => {
  const { rememberMe } = req.body;
  passport.authenticate('basic', (error, data) => {
    try {
      if (error || !data) {
        next(boom.unauthorized());
      }
      req.login(data, { session: false }, async (error) => {
        if (error) {
          next(error);
        }
        const { token, ...user } = data;
        res.cookie('token', token, {
          httpOnly: !config.dev,
          secure: !config.dev,
          maxAge: rememberMe ? THIRTY_DAYS_IN_MSEC : TWO_HOURS_IN_MSEC,
        });
        res.status(200).json(user);
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
});

app.post('/auth/sign-up', async (req, res, next) => {
  const { body: user } = req;
  try {
    const userData = await axios({
      url: `${process.env.API_URL}/api/auth/sign-up`,
      method: 'post',
      data: {
        email: user.email,
        name: user.name,
        password: user.password,
      },
    });
    res.status(201).json({
      name: req.body.name,
      email: req.body.email,
      id: userData.data.id,
    });
  } catch (error) {
    next(error);
  }
});

app.get('*', renderApp);

app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server running on port ${PORT}`);
  }
});
