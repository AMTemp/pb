import mongoose from 'mongoose'
import { autoIncrement } from 'mongoose-plugin-autoinc'

const ShortSchema = new mongoose.Schema({
  uid: {
    type: String,
    unique: true,
    index: true,
    match: [/^[a-zA-Z0-9]{8,}$/, 'Not a valid UID format'],
    minlength: [8, 'UID must be 8 characters long'],
    maxlength: [8, 'UID must be 8 characters long']
  },
  url: {
    type: String,
    unique: true,
    match: [/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i, 'Not a valid URL format'],
    required: [true, 'Please provide the URL to shorten'],
    maxlength: [2048, 'URLs cannot be longer than 2048 characters']
  }
})

ShortSchema.plugin(autoIncrement, { model: 'Short', field: 'id' });

export default mongoose.models.Short || mongoose.model('Short', ShortSchema)
