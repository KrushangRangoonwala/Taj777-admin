function formatNumber(num) {
    if (num === undefined || num === null || isNaN(num)) {
        return "";
    }
    const n = Number(num);
    if (n >= 100000) {
        // Convert to Lakhs
        return (n / 100000).toFixed(1).replace(/\.0$/, "") + "L";
    } else if (n >= 1000) {
        // Convert to Thousands
        return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    } else {
        // Less than 1000, return as is
        return n.toString();
    }
}

console.log("Testing formatNumber with various inputs:");
console.log("undefined:", formatNumber(undefined));
console.log("null:", formatNumber(null));
console.log("0:", formatNumber(0));
console.log("500:", formatNumber(500));
console.log("1500:", formatNumber(1500));
console.log("120000:", formatNumber(120000));
console.log("NaN:", formatNumber(NaN));
console.log("'1000':", formatNumber('1000'));
console.log("'abc':", formatNumber('abc'));

// Check how it works with fallbacks
console.log("\nFallback checks:");
console.log("undefined || 100:", formatNumber(undefined) || 100);
console.log("null || 100:", formatNumber(null) || 100);
console.log("1200 || 100:", formatNumber(1200) || 100);
