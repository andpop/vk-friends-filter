(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Model = require('./model.js');
const View = require('./view.js');
const htmlElements = require('./html-elements.js');

module.exports = {
    addDrugAndDropListeners() {
        htmlElements.unselectedList.addEventListener('dragstart', e => {
            // Запоминаем id перемещаемого друга
            e.dataTransfer.setData('id', e.target.dataset.friend_id);
        });

        // Делаем контейнер способным принять перемещаемые объекты
        htmlElements.selectedContainer.addEventListener('dragover', e => {
            e.preventDefault();
        });

        htmlElements.selectedContainer.addEventListener('drop', e => {
            // id перемещенного друга
            const id = e.dataTransfer.getData('id');

            Model.toggleFriendStatus(id);
            View.displayFriends();
        });
    },
    // Переключение статуса друга (выбран/невыбран) при щелчке на значок + или x, потом отрисовка списков
    toggleStatusHandler(e) {
        if (e.target.tagName === 'IMG') {
            const id = e.target.dataset.friend_id;

            Model.toggleFriendStatus(id);
            View.displayFriends();
        }
    },
    addListeners() {
        this.addDrugAndDropListeners();
        // Переключение статуса друга (выбран/невыбран) при щелчке на значок + или x
        htmlElements.unselectedList.addEventListener('click', this.toggleStatusHandler);
        htmlElements.selectedList.addEventListener('click', this.toggleStatusHandler);
        // Фильтрация соответстующего списка при изменении текста в фильтре
        htmlElements.unselectedFilter.addEventListener('keyup', () => View.displayUnselectedFriends());
        htmlElements.selectedFilter.addEventListener('keyup', () => View.displaySelectedFriends());

        htmlElements.saveButton.addEventListener('click', () => {
            Model.saveFriendsToLocalStorage();
        });
        htmlElements.closeButton.addEventListener('click', () => window.close());
        // htmlElements.closeButton.addEventListener('click', () => {
        //Окно не закрывается!
        // window.close();
        // window.open(document.location.href, '_self', '');
        // window.close();
        // });
    }
};

},{"./html-elements.js":3,"./model.js":4,"./view.js":6}],2:[function(require,module,exports){
let Model = require('./model.js');
const View = require('./view.js');
const Controller = require('./controller.js');

//Создаем объект Model.allFriends с друзьями, сохраненными в local storage
Model.loadFriendsFromLocalStorage();

(async () => {
    //Добавляем в объект Model.allFriends с друзьями записи о друзьях из ВК
    await Model.addFriendsFromVK();
    View.displayFriends();
    Controller.addListeners();
})();

},{"./controller.js":1,"./model.js":4,"./view.js":6}],3:[function(require,module,exports){
module.exports = {
    selectedFilter: document.querySelector('#selected-filter'),
    unselectedFilter: document.querySelector('#unselected-filter'),
    selectedContainer: document.querySelector('#selected-container'),
    selectedList: document.querySelector('#selected-list'),
    unselectedList: document.querySelector('#unselected-list'),
    saveButton: document.querySelector('#save'),
    closeButton: document.querySelector('#close'),
    templateElement: document.querySelector('#friend-template')
};

},{}],4:[function(require,module,exports){
const isMatching = require('./utils.js');

module.exports = {
    allFriends: {}, //данные о всех друзьях, загруженных из LocalStorage и добавленных из ВК
    loginVK: (appId, permissions) => {
        VK.init({apiId: appId});

        return new Promise((resolve, reject) => {
            VK.Auth.login(data => {
                if (data.session) {
                    resolve();
                } else {
                    reject(new Error('Ошибка при авторизации'));
                }
            }, permissions);
        });
    },
    callAPI: (method, params) => {
        params.v = params.v || '5.92';

        return new Promise((resolve, reject) => {
            VK.api(method, params, (data) => {
                if (data.error) {
                    reject(data.error);
                } else {
                    resolve(data.response);
                }
            });
        })
    },
    loadFriendsFromLocalStorage() {
        this.allFriends = localStorage.friends ? JSON.parse(localStorage.friends) : {};

        return this.allFriends;
    },
    saveFriendsToLocalStorage() {
        localStorage.friends = JSON.stringify(this.allFriends);
    },
    async addFriendsFromVK() {
        //Заполнение friendsObj данными о друзьях из ВК
        try {
            await
                this.loginVK(6762696, 2);
            const friends = await
                this.callAPI('friends.get', {fields: 'photo_50'});

            for (const item of friends.items) {
                if (this.allFriends.hasOwnProperty(item.id)) {
                    // Если информация о друге уже была сохранена локально, то обновляем ее из ВК
                    this.allFriends[item.id].firstName = item.first_name;
                    this.allFriends[item.id].lastName = item.last_name;
                    this.allFriends[item.id].photo = item.photo_50;
                } else {
                    // Если локальной информации о друге не было, то добавляем ее
                    this.allFriends[item.id] = {
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
    },
    // Все друзья в формате для Handlebars
    getAllFriendsForHB() {
        let friendsForHB = [];

        for (let id in this.allFriends) {
            if (this.allFriends.hasOwnProperty(id)) {
                friendsForHB.push({
                    id,
                    firstName: this.allFriends[id].firstName,
                    lastName: this.allFriends[id].lastName,
                    photo: this.allFriends[id].photo,
                    selected: this.allFriends[id].selected
                });
            }
        }

        return {items: friendsForHB};
    },
    //Невыбранные друзья (левая панель) в формате для Handlebars (с учетом фильтра)
    getUnselectedFriends(filter) {
        const allFriendsArray = this.getAllFriendsForHB().items;

        return {
            items: allFriendsArray.filter(item => {
                let isFriendMatched = !item.selected;

                if (filter !== '') {
                    isFriendMatched = isFriendMatched && isMatching(`${item.firstName} ${item.lastName}`, filter);
                }

                return isFriendMatched;
            })
        };
    },
    //Выбранные друзья (правая панель) в формате для Handlebars (с учетом фильтра)
    getSelectedFriends(filter) {
        const allFriendsArray = this.getAllFriendsForHB().items;

        return {
            items: allFriendsArray.filter(item => {
                let isFriendMatched = item.selected;

                if (filter !== '') {
                    isFriendMatched = isFriendMatched && isMatching(`${item.firstName} ${item.lastName}`, filter);
                }

                return isFriendMatched;
            })
        };
    },
    toggleFriendStatus(id) {
        this.allFriends[id].selected = !this.allFriends[id].selected;
    }
};

},{"./utils.js":5}],5:[function(require,module,exports){
// Функция проверяет, встречается ли подстрока chunk в строке full (без учета регистра символов)
function isMatching(full, chunk) {
    return (new RegExp(chunk, 'i')).test(full);
}

module.exports = isMatching;

},{}],6:[function(require,module,exports){
const htmlElements = require('./html-elements.js');
const Model = require('./model.js');

module.exports = {
    render(htmlElement, data) { // имя шаблона, данные
        const renderFn = Handlebars.compile(htmlElement.textContent);

        return renderFn(data);
    },
    displayUnselectedFriends() {
        const unselectedFriends = Model.getUnselectedFriends(htmlElements.unselectedFilter.value.trim());
        htmlElements.unselectedList.innerHTML = this.render(htmlElements.templateElement, unselectedFriends);
    },
    displaySelectedFriends() {
        const selectedFriends = Model.getSelectedFriends(htmlElements.selectedFilter.value.trim());
        htmlElements.selectedList.innerHTML = this.render(htmlElements.templateElement, selectedFriends);
    },
    displayFriends() {
        this.displayUnselectedFriends();
        this.displaySelectedFriends();
    }
};

},{"./html-elements.js":3,"./model.js":4}]},{},[2]);
