const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    credentialNumber: {
        type: String,
        required: true,
        unique: true
    },
    dni: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
}
);

personSchema.virtual('id').get(function () {
    return this._id.toString();
});

module.exports = mongoose.model('Person', personSchema);