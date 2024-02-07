const button = document.getElementById("delete-btn");

let val;

// Set an event listener for the button
button.addEventListener('click', () => {
    // Handle button click event here
    val = button.value;
});

export function getVal() {
    return val;
}