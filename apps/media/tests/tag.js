module("Douban Tag Testcases");

test("test tag api", function() {
    expect(6);

    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    /* get for subject
     */
    tags = service.tag.getForSubject('http://api.douban.com/movie/subject/3158990', 5, 3);
    equals(tags.entries.length, 3);
    equals(tags.limit, 3);
    ok(tags.entries[0].id.match(/\/movie\/tag\/\w+$/), "okay: " + tags.entries[0].id);
    ok(tags.entries[0].name.length > 0, 'okay: ' + tags.entries[0].name);
    ok(tags.entries[0].count >= 684, "okay: " + tags.entries[0].count);

    /* get for user
     */
    tags2 = service.tag.getForUser('wyt', 2, 1, null, 'book');
    equals(tags2.entries.length, 1);
});

// vim: foldmethod=indent
