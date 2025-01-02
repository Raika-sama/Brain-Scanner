const mongoose = require('mongoose');

/**
 * Class Schema Definition
 * Represents a school class with inheritance from school settings
 */
const classSchema = new mongoose.Schema({
    // Basic class information
    name: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true,
        uppercase: true,
        validate: {
            validator: async function(v) {
                const school = await this.model('School').findById(this.schoolId);
                return school.sections.includes(v);
            },
            message: 'Invalid section for this school'
        }
    },
    year: {
        type: Number,
        required: true,
        validate: {
            validator: async function(v) {
                const school = await this.model('School').findById(this.schoolId);
                return v <= school.numberOfYears;
            },
            message: 'Invalid year for this school type'
        }
    },

    // School relationship
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },

    // Teachers management
    mainTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teachers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    // Students management
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],

    // Academic information
    academicYear: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{4}\/\d{4}$/.test(v);
            },
            message: 'Invalid academic year format (YYYY/YYYY)'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
classSchema.index({ schoolId: 1, year: 1, section: 1, academicYear: 1 }, { unique: true });
classSchema.index({ mainTeacher: 1 });
classSchema.index({ teachers: 1 });

// Pre-save middleware
classSchema.pre('save', function(next) {
    if (this.mainTeacher && !this.teachers.includes(this.mainTeacher)) {
        this.teachers.push(this.mainTeacher);
    }
    next();
});

// Methods
classSchema.methods.addTeacher = function(teacherId) {
    if (!this.teachers.includes(teacherId)) {
        this.teachers.push(teacherId);
    }
    return this;
};

classSchema.methods.removeTeacher = function(teacherId) {
    if (teacherId.equals(this.mainTeacher)) {
        throw new Error('Cannot remove main teacher');
    }
    this.teachers = this.teachers.filter(id => !id.equals(teacherId));
    return this;
};

module.exports = mongoose.model('Class', classSchema);