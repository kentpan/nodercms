/*eslint-disable*/
var port = require('./lib/port.lib.js')();
module.exports = {
    apps: [{
        name: 'yoozcms',
        script: 'app.js',
        cwd: './',
        watch: [
            '.'
        ],
        ignore_watch: [
            'node_modules',
            'log',
            'dist',
            'output'
        ],
        exec_interpreter: 'node',
        env: {
            // NODE_ENV: 'dev',
            // YOG_ENV: 'dev',
            // YOG_DEBUG: true,
            PORT: port
            // ORIGIN_ADDR: ''
        },
        out_file: './log/out.log',
        error_file: './log/err.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm Z',
    }
    ]
};
