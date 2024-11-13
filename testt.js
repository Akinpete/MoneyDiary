const cleanObject = (obj) => {
    return Object.entries(obj)
        .filter(([key, value]) => {
            if (key === 'today' && value === obj.date?.today) {
                return false; // Remove the 'date.today' field
            }
            if (Array.isArray(value)) {
                return value.length > 0; // Keep non-empty arrays
            }
            if (value instanceof Object) {
                // Recursively clean objects
                return Object.keys(value).length > 0;
            }
            return value !== null && value !== ''; // Exclude null or empty string
        })
        .reduce((acc, [key, value]) => {
            if (value instanceof Object) {
                // If the value is an object, recursively clean it
                acc[key] = cleanObject(value);
            } else {
                acc[key] = value;
            }
            return acc;
        }, {});
};

let obj;

obj = {
    asking_time: '',
    date: {
      today: '2024-11-13T11:59:02.529Z',
      date1: '2024-11-13T11:59:02.529Z',
      date2: ''
    },
    names: [],
    context: 'User is inquiring about their spending for today.'
}

console.log(cleanObject(obj));