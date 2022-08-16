class ApiFeatures {
    constructor(query,queryStr){
        this.query=query;
        this.queryStr=queryStr
    }

    search(){
        const qu=this.queryStr.qu ? 
            {
                name:{
                    $regex:this.queryStr.qu,
                    $options:"i"
                }
            }
            :
            {};
            // console.log(qu)
        this.query=this.query.find({...qu})
        return this;
    }
}

module.exports=ApiFeatures