import serverBundle from '../dist/api/index.cjs';

// Если бандл экспортирует объект с полем default или app, берем его,
// иначе берем сам бандл как функцию
const app = serverBundle.default || serverBundle.app || serverBundle;

export default app;