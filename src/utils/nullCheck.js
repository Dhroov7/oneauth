module.exports = {
    hasNull: (target, requiredKeys) => {
        for (let member of requiredKeys) {
            if (!target[member])
                return true;
        }
        return false;
    }
};
