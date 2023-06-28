const mongoose = require('mongoose')
const shortId = require('shortid')

const shortURLschema = new mongoose.Schema(
    {
        og: {
            type: String,
            require: true
        },

        short: {
            type: String,
            require: true,
            default: shortId.generate
        },

        clicks: {
            type: Number,
            require: true,
            default: 0
        },

        description: {
            type: String,
            require: false,
            default: "NO TEXT"
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        }

    }
)

module.exports = mongoose.model('shortURL', shortURLschema)
