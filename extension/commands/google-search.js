/**
 * @name Google Search 
 * @description Google searches anything after 's '
 * @shortcut s
 */
(() => {
    window.open(
       `https://www.google.com/search?q=`+ (document.querySelector('#_bt-container input').value + '').substring(2)
    );
})()
