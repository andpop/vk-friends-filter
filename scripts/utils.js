// Функция проверяет, встречается ли подстрока chunk в строке full (без учета регистра символов)
function isMatching(full, chunk) {
    return (new RegExp(chunk, 'i')).test(full);
}