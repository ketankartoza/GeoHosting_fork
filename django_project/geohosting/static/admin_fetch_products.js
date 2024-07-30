// static/admin_custom.js
document.addEventListener('DOMContentLoaded', function() {
    const fetchDataButton = document.getElementById('fetch-data-button');
    if (fetchDataButton) {
        fetchDataButton.addEventListener('click', function() {
            fetchDataButton.disabled = true;
            fetch('/api/fetch-products/', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                window.location.reload()
            })
            .catch(error => {
                console.error(error);
            });
        });
    }
});

