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

function saveFriendsToLocalStorage(friendsObj) {
    localStorage.friends = JSON.stringify(friendsObj);
}

function loadFriendsFromLocalStorage() {
    let data = {};

    if (localStorage.friends) {
        data = JSON.parse(localStorage.friends);
    }

    return data;
}

//Добавление в friendsObj данными о друзьях из ВК
async function addFriendsFromVK(friendsObj) {
    try {
        await auth();
        const friends = await callAPI('friends.get', { fields: 'photo_50'});

        for (const item of friends.items) {
            if (friendsObj.hasOwnProperty(item.id)) {
                // Если информация о друге уже была сохранена локально, то обновляем ее из ВК
                friendsObj[item.id].first_name = item.first_name;
                friendsObj[item.id].last_name = item.last_name;
                friendsObj[item.id].photo = item.photo_50;
            } else {
                // Если локальной информации о друге не было, то добавляем ее
                friendsObj[item.id] = {
                    first_name: item.first_name,
                    last_name: item.last_name,
                    photo: item.photo_50,
                    selected: false
                };
            }
        }
    } catch (e) {
        console.error(e);
    }
}

let allFriends = loadFriendsFromLocalStorage();

(async () => {
    await addFriendsFromVK(allFriends);

    let unselectedFriends = getUnselectedFriends(allFriends);
    let selectedFriends = getSelectedFriends(allFriends);

    saveFriendsToLocalStorage(allFriends);

})();

