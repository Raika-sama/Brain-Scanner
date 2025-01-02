const mongoose = require('mongoose');

/**
* User Schema Definition
* Represents users in the system with different roles and authentication details
*/
const userSchema = new mongoose.Schema({
   // Basic user information
   firstName: {
       type: String,
       required: true,
       trim: true
   },
   lastName: {
       type: String,
       required: true,
       trim: true
   },
   email: {
       type: String,
       required: true,
       unique: true,
       trim: true,
       lowercase: true
   },
   password: {
       type: String,
       required: true
   },
   defaultSchool: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },
   // User role and status
   role: {
      type: String,
      enum: ['teacher', 'admin'],
      required: true,
      default: function() {
        return this.role === 'Amministratore' ? 'admin' : 'teacher';
      }
    },
   isActive: {
       type: Boolean,
       default: true
   },

   // System metadata
   lastLogin: {
       type: Date
   },
   passwordResetToken: String,
   passwordResetExpires: Date
}, { 
   timestamps: true 
});

// Indexes for common queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

/**
* Methods to handle user-school relationships
* Note: Actual school relationships are stored in School model
*/
userSchema.methods.getSchools = async function() {
   return await mongoose.model('School').find({
       'users.user': this._id
   });
};

userSchema.methods.getDefaultSchool = async function() {
   return await mongoose.model('School').findOne({
       'users.user': this._id,
       'users.isDefault': true
   });
};

// Export the model
module.exports = mongoose.model('User', userSchema);