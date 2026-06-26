import {getStorage, removeStorage, saveStorage, decodeToken} from "./helpers";

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

export const saveAuthToken = async(token) =>{
    await saveStorage(TOKEN_KEY, token);
    const decoded = decodeToken(token);

    await saveAuthUser({
        email: decoded.email,
        name: decoded.name,
        privilege: decoded.privilege
    });

};

export const getAuthToken = async() =>{
    return await getStorage(TOKEN_KEY);
};

export const removeAuthToken = async() =>{
    await removeStorage(TOKEN_KEY);
};


export const saveAuthUser = async(user) =>{
    await saveStorage(USER_KEY, user);
};

export const getAuthUser = async() =>{
    return await getStorage(USER_KEY);
};

export const removeAuthUser = async() =>{
    await removeStorage(USER_KEY);
};