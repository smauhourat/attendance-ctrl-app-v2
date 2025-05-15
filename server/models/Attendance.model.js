const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    person: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    synced: {
        type: Boolean,
        default: false
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
}
);

attendanceSchema.virtual('id').get(function () {
    return this._id.toString();
});

// Índice compuesto para evitar duplicados
attendanceSchema.index({ event: 1, person: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);