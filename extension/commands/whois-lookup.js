/**
 * @name Whois Lookup
 * @description Open a whois lookup for the current domain
 * @shortcut who
 * @autorun shortcut
 */
(() => {
    window.open('https://whois.domaintools.com/' + location.host);
})();