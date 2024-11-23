const proxyUrl = "/proxy?url=";
const targetUrl = "https://results.eci.gov.in/ResultAcGenNov2024/candidateswise-S1393.htm";

async function fetchResults() {
    const url = proxyUrl + encodeURIComponent(targetUrl);

    try {
        const response = await fetch(url);
        const text = await response.text();

        // Parse the HTML response and extract data
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");

        // Extract candidate details (modify selectors as per actual page structure)
        const rows = doc.querySelectorAll("table tr");
        const candidatesDiv = document.getElementById("candidates");
        candidatesDiv.innerHTML = ""; // Clear previous results

        rows.forEach(row => {
            const columns = row.querySelectorAll("td");
            if (columns.length > 0) {
                const candidateName = columns[0].textContent.trim();
                const votes = columns[1].textContent.trim();
                const result = columns[2]?.textContent.trim() || "Pending";

                const candidateInfo = `
                    <p>
                        <strong>${candidateName}</strong>: ${votes} votes (${result})
                    </p>
                `;
                candidatesDiv.innerHTML += candidateInfo;
            }
        });
    } catch (error) {
        console.error("Error fetching results:", error);
        document.getElementById("candidates").innerHTML = "<p>Failed to fetch results. Please try again later.</p>";
    }
}

// Fetch results on page load
fetchResults();

// Refresh results every 60 seconds
setInterval(fetchResults, 60000);
