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

//Заполнение friendsObj данными о друзьях из ВК
async function addFriendsFromVK(friendsObj) {
    try {
        await auth();
        const friends = await callAPI('friends.get', { fields: 'photo_50'});

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

//Невыбранные друзья (левая панель) в формате для Handlebars (с учетом фильтра)
function getUnselectedFriends(friendsObj) {
    const filter = unselectedFilter.value.trim();
    const allFriendsArray = getAllFriendsForHB(friendsObj).items;

    return {
        items: allFriendsArray.filter(item => {
            let isFriendMatched = !item.selected;

            if (filter !=='') {
                isFriendMatched = isFriendMatched && isMatching(`${item.firstName} ${item.lastName}`, filter);
            }

            return isFriendMatched;
            })
    };
}

//Выбранные друзья (правая панель) в формате для Handlebars (с учетом фильтра)
function getSelectedFriends(friendsObj) {
    const filter = selectedFilter.value.trim();
    const allFriendsArray = getAllFriendsForHB(friendsObj).items;

    return {
        items: allFriendsArray.filter(item => {
            let isFriendMatched = item.selected;

            if (filter !=='') {
                isFriendMatched = isFriendMatched && isMatching(`${item.firstName} ${item.lastName}`, filter);
            }

            return isFriendMatched;
        })
    };
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

function addDrugAndDropListeners() {
    unselectedList.addEventListener('dragstart', e => {
        e.dataTransfer.setData('id', e.target.dataset.friend_id);
    });

// Делаем контейнер способным принять перемещаемые объекты
    selectedContainer.addEventListener('dragover', e => {
        e.preventDefault();
    });

    selectedContainer.addEventListener('drop', e => {
        const id = e.dataTransfer.getData('id');

        toggleFriendStatus(allFriends, id);
        displayFriends();
    });
}

function toggleStatusHandler(e) {
    if (e.target.tagName === 'IMG') {
        const id = e.target.dataset.friend_id;

        toggleFriendStatus(allFriends, id);
        displayFriends();
    }
}

function addToggleStatusListeners() {
    unselectedList.addEventListener('click', toggleStatusHandler);
    selectedList.addEventListener('click', toggleStatusHandler);
}

function addFilterListeners() {
    unselectedFilter.addEventListener('keyup', function () {
        // здесь можно обработать нажатия на клавиши внутри текстового поля для фильтрации cookie
        displayUnselectedFriends();
    });

    selectedFilter.addEventListener('keyup', function () {
        // здесь можно обработать нажатия на клавиши внутри текстового поля для фильтрации cookie
        displaySelectedFriends();
    });

}

function addListeners() {
    addDrugAndDropListeners();
    addToggleStatusListeners();
    addFilterListeners();
    saveButton.addEventListener('click', e => {
        saveFriendsToLocalStorage(allFriends);
    });
    closeButton.addEventListener('click', e => window.close());
}

function compileHandlebarsTemplate() {
    const friendTemplate = document.querySelector('#friend_template').textContent;

    return Handlebars.compile(friendTemplate);
}

//------------------------------------------------------------------------------------

let
    selectedFilter = document.querySelector('#selected-filter'),
    unselectedFilter = document.querySelector('#unselected-filter'),
    selectedContainer = document.querySelector('#selected-container'),
    selectedList = document.querySelector('#selected-list'),
    unselectedList = document.querySelector('#unselected-list'),
    saveButton = document.querySelector('#save'),
    closeButton = document.querySelector('#close');

//Функция для рендеринга списка друзей (через шаблон Handlebars)
const render = compileHandlebarsTemplate();

//Создаем объект с друзьями, сохраненными в local storage
let allFriends = loadFriendsFromLocalStorage();

addListeners();

VK.init({
    // apiId: 6759177
    apiId: 6762696
});

(async () => {
    //Добавляем в объект с друзьями записи о друзьях из ВК
    await addFriendsFromVK(allFriends);

    displayFriends();
})();

