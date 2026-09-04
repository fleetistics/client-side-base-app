/**
 * @format
 */

// Must be the first import: patches global.crypto.getRandomValues so code shared
// with the web (e.g. traceContext.ts) can call the standard Web Crypto API unchanged.
import 'react-native-get-random-values';
import './global.css';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
