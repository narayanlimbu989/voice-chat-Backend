import { Roomdto } from "../dtos/room_dto.js";
import RoomService from "../services/RoomService.js";

class Roomscontrollers {
  async create(req, res) {
    const { topic, roomType } = req.body;
    if (!topic || !roomType) {
      return res.status(400).json("All field are required");
    }
    const room = await RoomService.create({
      topic,
      roomType,
      ownerId: req.user._id,
    });
    res.json(new Roomdto(room));
  }

  async getroom(req, res) {
    const rooms = await RoomService.GetallRooms(["open"]);
    const allRooms = rooms.map((room) => new Roomdto(room));
    res.json(allRooms);
  }

  async show(req, res) {
    const room = await RoomService.getRoom(req.params.roomId);
    return res.json(room);
  }
}
export default new Roomscontrollers();
