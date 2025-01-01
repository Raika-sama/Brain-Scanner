// services/schoolYearService.js
class SchoolYearService {
    static getCurrentSchoolYear() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        
        // Se siamo dopo agosto, l'anno scolastico è year/year+1
        // altrimenti è year-1/year
        if (month >= 9) {
            return `${year}/${year + 1}`;
        }
        return `${year - 1}/${year}`;
    }

    static isValidSchoolYear(yearString) {
        const regex = /^(\d{4})\/(\d{4})$/;
        const match = yearString.match(regex);
        if (!match) return false;
        
        const [_, startYear, endYear] = match;
        return parseInt(endYear) === parseInt(startYear) + 1;
    }
}

module.exports = SchoolYearService;