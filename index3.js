let a = {
    "1": {
        "a": "dest"
    },
    "2": {
        "a": "dest"
    }
};

let c = [...Object.keys(a).slice(0, 3).map(b => { return { [b]: a[b] } })];
console.log(c);