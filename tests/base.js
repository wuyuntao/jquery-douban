function createService() {
    var service = $.douban('service', {
        key: '0107c5c3c9d4ecc40317514b5d7ec64c',
        secret: '7feaf4ec7b6989f8',
        type: 'jquery'
    });
    service.login({
        key: '242968ea69f7cbc46c7c3abf3de7634c',
        secret: '9858f453d21ab6e0'
    });
    return service;
}
