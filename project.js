let array = [];
let sorting = false;
let searching = false;


// Generate new array
function generateArray() {
    const size = parseInt(document.getElementById('size').value);
    const min = parseInt(document.getElementById('min-value').value);
    const max = parseInt(document.getElementById('max-value').value);

    array = Array(size).fill().map(() => 
        Math.floor(Math.random() * (max - min + 1)) + min
    );
    displayArray();
}

// Input custom array
function inputArray() {
    const input = document.getElementById('input-array').value;
    array = input.split(',').map(Number);
    displayArray();
}

// Display array as bars
function displayArray(comparing = [], sorted = [], searchState = '') {
    const container = document.getElementById('array-container');
    container.innerHTML = '';

    const maxValue = Math.max(...array);
    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'bar';

        if (comparing.includes(index)) bar.classList.add('comparing');
        if (sorted.includes(index)) bar.classList.add('sorted');
        if (searchState === 'searching' && comparing.includes(index)) {
            bar.classList.add('searching');
        }
        if (searchState === 'found' && comparing.includes(index)) {
            bar.classList.add('found');
        }

        bar.style.height = `${(value / maxValue) * 100}%`;

        const barValue = document.createElement('div');
        barValue.className = 'bar-value';
        barValue.textContent = value;

        bar.appendChild(barValue);
        container.appendChild(bar);
    });
}

// Delay function for visualization
function delay() {
    const speed = parseFloat(document.getElementById('speed').value);
    return new Promise(resolve => setTimeout(resolve, speed * 1000));
}

// Start sorting based on selected algorithm
async function startSorting() {
    if (sorting) return;
    sorting = true;

    const algorithm = document.getElementById('algorithm').value;
    switch (algorithm) {
        case 'bubble':
            await bubbleSort();
            break;
        case 'insertion':
            await insertionSort();
            break;
        case 'selection':
            await selectionSort();
            break;
        case 'quick':
            await quickSort(0, array.length - 1);
            break;
        case 'merge':
            await mergeSort(0, array.length - 1);
            break;
    }

    displayArray([], [...Array(array.length).keys()]);
    sorting = false;
}

// Bubble Sort
async function bubbleSort() {
    const n = array.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            displayArray([j, j + 1], [...Array(n - i).keys()].map(x => x + n - i));
            await delay();

            if (array[j] > array[j + 1]) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
            }
        }
    }
}

// Insertion Sort
async function insertionSort() {
    const n = array.length;
    for (let i = 1; i < n; i++) {
        let key = array[i];
        let j = i - 1;

        while (j >= 0 && array[j] > key) {
            displayArray([j, j + 1], [...Array(i).keys()]);
            await delay();

            array[j + 1] = array[j];
            j--;
        }
        array[j + 1] = key;
    }
}

// Selection Sort
async function selectionSort() {
    const n = array.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;

        for (let j = i + 1; j < n; j++) {
            displayArray([minIdx, j], [...Array(i).keys()]);
            await delay();

            if (array[j] < array[minIdx]) {
                minIdx = j;
            }
        }

        if (minIdx !== i) {
            [array[i], array[minIdx]] = [array[minIdx], array[i]];
        }
    }
}

// Quick Sort
async function quickSort(low, high) {
    if (low < high) {
        let pi = await partition(low, high);
        await quickSort(low, pi - 1);
        await quickSort(pi + 1, high);
    }
}

async function partition(low, high) {
    let pivot = array[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
        displayArray([j, high], []);
        await delay();

        if (array[j] < pivot) {
            i++;
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    return i + 1;
}

// Merge Sort
async function mergeSort(left, right) {
    if (left < right) {
        const mid = Math.floor((left + right) / 2);
        await mergeSort(left, mid);
        await mergeSort(mid + 1, right);
        await merge(left, mid, right);
    }
}

async function merge(left, mid, right) {
    const n1 = mid - left + 1;
    const n2 = right - mid;

    const L = array.slice(left, mid + 1);
    const R = array.slice(mid + 1, right + 1);

    let i = 0, j = 0, k = left;

    while (i < n1 && j < n2) {
        displayArray([left + i, mid + 1 + j], []);
        await delay();

        if (L[i] <= R[j]) {
            array[k] = L[i];
            i++;
        } else {
            array[k] = R[j];
            j++;
        }
        k++;
    }

    while (i < n1) {
        array[k] = L[i];
        i++;
        k++;
        displayArray([k], []);
        await delay();
    }

    while (j < n2) {
        array[k] = R[j];
        j++;
        k++;
        displayArray([k], []);
        await delay();
    }
}

// Start searching based on selected algorithm
async function startSearch() {
    if (sorting || searching) return;
    searching = true;

    const searchValue = parseInt(document.getElementById('search-value').value);
    const searchType = document.getElementById('search-type').value;
    const resultDiv = document.getElementById('search-result');

    let result;
    if (searchType === 'linear') {
        result = await linearSearch(searchValue);
    } else {
        // For binary search, array needs to be sorted
        if (!isSorted(array)) {
            resultDiv.textContent = 'Array must be sorted for binary search!';
            searching = false;
            return;
        }
        result = await binarySearch(searchValue);
    };
    resultDiv.textContent = result !== -1 ? 
        `Found ${searchValue} at index ${result}` : 
        `${searchValue} not found in array`;

    searching = false;
}

// Linear Search
async function linearSearch(target) {
    const delay = parseFloat(document.getElementById('speed').value) * 1000;

    for (let i = 0; i < array.length; i++) {
        displayArray([i], [], 'searching');
        await new Promise(resolve => setTimeout(resolve, delay));

        if (array[i] === target) {
            displayArray([i], [], 'found');
            return i;
        }
    }
    return -1;
}

// Binary Search
async function binarySearch(target) {
    const delay = parseFloat(document.getElementById('speed').value) * 1000;
    let left = 0;
    let right = array.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        displayArray([mid], [], 'searching');
        await new Promise(resolve => setTimeout(resolve, delay));

        if (array[mid] === target) {
            displayArray([mid], [], 'found');
            return mid;
        }

        if (array[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}

// Helper function to check if array is sorted
function isSorted(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] > arr[i + 1]) return false;
    }
    return true;
}


// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    generateArray();
    document.getElementById('generate').addEventListener('click', generateArray);
    document.getElementById('start').addEventListener('click', startSorting);
    document.getElementById('start-search').addEventListener('click', startSearch);
    document.getElementById('input-array').addEventListener('change', inputArray);
});