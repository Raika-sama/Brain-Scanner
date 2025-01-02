const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    // Personal information
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
    gender: {
        type: String,
        enum: ['M', 'F'],
        required: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },

    // Class and School information (inherited)
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        validate: {
            validator: async function(v) {
                const classDoc = await this.model('Class').findById(this.classId);
                return classDoc.schoolId.equals(v);
            },
            message: 'School must match class school'
        }
    },
    section: {
        type: String,
        required: true,
        uppercase: true
    },

    // Teacher assignments
    mainTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teachers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    // Additional information
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
studentSchema.index({ classId: 1 });
studentSchema.index({ schoolId: 1 });
studentSchema.index({ mainTeacher: 1 });
studentSchema.index({ teachers: 1 });

// Pre-save middleware
studentSchema.pre('save', async function(next) {
    if (this.isNew) {
        // Inherit school from class
        const classDoc = await this.model('Class').findById(this.classId);
        if (!classDoc) {
            return next(new Error('Invalid class reference'));
        }
        this.schoolId = classDoc.schoolId;
        this.section = classDoc.section;
        
        // Ensure mainTeacher is in teachers array
        if (this.mainTeacher && !this.teachers.includes(this.mainTeacher)) {
            this.teachers.push(this.mainTeacher);
        }
    }
    next();
});

// Methods for teacher management
studentSchema.methods.addTeacher = function(teacherId) {
    if (!this.teachers.includes(teacherId)) {
        this.teachers.push(teacherId);
    }
    return this;
};

studentSchema.methods.removeTeacher = function(teacherId) {
    if (teacherId.equals(this.mainTeacher)) {
        throw new Error('Cannot remove main teacher');
    }
    this.teachers = this.teachers.filter(id => !id.equals(teacherId));
    return this;
};

module.exports = mongoose.model('Student', studentSchema);