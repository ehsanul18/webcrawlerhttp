const { JSDOM } = require('jsdom')

async function crawlPage(currentURL) {
    console.log(`actively crawling: ${currentURL}`)

    try {
        // base fetch makes GET requests
        const resp = await fetch(currentURL)

        if (resp.status > 399) {
            console.log(`error in fetch with status code : ${resp.status} on page: ${currentURL}`)
            return
        }

        const contentType = resp.headers.get("content-type")
        if (!contentType.includes("text/html")) {
            console.log(`non html response, content type : ${contentType} on page: ${currentURL}`)
            return            
        }
        
        // .text() method returns a Promise so await added
        console.log(await resp.text())
    } catch (err) {
        console.log(`error in fetch: ${err.message}, on page: ${currentURL}`)
    }

}

function getURLsFromHTML(htmlBody, baseURL) {
    const urls = []
    const dom = new JSDOM(htmlBody)
    const linkElements = dom.window.document.querySelectorAll('a')
    for (const linkElement of linkElements){
        if (linkElement.href.slice(0,1) === '/'){
            try {
                urls.push(new URL(linkElement.href, baseURL).href)
            } catch (err){
                console.log(`Error with relative url - ${err.message}: ${linkElement.href}`)
            }
        } else {
            try {
                urls.push(new URL(linkElement.href).href)
            } catch (err){
                console.log(`Error with absolute url -${err.message}: ${linkElement.href}`)
            }
        }
    }
    return urls
}

function normalizeURL(urlString) {
    const urlObj = new URL(urlString)
    const hostPath = `${urlObj.hostname}${urlObj.pathname}`
    return hostPath.length > 0 && hostPath.slice(-1) === '/' ? hostPath.slice(0, -1) : hostPath
}

module.exports = {
    normalizeURL, getURLsFromHTML, crawlPage
}