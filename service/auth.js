// for stateful auth
//const sessionIdToUserMap = new Map();    

//for stateless

const jwt = require('jsonwebtoken')
const secret = "gyAsUptaH*$898@333"

// function setUser(id,user){
//     sessionIdToUserMap.set(id,user);
// }

// function getUser(id){
//     return sessionIdToUserMap.get(id);
// }

function setUser(user) {
    return jwt.sign(
        {
            _id: user._id,
            email: user.email,
        },
        secret
    );
}

function getUser(token) {
    if (!token) return null;
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
}

module.exports = {
    setUser,
    getUser,
};
