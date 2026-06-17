export const TASK_CSV_TEMPLATE = 
  "task_key,title,category,description,point_value,day_of_week,is_daily,is_required,checklist_items,sort_order,active,is_visit_task,visit_task_key,paused_during_visit\n" +
  "reading_basics,Read 30 Minutes,Growth,Quiet reading time,2,All,true,true,Find interesting book|Set silent timer|Share 1 detail with Mom,5,true,false,,false\n" +
  "yard_tidy,Help Sweep Patio,Responsibility,Clear leaves from seating,1,Weekend,false,false,Grab patio broom|Sweep leaves into basket|Wipe off outdoor table,6,true,false,,false\n" +
  "visit_wash_dishes,Wash Dishes with Caregiver,Visit Care,Help caregiver tidy up kitchen,3,All,false,false,Fill sink|Scrub dishes|Dry and stack,3,true,true,visit_dishes,false";

export const REWARD_CSV_TEMPLATE = 
  "reward_key,title,category,point_cost,boundary,requires_approval,active,sort_order\n" +
  "bake_cookies,Bake fresh cookies,medium,10,To be scheduled during quiet afternoon,true,true,5\n" +
  "sleepover_weekend,Weekend Sleepover,weekly,20,Requires room tidying to be kept,true,true,6\n" +
  "mini_golf,Mini Golf Excursion,saved_up,40,Requires fine weekend weather,true,true,7";
