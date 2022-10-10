const {IgApiClient} = require("instagram-private-api")
const express = require("express");
const { response } = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config()
const app = express();

app.use(cors({origin:"*"}));

// This is the general convention on how to name the client
//    vv
const ig = new IgApiClient();
// login, load a session etc.
ig.state.generateDevice(process.env.INSTAGRAMUSERNAME);
ig.account.login(process.env.INSTAGRAMUSERNAME, process.env.INSTAGRAMPASSWORD).then(async ()=>{

    app.get("/send/anonymous/message/:username/:message", async (req, res)=>{
        
        const {username, message}= req.params;
        if (username.length < 2 || message <= 10){
            
            res.json({
                sent: false,
                error: "One of the inputs is empty.",
                errorCode: 100
            })
            return ;
        }
        
        try {
            const userId = await ig.user.getIdByUsername(username);
            const thread = ig.entity.directThread([userId.toString()]);
            await thread.broadcastText(message);
        } catch (err) {
            
            let error = {
                error: "",
                errorCode: 0
            };
            console.log(err)
            
            // if(err.includes("IgExactUserNotFoundError")){
                //     error = {
                    //         error: "Couldn't find user with exact username",
                    //         errorCode: 101
            //     }
            // }
            
            res.json({
                sent: false, 
                errorFromCode: err,
                ...error,
                err
            }) 
            res.end()
            return ;
        }
        
        res.json({
            sent: true, 
            message,
            username
        })
        res.end()
    })

    app.get("*", (req, res)=>{
        res.json({why : "i love you", req: req.ip})
        res.end()
    })
    
    app.listen(process.env.PORT, e=>{
        console.log("port on ", process.env.PORT)
    })
})
