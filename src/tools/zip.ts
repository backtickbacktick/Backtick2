import { tar } from 'zip-a-folder';
import * as fs from 'fs';

(async () => {
    const { version } = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

    await tar('extension', 'backtick-' + version + '.tgz');
})();
