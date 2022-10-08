# Backtick2

**Backtick2 is a command line for bookmarklets and scripts**, as an *unpacked* Chrome extension. Chrome no longer allows the running of scripts not included in an extension so this *unpacked* extension makes adding and running custom scripts easy.
<br>

---
<br>

## Installation
To load the extension, [unzip the file](https://github.com/backtickbacktick/backtick2/raw/main/backtick-chrome-extension.tgz) and [follow these instructions](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked).

Add commands to the commands folder. Existing commands these can be deleted.

Commands are simply self executing functions with JSDoc. 
The JSDoc tells the extension when and how to run the script.

Commands may be searched for in the console, selected, and run. 
Commands may also automatically run when the console is loaded under certain conditions.
<br>

---
<br>

## Command Examples
<br>

### Shortcut with Autorun

As soon as a user types `'gc'` in the console this script executes. Effectively 3 keys <code>&#96;gc</code> launches a new window with a cached version of the current page. Please be aware that `shortcut` combined with `autorun` can be very helpful but a shortcut may block other scripts from being searched. For example a shortcut like `'gc'` is probably ok because no english word starts the `'gc'`. On the other hand a shortcut like `'s'` with `autorun` will prevent the user from finding any other script when 's' is typed in first in the console.

```javascript
/**
 | name Google Cache 
 | description View a cached version of the current page
 | shortcut gc
 */
(() => {
    window.open(
        'https://webcache.googleusercontent.com/search?q=cache:' + location.href
    );
})()
```

### Shortcut without Autorun

Without `autorun` you can have shortcuts make use of other text in the console.

```javascript
/**
 * @name Google Search 
 * @description Google searches anything after 's '
 * @shortcut s
 */
(() => {
    window.open(
       `https://www.google.com/search?q=`+ (document.querySelector('#backtick-container input').value + '').substring(2)
    );
})()
```

### URL with Autorun

With a `url` and `autorun` you can have commands execute immediately when a url matches the parameter and the user opens the console. 

**Hot tip:** Setting the `close` param to `true` with these other params effectively prevents other backtick scripts from running.

```javascript
/**
 * @name Autorun Welcome for iambrian.com
 * @description Auto executes when url matches
 * @hidden true
 * @autorun url
 * @url https*://iambrian.com/*
 * @close true
 * 
 */
(() => {
    alert(`

    Hello, welcome to my website!
    
    `);
})()
```
<br>

---
<br>

### JSDoc Params

<br>

| Parameter   | Type        | Default |  Description |
| ----------- | ----------- | ----------- |----------- |
| name | `string` | <span style="color: OrangeRed">required<span>  | Name (searchable)
| description | `string`|  <span style="color: OrangeRed">required<span>   | Description (searchable)
| shortcut | `string` | `null` | when typed in the console run script if auto run is set to 'shortcut' or when user hits enter
| hidden | `boolean` | `false` | hide from search results 
| autorun | `'url' \| 'shortcut' \| false` | `false` | auto run the script when the url matches the tabs location or shortcut matches the console input 
| url | `string` | `null` | Regex value to match current URL to
| close | `boolean` | `false` | Close console when script is run

<br>
<br>

Made with ❤️*

*[MIT Licensed](http://opensource.org/licenses/MIT) 2022 Brian Reed 
