/**
 * Creates a new HTML element from the template with the given id.  
 * The template must contain at least one HTML element.
 * @param {string} templateId 
 * @returns {HTMLElement}
 */
function createFromTemplate(templateId) {
    /** @type {HTMLTemplateElement} */
    const template = document.getElementById(templateId)

    const clone = template.content.cloneNode(true)

    for (const node of clone.childNodes)
        if (node instanceof HTMLElement)
            return node

    throw new Error("Template must contain at least one HTML element")
}

/**
 * @typedef {{
 * readonly element:HTMLElement,
 * with(selector:string, elementCallback:(element:HTMLElement) => void):TemplateBuilder;
 * withText(selector:string, text:string):TemplateBuilder;
 * withAttribute(selector:string, attribute:string, value:string):TemplateBuilder;
 * withHandler(selector:string, event:string, handler:EventListener):TemplateBuilder;
 * }} TemplateBuilder
 */

/**
 * Build a HTML element from a template.
 * @param {string} templateId ID of template element
 * @param {(builder: TemplateBuilder) => void} builderCallback Build the template
 * @returns {HTMLElement}
 */
export function buildFromTemplate(templateId, builderCallback) {
    
    const element = createFromTemplate(templateId)

    /** @type {TemplateBuilder} */
    const builder = {

        element,
        
        with(selector, elementCallback) {
            const target = selector ? element.querySelector(selector) : element
            if (target) elementCallback(target)
            return builder
        },

        withText(selector, text) {
            return this.with(selector, element => element.innerText = text)
        },

        withAttribute(selector, attribute, value) {
            return this.with(selector, element => element.setAttribute(attribute, value))
        },

        withHandler(selector, event, handler) {
            return this.with(selector, element => element.addEventListener(event, handler))
        }

    }

    builderCallback?.(builder)

    return element
}

/**
 * Formats `date` relative to now.
 * @param {Date} date Date to format
 */
export function formatRelativeDate(date) {
    const ONE_MINUTE = 60 * 1000
    const ONE_HOUR = 60 * ONE_MINUTE
    const ONE_DAY = 24 * ONE_HOUR
    const ONE_WEEK = 7 * ONE_DAY
    const ONE_MONTH = 30 * ONE_DAY

    const now = Date.now()
    const deltaTime = Math.abs(date.getTime() - now)
    const future = date.getTime() > now

    const relativePrefix = future ? "in " : ""
    const relativeSuffix = future ? "" : " ago"

    if (deltaTime < ONE_MINUTE) return "just now";
    if (deltaTime < ONE_HOUR) return relativePrefix + formatTimeDiff(deltaTime, ONE_MINUTE, "minute") + relativeSuffix
    if (deltaTime < ONE_DAY) return relativePrefix + formatTimeDiff(deltaTime, ONE_HOUR, "hour") + relativeSuffix
    if (deltaTime < ONE_WEEK) return relativePrefix + formatTimeDiff(deltaTime, ONE_DAY, "day") + relativeSuffix
    if (deltaTime < ONE_MONTH) return relativePrefix + formatTimeDiff(deltaTime, ONE_WEEK, "week") + relativeSuffix
    return "at " + date.toLocaleString();
}

function formatTimeDiff(deltaTime, unitSize, unitName) {
    const value = Math.floor(deltaTime / unitSize)
    if (value == 1) return value + " " + unitName
    return value + " " + unitName + "s"
}