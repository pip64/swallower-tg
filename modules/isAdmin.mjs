export default function isAdmin(idOfChat, IdOfUser, ctx) {
    return new Promise((resolve, reject) => {
        ctx.telegram.getChatMember(idOfChat, IdOfUser).then((user) => {
            resolve(user.status === "creator");
        })
            .catch((error) => {
                reject(error);
            });
    });
}