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
    friendsObj[id].selected = !friendsObj[id].selected;
}

// Все друзья в формате для Handlebars
function getAllFriendsForHB(friendsObj) {
    let friendsForHB = [];

    for (let id in friendsObj) {
        if (friendsObj.hasOwnProperty(id)) {
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
    unselectedList.innerHTML = render(unselectedFriends);
}

function displaySelectedFriends() {
    const selectedFriends = getSelectedFriends(allFriends);
    selectedList.innerHTML = render(selectedFriends);
}

function displayFriends() {
    displayUnselectedFriends();
    displaySelectedFriends();
}

//------------------------------------------------------------------------------------

const
    selectedContainer = document.querySelector('#selected-container'),
    selectedList = document.querySelector('#selected-list'),
    unselectedList = document.querySelector('#unselected-list'),
    saveButton = document.querySelector('#save');

unselectedList.addEventListener('dragstart', e => {
    event.dataTransfer.setData('id', e.target.dataset.friend_id);
});

// Делаем контейнер способным принять перемещаемые объекты
selectedContainer.addEventListener('dragover', e => {
    e.preventDefault();
});

selectedContainer.addEventListener('drop', e => {
    const id = event.dataTransfer.getData('id');

    toggleFriendStatus(allFriends, id);
    displayFriends();
});

const friendTemplate = document.querySelector('#friend_template').textContent;
const render = Handlebars.compile(friendTemplate);

let allFriends = loadFriendsFromLocalStorage();

saveButton.addEventListener('click', e => {
    console.log('save');
    saveFriendsToLocalStorage(allFriends);
});

VK.init({
    // apiId: 6759151
    apiId: 6759177
});

(async () => {
    await addFriendsFromVK(allFriends);
    displayFriends();

    // saveFriendsToLocalStorage(allFriends);
})();

