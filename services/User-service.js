import User from "../Module/Usermodule.js";

class userservice {
  async finduser(filter) {
    const exitUser = await User.findOne(filter);
    return exitUser;
  }
  async createuser(data){
    const createUser = await User.create(data);
    return createUser;
  }
}
export default new userservice();
