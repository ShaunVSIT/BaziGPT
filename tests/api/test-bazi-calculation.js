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
        "Jia": "Yang Wood (甲)", "Yi": "Yin Wood (乙)",
        "Bing": "Yang Fire (丙)", "Ding": "Yin Fire (丁)",
        "Wu": "Yang Earth (戊)", "Ji": "Yin Earth (己)",
        "Geng": "Yang Metal (庚)", "Xin": "Yin Metal (辛)",
        "Ren": "Yang Water (壬)", "Gui": "Yin Water (癸)"
    };

    const branchMap = {
        "Zi": "Zi (子)", "Chou": "Chou (丑)", "Yin": "Yin (寅)", "Mao": "Mao (卯)",
        "Chen": "Chen (辰)", "Si": "Si (巳)", "Wu": "Wu (午)", "Wei": "Wei (未)",
        "Shen": "Shen (申)", "You": "You (酉)", "Xu": "Xu (戌)", "Hai": "Hai (亥)"
    };

    const element = elementMap[stem] || "Yang Fire (丙)";
    const branchWithChar = branchMap[branch] || branch;

    return `${element} over ${branchWithChar}`;
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