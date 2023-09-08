const {IgApiClient} = require("instagram-private-api")
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const serverless = require("serverless-http");
dotenv.config()
const app = express();
app.use(cors({origin:"*"}));
const router = express.Router();

// This is the general convention on how to name the client
const ig = new IgApiClient();
// login, load a session etc.
// ig.state.generateDevice(process.env.INSTAGRAMUSERNAME);
// ig.account.login(process.env.INSTAGRAMUSERNAME, process.env.INSTAGRAMPASSWORD)

router.get("/send/anonymous/message/:username/:message", async (req, res)=>{
    await ig.state.generateDevice(process.env.INSTAGRAMUSERNAME);        
    await ig.account.login(process.env.INSTAGRAMUSERNAME, process.env.INSTAGRAMPASSWORD)
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

router.get("*", (req, res)=>{
    res.json({why : "Working, thx 4 asking.", req: req.socket.remoteAddress})
    res.end()
})

app.use('/api/', router);
export const handler = serverless(app);
