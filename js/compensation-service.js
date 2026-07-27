/**
 * =============================================================================
 * NexaTrack Compensation Service (v1.0)
 * =============================================================================
 * Reusable engine for doctor compensation calculations.
 *
 * Usage:
 *   CompensationService.calculateDoctorPay(5000, 'Full Doctor')   → 5000
 *   CompensationService.calculateDoctorPay(5000, 'Prep Doctor')   → 3000
 *   CompensationService.calculateDoctorPay(5000, 'Cement Doctor') → 2000
 *
 * Doctor Role Percentages — stored in a configurable object
 * (not hardcoded in formulas). Update at runtime via:
 *   CompensationService.updateRolePercentage('Prep Doctor', 65);
 * =============================================================================
 */

const DoctorRolePercentages = {
    'Full Doctor': 100,    // 100% of Base Case Pay
    'Prep Doctor': 60,     // 60%  of Base Case Pay
    'Cement Doctor': 40    // 40%  of Base Case Pay
};

class CompensationService {

    /**
     * Calculate doctor pay based on base case pay & role.
     * @param {number} baseCasePay - The base case pay amount
     * @param {string} role        - Role key ('Full Doctor', 'Prep Doctor', 'Cement Doctor')
     * @returns {number} Calculated pay amount
     */
    static calculateDoctorPay(baseCasePay, role) {
        const pct = CompensationService.getRolePercentage(role);
        return baseCasePay * (pct / 100);
    }

    /**
     * Get the percentage configured for a given role.
     * @param {string} role
     * @returns {number} Percentage (0–100)
     */
    static getRolePercentage(role) {
        return DoctorRolePercentages[role] || 0;
    }

    /**
     * Update a role's percentage at runtime.
     * Useful when syncing from backend / admin settings.
     * @param {string} role
     * @param {number} percentage (0–100)
     * @returns {boolean} true if updated, false if role not found
     */
    static updateRolePercentage(role, percentage) {
        if (DoctorRolePercentages.hasOwnProperty(role)) {
            DoctorRolePercentages[role] = percentage;
            return true;
        }
        return false;
    }

    /**
     * Get a copy of all roles and their percentages.
     * @returns {Object} e.g. { 'Full Doctor': 100, 'Prep Doctor': 60, ... }
     */
    static getAllRoles() {
        return { ...DoctorRolePercentages };
    }

    /**
     * Get roles as an array suitable for populating <select> dropdowns.
     * @returns {Array<{value: string, label: string, percentage: number}>}
     */
    static getRoleOptions() {
        return Object.entries(DoctorRolePercentages).map(([role, pct]) => ({
            value: role,
            label: `${role} (${pct}%)`,
            percentage: pct
        }));
    }

    /**
     * Calculate a full case compensation breakdown.
     *
     * @param {number} baseCasePay - The base case pay amount
     * @param {Array<{doctorName: string, role: string}>} assignments
     * @returns {{details: Array, totalPay: number, baseCasePay: number}}
     *
     * Example:
     *   CompensationService.calculateCaseCompensation(5000, [
     *     { doctorName: 'Dr. Heider',  role: 'Full Doctor' },
     *     { doctorName: 'Dr. Vanessa', role: 'Prep Doctor' }
     *   ]);
     */
    static calculateCaseCompensation(baseCasePay, assignments) {
        const details = assignments.map(a => ({
            doctorName: a.doctorName,
            role: a.role,
            percentage: CompensationService.getRolePercentage(a.role),
            pay: CompensationService.calculateDoctorPay(baseCasePay, a.role)
        }));

        const totalPay = details.reduce((sum, d) => sum + d.pay, 0);

        return { details, totalPay, baseCasePay };
    }

    /**
     * Get formula explanation for display purposes.
     * @param {number} baseCasePay
     * @param {string} role
     * @returns {string} e.g. "$5,000 × 60% = $3,000"
     */
    static getFormulaDisplay(baseCasePay, role) {
        const pct = CompensationService.getRolePercentage(role);
        const pay = CompensationService.calculateDoctorPay(baseCasePay, role);
        return `$${Number(baseCasePay).toLocaleString()} × ${pct}% = $${pay.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    }
}
