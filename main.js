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

function toggleFriendStatus(friendsObj, id) {
    friendsObj[id] = !friendsObj[id];
}

// Все друзья в формате для Handlebars
function getAllFriendsForHB(friendsObj) {
    let friendsForHB = [];

    for (let id in friendsObj) {
        if (friendsObj.hasOwnProperty(id) && (!friendsObj[id].selected)) {
            friendsForHB.push({
                id,
                firstName: friendsObj[id].firstName,
                lastName: friendsObj[id].lastName,
                photo: friendsObj[id].photo,
                selected: friendsObj[id].selected
            });
        }
    }

    return { items: friendsForHB };
}

//Невыбранные друзья (левая панель) в формате для Handlebars
function getUnselectedFriends(friendsObj) {
    const allFriendsArray = getAllFriendsForHB(friendsObj).items;

    return { items: allFriendsArray.filter(item => !item.selected) };
}

//Выбранные друзья (правая панель) в формате для Handlebars
function getSelectedFriends(friendsObj) {
    const allFriendsArray = getAllFriendsForHB(friendsObj).items;

    return { items: allFriendsArray.filter(item => item.selected) };
}

function displayUnselectedFriends() {
    const unselectedFriends = getUnselectedFriends(allFriends);
    const html = render(unselectedFriends);
    const result = document.querySelector('#unselected_friends');
    result.innerHTML = html;
}

function displaySelectedFriends() {
    const selectedFriends = getSelectedFriends(allFriends);
    const html = render(selectedFriends);
    const result = document.querySelector('#selected_friends');
    result.innerHTML = html;
}


//Заполнение friendsObj данными о друзьях из ВК
async function addFriendsFromVK(friendsObj) {
    try {
        await auth();
        const friends = await callAPI('friends.get', { fields: 'photo_50'});

        // console.log(friends);
        for (const item of friends.items) {
            if (friendsObj.hasOwnProperty(item.id)) {
                // Если информация о друге уже была сохранена локально, то обновляем ее из ВК
                friendsObj[item.id].firstName = item.first_name;
                friendsObj[item.id].lastName = item.last_name;
                friendsObj[item.id].photo = item.photo_50;
            } else {
                // Если локальной информации о друге не было, то добавляем ее
                friendsObj[item.id] = {
                    firstName: item.first_name,
                    lastName: item.last_name,
                    photo: item.photo_50,
                    selected: false
                };
            }
        }
    } catch (e) {
        console.error(e);
    }
}

const friendTemplate = document.querySelector('#friend_template').textContent;
const render = Handlebars.compile(friendTemplate);

let allFriends = loadFriendsFromLocalStorage();

(async () => {
    await addFriendsFromVK(allFriends);
    displayUnselectedFriends();

    // let selectedFriends = getSelectedFriends(allFriends);


    saveFriendsToLocalStorage(allFriends);

})();

