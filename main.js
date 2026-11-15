const { crawlPage } = require('./crawl.js')

function main() {
    // command line input
    // 1st arg name of the program, 2nd arg entrypoint, 3rd website we provide
    if (process.argv.length < 3) {
        console.log("no website provided")
        process.exit(1)
    }
    if (process.argv.length > 3) {
        console.log("too many command line args")
        process.exit(1)
    }
    const baseURL = process.argv[2]

    console.log(`Starting crawl of ${baseURL}`)
    crawlPage(baseURL)
}

main()