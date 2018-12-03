import { isMatching } from './utils.js';

export default {
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
