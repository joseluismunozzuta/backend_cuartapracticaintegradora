import { Router } from "express";

export default class CRouter{
    constructor(){
        this.router = Router();
        this.init();
    }

    getRouter(){
        return this.router;
    }

    init(){}

    get(path,policies,...callbacks){
        this.router.get(path,this.handlePolicies(policies),this.generateCustomResponses, this.applyCallbacks(callbacks));
    }

    post(path,policies,...callbacks){
        this.router.post(path,this.handlePolicies(policies),this.generateCustomResponses, this.applyCallbacks(callbacks));
    }

    put(path,policies,...callbacks){
        this.router.put(path,this.handlePolicies(policies),this.generateCustomResponses, this.applyCallbacks(callbacks));
    }

    delete(path,policies,...callbacks){
        this.router.delete(path,this.handlePolicies(policies),this.generateCustomResponses, this.applyCallbacks(callbacks));
    }

    applyCallbacks(callbacks){
        //mapeamos cada callback y obtenemos sus parametros
        return callbacks.map((callback)=>async(...params)=>{
            try{
                await callback.apply(this,params);
            }catch(error){
                console.log(error);
                //params[1] es res, por lo que se puede mandar un send
                params[1].status(500).send(error);
            }
        })
    }

    handlePolicies = policies => (req, res, next) => {
        if(policies[0]==="PUBLIC"){
            return next();
        }
        
        if(!policies.includes(req.user.role.toUpperCase())){
            return res.status(403).send({error:"Forbidden"});
        }
        
        next();

    }

    generateCustomResponses = (req, res, next) => {
        res.sendSuccess = payload => res.send({status:"success", payload});
        res.sendServerError = error => res.status(500).send({status:"error", error});
        res.sendUserError = error => res.status(400).send({status:"error", error});
        next();
    }
}