import { query, getCountFromServer } from "firebase/firestore";
import { lessonsRef, usersRef } from "./refs";

export const count_users = async (college) => {
    const q = query(usersRef);
    const cnt = await getCountFromServer(q);
    return cnt._data.count.integerValue;
}

export const count_lessons = async (college) => {
    const q = query(lessonsRef);
    const cnt = await getCountFromServer(q);
    return cnt._data.count.integerValue;
}

export const count_users_by_college = async (usersDocs) => {
    return usersDocs.reduce((prev, cur) => {
        const data = cur.data();
        return {
            ...prev,
            [data.college]: (prev[data.college] || 0) + 1
        }
    }, {});
}

export const count_users_by_year = async (usersDocs) => {
    return usersDocs.reduce((prev, cur) => {
        const data = cur.data();
        return {
            ...prev,
            [data.year]: (prev[data.year] || 0) + 1
        }
    }, {});
}