export interface RecommendedChore {
  title: string;
  key: string;
  pointValue: number;
  category: string;
  checklistItems: string[];
}

export const RECOMMENDED_CHORES: Record<'toddler' | 'preschool' | 'elementary' | 'teen', RecommendedChore[]> = {
  toddler: [
    { title: "Put Toys in Bin 🧸", key: "toys_bin", pointValue: 5, category: "Responsibility", checklistItems: ["Gather toys on floor", "Place them inside the chest", "Close the safety lid"] },
    { title: "Brush Your Teeth 🪥", key: "brush_teeth_toddler", pointValue: 5, category: "Morning Basics", checklistItems: ["Wet the brush", "Brush front & back", "Spit water in sink"] }
  ],
  preschool: [
    { title: "Make Bed Daily 🛏️", key: "make_bed_preschool", pointValue: 10, category: "Morning Basics", checklistItems: ["Pull sheet flat", "Place pillows at head", "Smooth out cover"] },
    { title: "Water Household Plants 🪴", key: "water_plants", pointValue: 10, category: "Responsibility", checklistItems: ["Fill watering pot to line", "Water small herbs", "Mop any drips"] }
  ],
  elementary: [
    { title: "Complete Daily Reading 📚", key: "daily_reading_elem", pointValue: 20, category: "Learning", checklistItems: ["Read book 20 mins", "Tidy reading nook", "Write down new vocabulary word"] },
    { title: "Empty Dishwasher 🍽️", key: "empty_dishwasher", pointValue: 15, category: "Responsibility", checklistItems: ["Empty utensil basket first", "Empty plates on bottom", "Tidy cups on top rack"] }
  ],
  teen: [
    { title: "Vacuum Main Living Room 🧹", key: "vacuum_living_room", pointValue: 30, category: "Responsibility", checklistItems: ["Move small chairs", "Vacuum rug rows neatly", "Empty container into bin"] },
    { title: "Take Out Waste and Recycle 🗑️", key: "take_out_trash", pointValue: 20, category: "Responsibility", checklistItems: ["Tie trash bag tightly", "Set fresh liner in bin", "Roll dark bins to curb"] }
  ]
};
