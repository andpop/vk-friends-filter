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

auth().then(() => console.log('Authorization ok.'));
// console.log(VK);
