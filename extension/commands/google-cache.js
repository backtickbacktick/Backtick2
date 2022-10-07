/**
 * @name Google Cache 
 * @description View a cached version of the current page
 * @shortcut gc
 * @autorun shortcut
 */
(() => {
    window.open(
        'https://webcache.googleusercontent.com/search?q=cache:' + location.href
    );
})()
