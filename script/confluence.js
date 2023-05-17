const API_ENDPOINT = 'https://confluence.doubleslash.de/confluence/rest/api/';

// const getRequestHeader = new Headers({
//     "Content-Type": "application/json",
//     "Authentication": "Bearer MjM2MjY0Mzk1NzExOlHaqsOsLMhMH0nUSvU7Ia295inM"
// });

const bearerToken = "MjM2MjY0Mzk1NzExOlHaqsOsLMhMH0nUSvU7Ia295inM";

let post_request_header = {
    method: 'POST',
    cache: "no-store",
    referrerPolicy: "no-referrer",
    headers: {
        "Authentication": `Bearer ${bearerToken}`
    }
}

let authentication_succeeded = false;

// In Zukunft einen zweiten Parameter hinzufügen, welcher dem User zugewiesenen Token entspricht.

async function init(pageName) {
    // console.log('Authenticate user against Confluence API.')
    // authentication_succeeded = authenticateUser();
    //
    // if (authentication_succeeded)
        let formattedPageName = pageName => {
            console.log("Add valid formatting to page name.")
            pageName.replaceAll(" ", '%20');
        };

        formattedPageName(pageName)

        console.log("Retrieve content ID linked to the specified page.")
        let contentId = getContentId(formattedPageName);
        console.log(contentId);


        console.log("Check if watcher is already available. Otherwise, add a new content watcher.")
        let isWatching = isWatchingContent(contentId);

        if (!isWatching) {
            addContentWatcher(contentId);
        }

        console.log("Get direct children of a piece of content.")
        let contentChildren = getContentChildren(contentId);

        if (contentChildren.length > 0) {
            contentChildren.forEach(child => {
                addContentWatcher(child);
                getContentChildren(child);
            })
        }
}


async function getContentId(pageName) {
    const url = API_ENDPOINT + `content?title=${pageName}&expand=space,body.view`;
    fetch(url)
        .then((response) => {
            response.json().then(data => {
                Object.entries(data).forEach((entry) => {
                    if (entry.hasOwnProperty('id'))
                        return entry["id"];
                })
            })
        })
        .catch((err) => console.log(err));
}

async function isWatchingContent(contentId) {
    const url = API_ENDPOINT + `user/watch/content/${contentId}`;
    fetch(url, GET_REQUEST_HEADER)
        .then((response) => {
            response.json().then((data) => {
                if (data.hasOwnProperty('watching'))
                    return data["watching"];
            });
        })
        .catch((err) => console.log(err));
}

/*async */ function addContentWatcher(contentId) {
    const url = API_ENDPOINT + `user/watch/content/${contentId}`;
    fetch(url, post_request_header)
        .then((response) => {
            const statusCode = response.status;
            if (statusCode === 204)
                console.log('Watcher was created successfully')
        })
        .catch((err) => console.log(err));
}

async function getContentChildren(contentId) {
    const url = API_ENDPOINT + `content/${contentId}/child?expand=page.body.VIEW`;

    let childrenIds = [];

    fetch(url, GET_REQUEST_HEADER)
        .then((response) => {
            response.json().then((data) => {
                if (data.hasOwnProperty('children')) {
                    data['children'].forEach((page) => {
                        childrenIds.add(page['id']);
                    })
                }
            })
        })
        .catch((err) => console.log(err));

    return childrenIds;
}

const username = 'apena';
const pageName = '2. Nachwuchskräfte (Team Wolfgang)';

init(username, pageName);





