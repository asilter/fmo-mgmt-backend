class StringUtils {
    constructor() {
        //console.log("StringUtils initialized");
    }
    generateAlphaNumericStringAsync(length) {
        return new Promise((resolve, reject) => {
            let str = Math.random().toString(36).substr(2, length);
            resolve(str);
        });
    }

    generateAlphaNumericString(length) {
        return Math.random().toString(36).substr(2, length);
    }
}
module.exports = StringUtils;