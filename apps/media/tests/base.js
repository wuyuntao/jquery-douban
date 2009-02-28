function createService(type) {
    type = type || 'jquery';

    if (type == 'gears') {
        gearsHandler.proxyUrl = location.protocol + '//' + location.host + '/proxy?url=',
        gearsHandler.workerUrl = location.protocol + '//' + location.host + '/media/scripts/worker.js',
        $.douban.http.register('gears', gearsHandler);
    }

    var service = $.douban('service', {
        key: '0107c5c3c9d4ecc40317514b5d7ec64c',
        secret: '7feaf4ec7b6989f8',
        type: type
    });

    service.login({
        key: 'c002c5818edc6c1340085084ac954439',
        secret: '4687aa78ddedf5f6'
    });
    return service;
}
