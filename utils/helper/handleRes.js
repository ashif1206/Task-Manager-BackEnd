
export function hadndleRes(res,statusCode,message){
    return res.status(statusCode).json({message})
}