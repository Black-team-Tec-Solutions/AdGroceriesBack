const express = require('express');
const router = express.Router();
const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const {cleanRes, createJWT} = require("../util/auth-mid")


router.post("/signup", function(req,res,next){
    const{email,nombre,password,confirmPassword,role} = req.body
    if(password != confirmPassword){
        return res.status(403).json({msj:"las contraseñas no coinciden"})
    }
       
    bcrypt.hash(password,10)
    .then(hashedPass =>{
        const user ={
            
            email,
            password:hashedPass,
            nombre
        }
        console.log(user)
        User.create(user)
        .then(userCreated =>{
            const newUser = cleanRes(userCreated.toObject())
            res.status(200).json({result:newUser})
            .cookie("token", createJWT(userCreated),{
                expires: new(Date.now + 86400000),
                secure:false,
                httpOnly:true
            })
        })
        .catch(error => res.status(400).json({error}))
    })
    .catch(error => res.status(400).json({error})) 
});
   router.post("/login",(req,res)=>{
       const{email, password} = req.body

       User.findOne({email})
       .then(user => {
           if (user === null){
               return res.status(404).json({msg: "el correo o contraseña son erroneos"})

           }bcrypt.compare(password,user.password)
           .then(match=>{
               if (match){
                const newUser = cleanRes(user.toObject())

                res.cookie("token", createJWT(user),{
                    expires: new Date (Date.now + 86400000),
                    secure:false,
                    httpOnly:true
                })  .status(200).json({result:newUser})
               }else{
                   return res.status(404).json({msg: "el correo o contrasena son erroneos"})
               }
           }).catch(error => res.status(400).json({error}))
       })
       .catch(error => res.status(400).json({error}))
    })

       router.post("/logout",(req,res)=>{
           res.clearCookie("token").json({msg: "vuelve pronto"})
       })
    



module.exports = router;