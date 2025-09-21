import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
    command: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    assistantName: {
        type: String,
    },
    assistantImage: {
        type: String,
    },
    history: [historySchema]  // <- now an array of objects
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
