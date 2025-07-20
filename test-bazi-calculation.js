#!/usr/bin/env node

// Test Bazi calculation for different dates
function getBaziPillarForDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const heavenlyStems = ["Jia", "Yi", "Bing", "Ding", "Wu", "Ji", "Geng", "Xin", "Ren", "Gui"];
    const earthlyBranches = ["Zi", "Chou", "Yin", "Mao", "Chen", "Si", "Wu", "Wei", "Shen", "You", "Xu", "Hai"];

    const stemIndex = (year + day) % 10;
    const branchIndex = (month + day) % 12;

    const stem = heavenlyStems[stemIndex];
    const branch = earthlyBranches[branchIndex];

    const elementMap = {
        "Jia": "Yang Wood", "Yi": "Yin Wood",
        "Bing": "Yang Fire", "Ding": "Yin Fire",
        "Wu": "Yang Earth", "Ji": "Yin Earth",
        "Geng": "Yang Metal", "Xin": "Yin Metal",
        "Ren": "Yang Water", "Gui": "Yin Water"
    };

    const element = elementMap[stem] || "Yang Fire";

    return `${element} over ${branch}`;
}

console.log('🧪 Testing Bazi Calculation for Different Dates:\n');

const testDates = [
    new Date('2025-01-27'), // Yesterday
    new Date('2025-01-28'), // Today
    new Date('2025-01-29'), // Tomorrow
    new Date('2025-01-30'), // Day after tomorrow
];

testDates.forEach(date => {
    const baziPillar = getBaziPillarForDate(date);
    console.log(`${date.toISOString().split('T')[0]}: ${baziPillar}`);
});

console.log('\n✅ If the Bazi pillars are different, the forecast will be unique each day!'); 