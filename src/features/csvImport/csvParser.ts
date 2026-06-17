// Custom CSV line parser handling double-quotes
export const parseCSVStringToRows = (text: string): string[][] => {
  const lines = text.split(/\r?\n/);
  return lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }).filter(row => row.length > 1 || (row.length === 1 && row[0] !== ''));
};

export interface ParsedCSVTasksResult {
  parsedRecords: any[];
  errors: string[];
}

export function parseTasksCSVText(text: string): ParsedCSVTasksResult {
  const rows = parseCSVStringToRows(text);
  if (rows.length < 2) {
    return {
      parsedRecords: [],
      errors: ["Your file is empty or missing content header row."]
    };
  }

  const headers = rows[0].map(h => h.trim().toLowerCase());
  
  // Check if essential headers are present
  const missingHeaders = ["task_key", "title", "point_value"].filter(
    h => !headers.includes(h)
  );

  if (missingHeaders.length > 0) {
    return {
      parsedRecords: [],
      errors: [`Missing mandatory headers in CSV: ${missingHeaders.join(', ')}`]
    };
  }

  const parsedRecords: any[] = [];
  const errorsList: string[] = [];
  const validDays = ["All", "Weekday", "Weekend", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0 || (row.length === 1 && row[0] === '')) continue;

    // Build data map based on actual column positions
    const record: any = {};
    headers.forEach((header, colIdx) => {
      record[header] = row[colIdx] !== undefined ? row[colIdx].trim() : '';
    });

    const lineNo = i + 1;
    const key = record["task_key"];
    const title = record["title"];
    const ptVal = Number(record["point_value"]);
    const day = record["day_of_week"] || "All";

    // Validate types & bounds
    if (!key) errorsList.push(`Line ${lineNo}: missing unique "task_key"`);
    if (!title) errorsList.push(`Line ${lineNo}: missing task "title"`);
    
    if (isNaN(ptVal) || ptVal < 0) {
      errorsList.push(`Line ${lineNo}: "point_value" (${record["point_value"]}) must be a zero or positive number`);
    }

    if (!validDays.includes(day)) {
      errorsList.push(`Line ${lineNo}: invalid day of week ("${day}"). Valid options: All, Weekday, Weekend, or week day names.`);
    }

    // Checklist items parser
    let checklist: string[] = [];
    if (record["checklist_items"]) {
      checklist = record["checklist_items"].split('|').map((item: string) => item.trim()).filter((item: string) => item !== '');
    }

    const isDaily = record["is_daily"]?.toLowerCase() === 'false' ? false : true;
    const isRequired = record["is_required"]?.toLowerCase() === 'false' ? false : true;
    const active = record["active"]?.toLowerCase() === 'false' ? false : true;
    const sortOrder = record["sort_order"] ? Number(record["sort_order"]) : 10;
    const isVisitTask = record["is_visit_task"]?.toLowerCase() === 'true';
    const visitTaskKey = record["visit_task_key"] || '';
    const pausedDuringVisit = record["paused_during_visit"]?.toLowerCase() === 'true';

    parsedRecords.push({
      key,
      title,
      category: record["category"] || "General",
      description: record["description"] || "",
      pointValue: ptVal,
      dayOfWeek: day,
      isDaily,
      isRequired,
      checklistItems: checklist,
      sortOrder: isNaN(sortOrder) ? 10 : sortOrder,
      active,
      isVisitTask,
      visitTaskKey,
      pausedDuringVisit
    });
  }

  return {
    parsedRecords,
    errors: errorsList
  };
}

export interface ParsedCSVRewardsResult {
  parsedRecords: any[];
  errors: string[];
}

export function parseRewardsCSVText(text: string): ParsedCSVRewardsResult {
  const rows = parseCSVStringToRows(text);
  if (rows.length < 2) {
    return {
      parsedRecords: [],
      errors: ["Your file is empty or missing row headers"]
    };
  }

  const headers = rows[0].map(h => h.trim().toLowerCase());
  const missingHeaders = ["reward_key", "title", "point_cost"].filter(h => !headers.includes(h));

  if (missingHeaders.length > 0) {
    return {
      parsedRecords: [],
      errors: [`Missing mandatory headers in CSV: ${missingHeaders.join(', ')}`]
    };
  }

  const parsedRecords: any[] = [];
  const errorsList: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0 || (row.length === 1 && row[0] === '')) continue;

    const record: any = {};
    headers.forEach((header, colIdx) => {
      record[header] = row[colIdx] !== undefined ? row[colIdx].trim() : '';
    });

    const lineNo = i + 1;
    const key = record["reward_key"];
    const title = record["title"];
    const cost = Number(record["point_cost"]);
    const categoryStr = record["category"] ? record["category"].toLowerCase() : 'small';

    if (!key) errorsList.push(`Line ${lineNo}: missing "reward_key" identifier`);
    if (!title) errorsList.push(`Line ${lineNo}: missing reward "title"`);
    
    if (isNaN(cost) || cost < 0) {
      errorsList.push(`Line ${lineNo}: "point_cost" (${record["point_cost"]}) must be a zero or positive number`);
    }

    const validCategories = ['small', 'medium', 'weekly', 'saved_up'];
    if (!validCategories.includes(categoryStr)) {
      errorsList.push(`Line ${lineNo}: invalid category level "${record["category"] || ''}". Allowed levels: small, medium, weekly, saved_up`);
    }

    const requiresApproval = record["requires_approval"]?.toLowerCase() === 'false' ? false : true;
    const active = record["active"]?.toLowerCase() === 'false' ? false : true;
    const sortOrder = record["sort_order"] ? Number(record["sort_order"]) : 10;

    parsedRecords.push({
      key,
      title,
      category: categoryStr,
      pointCost: cost,
      boundary: record["boundary"] || "",
      requiresApproval,
      active,
      sortOrder: isNaN(sortOrder) ? 10 : sortOrder
    });
  }

  return {
    parsedRecords,
    errors: errorsList
  };
}
