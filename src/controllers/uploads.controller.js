import UserService from "../services/user.service.js";

const userService = new UserService()

export const uploads = async (req, res)=>{
    
    let user = await userService.findOne(req.user.email);
    let admin, premium = null;
    let uploads = [];
    uploads = user.documents;
    admin = (user.role === "admin") ? true : false;
    premium = (user.role === "premium") ? true : false;
    res.render("uploads", {
        uploads,
        user,
        admin, 
        premium,
        active:({uploads: true})
    });
};
