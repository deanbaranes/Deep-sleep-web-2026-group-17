import * as XLSX from "xlsx";

/**
 * Generates and downloads an Excel report for a specific class.
 * @param {Array} data - The array of student entry objects.
 * @param {string} classId - The ID of the class (for filename).
 */
export const generateClassReportExcel = (data, classId) => {
    // 1. Create Anonymized Map (Student Real ID -> Sequential Number 1, 2, 3...)
    const uniqueStudentIds = [...new Set(data.map(r => r.studentId || r.id))].filter(Boolean).sort();
    const studentIdMap = {};
    uniqueStudentIds.forEach((id, index) => {
        studentIdMap[id] = index + 1; // 1-based index
    });

    // Transform data for better Excel headers
    const exportData = data.map(row => {
        const realId = row.studentId || row.id;
        const anonymousId = studentIdMap[realId] || "Anonymous";

        const newRow = {
            "User Code": anonymousId,
            "תאריך": row.date,

            // Static Fields from SleepForm
            "שכבה": row.grade,
            "מגדר": row.gender === 'male' ? 'בן' : (row.gender === 'female' ? 'בת' : row.gender),
            "זמן כניסה למיטה": row.bed_entry_time,
            "זמן החלטה לעצום עיניים": row.eye_close_decision,
            "פעילות לפני שינה": Array.isArray(row.pre_sleep_activity) ? row.pre_sleep_activity.join(", ") : row.pre_sleep_activity,
            "זמן עד הירדמות": row.time_to_fall_asleep,
            "מספר יקיצות": row.wakeups_count,
            "משך ערות בלילה": row.awake_duration_total,
            "זמן יקיצה": row.wake_up_time,
            "אופן יקיצה": row.wake_up_method,
            "שעות שינה מוערכות": row.total_sleep_estimate,
            "הערות": row.notes || ""
        };

        // Handle Dynamic Questions
        Object.keys(row).forEach(key => {
            if (key.startsWith("custom_") && !key.endsWith("_category") && !key.endsWith("_text")) {
                const category = row[`${key}_category`] || "כללי";
                const questionText = row[`${key}_text`] || "שאלה מותאמת";
                const header = `[${category}] ${questionText}`;
                newRow[header] = row[key];
            }
        });

        return newRow;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ClassData");
    XLSX.writeFile(wb, `Class_${classId}_Report.xlsx`);
};


/**
 * Generates and downloads an Excel research report for a specific category.
 * @param {Array} entries - The array of all sleep entries.
 * @param {Array} questions - The array of all global active questions.
 * @param {Object} category - The category object {id, label}.
 * @param {Object} anonymousMap - Map of student composite keys to anonymous IDs.
 * @returns {void}
 */
export const generateResearchReportExcel = (entries, questions, category, anonymousMap) => {
    // 1. Filter questions by category
    const categoryQuestions = questions.filter(q => q.category === category.id);

    if (categoryQuestions.length === 0) {
        throw new Error("לא נמצאו שאלות בקטגוריה זו.");
    }

    // 2. Filter Rows: Keep only entries that have at least one answer to any of the category questions
    const relevantEntries = entries.filter(entry => {
        return categoryQuestions.some(q => {
            const answerKey = `custom_${q.id}`;
            const val = entry[answerKey];
            // Valid answer check
            if (val === undefined || val === null) return false;
            if (typeof val === 'string') return val.trim().length > 0;
            if (Array.isArray(val)) return val.length > 0;
            return true;
        });
    });

    if (relevantEntries.length === 0) {
        throw new Error("לא נמצאו תלמידים שענו על שאלות בקטגוריה זו.");
    }

    // 3. Filter Columns: Based on the relevant entries, see which questions were actually answered
    const questionsWithAnswers = categoryQuestions.filter(q => {
        const answerKey = `custom_${q.id}`;
        return relevantEntries.some(entry => {
            const val = entry[answerKey];
            if (val === undefined || val === null) return false;
            if (typeof val === 'string') return val.trim().length > 0;
            if (Array.isArray(val)) return val.length > 0;
            return true;
        });
    });

    // 4. Prepare Headers
    const headers = [
        "User ID",
        "Date",
        "Class ID",
        "Experiment ID",
        ...questionsWithAnswers.map(q => q.text)
    ];

    // 5. Map Data (Using relevantEntries)
    const rows = relevantEntries.map(entry => {
        // Lookup anonymized ID using composite key
        const compositeKey = `${entry.classId || ""}_${entry.studentId}`;
        const anonId = anonymousMap[compositeKey] || "N/A";

        const rowData = {
            "User ID": anonId,
            "Date": entry.date?.toDate ? entry.date.toDate().toLocaleDateString() : entry.date,
            "Class ID": entry.classId || "",
            "Experiment ID": entry.experimentId || ""
        };

        questionsWithAnswers.forEach(q => {
            const answerKey = `custom_${q.id}`;
            let val = entry[answerKey];

            if (Array.isArray(val)) {
                val = val.join(", ");
            }
            rowData[q.text] = val || "";
        });

        return rowData;
    });

    // 6. Create Workbook
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    const workbook = XLSX.utils.book_new();

    const validSheetName = category.label.replace(/[:\\/?*\[\]]/g, "-");
    XLSX.utils.book_append_sheet(workbook, worksheet, validSheetName);

    // 7. Download
    XLSX.writeFile(workbook, `Report_${category.id}_filtered_${new Date().toISOString().slice(0, 10)}.xlsx`);

    return relevantEntries.length;
};
