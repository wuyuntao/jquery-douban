function createService() {
    var service = Douban({
        key: '0107c5c3c9d4ecc40317514b5d7ec64c',
        secret: '7feaf4ec7b6989f8',
        type: Douban.handler.jquery
    });

    service.login({
        key: '2e2fa5e45bee84308a8ef1ad13cb8c90',
        secret: 'fe5e5256ee3128a1'
    });
    return service;
}
