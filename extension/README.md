# Backtick2

**Backtick2 is a command line for bookmarklets and scripts**, as an *unpackaged* Chrome extension. Chrome no longer allows the running of scripts not included in an extension. This extension makes running custom scripts easy as an *unpackaged*.

To load the extension, [follow these instructions](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked).

Add commands to the commands folder. Existing commands these can be deleted.

Commands are simply self executing functions with JSDoc. 
The JSDoc tells the extension when and how to run the script.

Commands may be searched for in the console, selected, and run. 
Commands may also automatically run when the console is loaded under certain conditions.

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

### JSDoc Params




| parameter   | type        | default |  |
| ----------- | ----------- | ----------- |----------- |
| name | `string` | <span style="color: OrangeRed">required<span>  | Name (searchable)
| description | `string`|  <span style="color: OrangeRed">required<span>   | Description (searchable)
| shortcut | `string` | `null` | when typed in the console run script if auto run is set to 'shortcut' or when user hits enter
| hidden | `boolean` | `false` | hide from search results 
| autorun | `'url' \| 'shortcut' \| false` | `false` | auto run the script when the url matches the tabs location or shortcut matches the console input 
| url | `string` | `null` | Regex value to match current URL to
| close | `boolean` | `false` | Close console when script is run

\* Required fields



*[MIT Licensed](http://opensource.org/licenses/MIT) 2022 Brian Reed*
