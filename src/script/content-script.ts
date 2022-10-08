import { loadConsole } from './utils/actions';
import backtickListener from './utils/backtickListener';

(function () {
    backtickListener(loadConsole);
})();
