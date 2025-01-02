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

    // Class and School information
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: false // Modificato da true a false
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        validate: {
            validator: async function(v) {
                if (!this.classId) return true; // Se non c'è classe, non validare
                const classDoc = await this.model('Class').findById(this.classId);
                return classDoc && classDoc.schoolId.equals(v);
            },
            message: 'School must match class school'
        }
    },
    section: {
        type: String,
        required: false, // Modificato da true a false
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
    },
    
    // Nuovo campo per tracciare lo stato dell'assegnazione classe
    needsClassAssignment: {
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

// Pre-save middleware modificato
studentSchema.pre('save', async function(next) {
    if (this.isNew) {
        // Se c'è una classe, eredita le informazioni
        if (this.classId) {
            const classDoc = await this.model('Class').findById(this.classId);
            if (!classDoc) {
                return next(new Error('Invalid class reference'));
            }
            
            this.section = classDoc.section;
            this.needsClassAssignment = false;
        }
        
        // Ensure mainTeacher is in teachers array
        if (!this.teachers) {
            this.teachers = [];
        }
        if (this.mainTeacher && !this.teachers.includes(this.mainTeacher)) {
            this.teachers.push(this.mainTeacher);
        }
    }
    next();
});

// Nuovo metodo per assegnare la classe
studentSchema.methods.assignClass = async function(classId) {
    const classDoc = await this.model('Class').findById(classId);
    if (!classDoc) {
        throw new Error('Invalid class reference');
    }
    
    if (!classDoc.schoolId.equals(this.schoolId)) {
        throw new Error('Class must belong to the same school as student');
    }

    this.classId = classId;
    this.section = classDoc.section;
    this.needsClassAssignment = false;
    
    return this.save();
};

// Methods for teacher management (invariati)
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