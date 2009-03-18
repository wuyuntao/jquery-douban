var NOTE_URL = API_HOST + '/note',
    GET_NOTE_URL = NOTE_URL + '/{ID}',
    ADD_NOTE_URL = API_HOST + '/notes',

    BOOK_URL = API_HOST + '/book/subject',
    GET_BOOK_URL = BOOK_URL + '/{ID}',
    GET_BOOK_BY_ISBN_URL = BOOK_URL + '/isbn/{ID}',
    SEARCH_BOOK_URL = BOOK_URL + 's',

    MOVIE_URL = API_HOST + '/movie/subject',
    GET_MOVIE_URL = MOVIE_URL + '/{ID}',
    SEARCH_MOVIE_URL = MOVIE_URL + 's',

    MUSIC_URL = API_HOST + '/music/subject',
    GET_MUSIC_URL = MUSIC_URL + '/{ID}',
    SEARCH_MUSIC_URL = MUSIC_URL + 's',

    REVIEW_URL = API_HOST + '/review',
    GET_REVIEW_URL = REVIEW_URL + '/{ID}',
    ADD_REVIEW_URL = REVIEW_URL + 's',

    COLLECTION_URL = API_HOST + '/collection',
    GET_COLLECTION_URL = COLLECTION_URL + '/{ID}',
    ADD_COLLECTION_URL = COLLECTION_URL,

    MINIBLOG_URL = API_HOST + '/miniblog',
    GET_MINIBLOG_URL = MINIBLOG_URL + '/{ID}',
    ADD_MINIBLOG_URL = MINIBLOG_URL + '/saying',

    RECOMMENDATION_URL = API_HOST + '/recommendation',
    GET_RECOMMENDATION_URL = RECOMMENDATION_URL + '/{ID}',
    ADD_RECOMMENDATION_URL = RECOMMENDATION_URL + 's',

    EVENT_URL = API_HOST + '/event',
    GET_EVENT_URL = EVENT_URL + '/{ID}',
    ADD_EVENT_URL = EVENT_URL + 's',
    GET_EVENT_FOR_CITY_URL = EVENT_URL + '/location/{ID}';
