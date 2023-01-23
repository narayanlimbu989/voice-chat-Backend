import RoomModule from "../Module/RoomModule.js";

class roomservice {
  async create(payload) {
    const { topic, roomType, ownerId } = payload;
    const room = await RoomModule.create({
      topic,
      roomType,
      ownerId,
      speakers: [ownerId],
    });
    return room;
  }

  async GetallRooms(Types) {
    const rooms = await RoomModule.find({ roomType: { $in: Types } })
      .populate("speakers")
      .populate("ownerId")
      .exec();

    return rooms;
  }

  async getRoom(roomId) {
    const room = await RoomModule.findOne({ _id: roomId });
    return room;
  }
}
export default new roomservice();
