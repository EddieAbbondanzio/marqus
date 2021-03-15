// vue.config.js

module.exports = {
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                target: 'electron-renderer'
            },

            chainWebpackMainProcess: (config) => {
                // Chain webpack config for electron main process only
            },
            chainWebpackRendererProcess: (config) => {
                config.target = 'node';
                // Chain webpack config for electron renderer process only (won't be applied to web builds)
            }
        }
    }
};
