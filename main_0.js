console.log('In main.js');
VK.init({
    // apiId: 6759151
    apiId: 6759177
});

function auth() {
    return new Promise((resolve, reject) => {
        VK.Auth.login(data => {
            if (data.session) {
                resolve();
            } else {
                reject(new Error('Ошибка при авторизации'));
            }
        }, 2);
    });
}

function callAPI(method, params) {
    params.v = '5.92';

    return new Promise((resolve, reject) => {
        VK.api(method, params, (data) => {
            if (data.error) {
                reject(data.error);
            } else {
                resolve(data.response);
            }
        });
    })
}

async function loadFriendsFromVK() {
    try {
        await auth();
        // const [me] = await callAPI('users.get', { name_case: 'gen'});
        // const friends = await callAPI('friends.get', { fields: 'city, country, photo_50'});
        const friends = await callAPI('friends.get', { fields: 'photo_50'});
        console.log(friends);

        const template = document.querySelector('#friends_template').textContent;
        const render = Handlebars.compile(template);
        const html = render(friends);

        const result = document.querySelector('#all_friends');
        result.innerHTML = html;
    } catch (e) {
        console.error(e);
    }
}

let friendsMap = new Map();

loadFriendsFromVK();

// auth()
//     .then(() => {
//
//         return callAPI('users.get', { name_case: 'gen'});
//     })
//     .then(([me]) => {
//         console.log(me);
//
//         return callAPI('friends.get', { fields: 'city, country, photo_100'});
//     })
//     .then(friends => {
//         const template = document.querySelector('#friends_template').textContent;
//         console.log(template);
//         const render = Handlebars.compile(template);
//         const html = render(friends);
//         console.log(html);
//         const result = document.querySelector('#all_friends');
//
//         result.innerHTML = html;
//     });
