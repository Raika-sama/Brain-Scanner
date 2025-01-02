const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
   name: { 
       type: String, 
       required: true 
   },
   schoolType: {
       type: String,
       required: true,
       enum: ['middle_school', 'high_school']
   },
   institutionType: {
       type: String,
       enum: ['scientific', 'classical', 'artistic', 'none'],
       default: 'none',
       validate: {
           validator: function(v) {
               return this.schoolType !== 'middle_school' || v === 'none';
           },
           message: 'Institution type not allowed for middle schools'
       }
   },
   sections: {
       type: [String],
       validate: {
           validator: function(v) {
               return v.every(s => /^[A-Z]$/.test(s));
           },
           message: 'Sections must be single uppercase letters'
       }
   },
   numberOfYears: {
       type: Number,
       validate: {
           validator: function(v) {
               return this.schoolType === 'middle_school' ? v === 3 : v === 5;
           },
           message: 'Invalid number of years for school type'
       }
   },
   region: {
       type: String,
       required: true
   },
   province: {
       type: String,
       required: true
   },
   address: {
       type: String,
       required: true
   },
   users: [{
       user: {
           type: mongoose.Schema.Types.ObjectId,
           ref: 'User',
           required: true
       },
       role: {
           type: String,
           enum: ['teacher', 'admin'],
           required: true
       },
       isDefault: {
           type: Boolean,
           default: false
       }
   }],
   manager: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required: true
   },
   isActive: {
       type: Boolean,
       default: true
   }
}, {
   timestamps: true
});

// Indexes
schoolSchema.index({ 'users.user': 1 });
schoolSchema.index({ 'users.role': 1 });
schoolSchema.index({ manager: 1 });

// Pre-save middleware
schoolSchema.pre('save', function(next) {
   // Set number of years based on school type
   this.numberOfYears = this.schoolType === 'middle_school' ? 3 : 5;
   
   // Validate single default school per user
   const defaultCount = this.users.filter(u => u.isDefault).length;
   if (defaultCount > 1) {
       next(new Error('User can have only one default school'));
   }
   next();
});

// Methods
schoolSchema.methods.addUser = function(userId, role) {
   if (!this.users.some(u => u.user.equals(userId))) {
       this.users.push({
           user: userId,
           role: role,
           isDefault: this.users.length === 0
       });
   }
   return this;
};

schoolSchema.methods.removeUser = function(userId) {
   this.users = this.users.filter(u => !u.user.equals(userId));
   return this;
};

module.exports = mongoose.model('School', schoolSchema);