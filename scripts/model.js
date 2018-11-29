const isMatching = require('./utils.js');

module.exports = {
    // allFriends: {},
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
    loadFriendsFromLocalStorage: () => {
        this.allFriends = localStorage.friends ? JSON.parse(localStorage.friends) : {};
        return localStorage.friends ? JSON.parse(localStorage.friends) : {}
    },
    saveFriendsToLocalStorage: (friendsObj) => {
        localStorage.friends = JSON.stringify(friendsObj);
    },
    async addFriendsFromVK(friendsObj) {
        //Заполнение friendsObj данными о друзьях из ВК
        try {
            await
                this.loginVK(6762696, 2);
            const friends = await
                this.callAPI('friends.get', {fields: 'photo_50'});

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
    },
    // Все друзья в формате для Handlebars
    getAllFriendsForHB(friendsObj) {
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

        return {items: friendsForHB};
    },
    //Невыбранные друзья (левая панель) в формате для Handlebars (с учетом фильтра)
    getUnselectedFriends(friendsObj, filter) {
        const allFriendsArray = this.getAllFriendsForHB(friendsObj).items;

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
    getSelectedFriends(friendsObj, filter) {
        const allFriendsArray = this.getAllFriendsForHB(friendsObj).items;

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
    toggleFriendStatus: (friendsObj, id) => friendsObj[id].selected = !friendsObj[id].selected

};