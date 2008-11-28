// Main entry
$(function() {
    if (!window.google || !google.gears) return;

    // Initialize UI
    $('#warning').hide();
    $('#username').attr('disabled', false);
    $('#submit').attr('disabled', false);
    $('#show_code').click(function() {
        $('#code').toggle();
        return false;
    });

    // Initialize douban service
    $.douban.http.register('gears', gearsHandler);
    var service = $.douban('service', {
        key: '0107c5c3c9d4ecc40317514b5d7ec64c',
        secret: '7feaf4ec7b6989f8',
        type: 'gears'
    });

    // Handler submissions
    $('#get_username_form').submit(function() {
        var username = $('#username').val();
        if (!username.length) return false;

        // Get the first ten book collections for user
        service.collection.getForUser(username, 0, 10, function(books) {

            // If returns any result, display them
            if (books.total && books.total > 0) {
                $('#result tbody').empty();

                // Insert each book into result area
                $.each(books.entries, function() {
                    insertBook(this.subject);
                });
            } else {
                alert('这个用户不存在或这个用户未收藏任何书目');
            }

            // Hide loading
            $('#loading').hide();
        }, 'book');

        // Show Loading
        $('#loading').show();
        return false;
    });
});

function insertBook(book) {
    var result = $('#result tbody');
    var tmpl = '<tr id="{ID}" class="book"><td class="cover"><img src="{IMAGE_URL}" /></td><td class="info"><span class="title"><a href="{URL}">{TITLE}</a></span><br /><span class="author">作者：{AUTHORS}</span></td></tr>';
    var html = tmpl.replace(/\{ID\}/, book.id.match(/(\d+)/)[1])
                   .replace(/\{IMAGE_URL\}/, book.imageUrl)
                   .replace(/\{URL\}/, book.url)
                   .replace(/\{TITLE\}/, book.title)
                   .replace(/\{AUTHORS\}/, book.authors.join('、'));
    $(html).appendTo(result);
}
