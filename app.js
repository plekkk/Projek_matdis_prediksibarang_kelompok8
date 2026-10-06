/* =====================================================
   SISTEM PREDIKSI STOK BARANG
   ===================================================== */


/* ================= DATA ================= */

const STORAGE_KEY = "prediksiStokData";

let currentResult = null;
let selectedRating = 0;


/* ================= DEFAULT DATA ================= */

function getAllData() {

    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
        return {};
    }

    try {
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}


function saveAllData(data) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}


/* ================= NAVIGATION ================= */

const allNavigationButtons =
    document.querySelectorAll("[data-view]");


allNavigationButtons.forEach(button => {

    button.addEventListener("click", () => {

        const target = button.dataset.view;

        showView(target);

    });

});


function showView(viewName) {

    /* Sembunyikan semua halaman */

    document.querySelectorAll(".view").forEach(view => {

        view.classList.remove("active");

    });


    /* Tampilkan halaman yang dipilih */

    const targetView =
        document.getElementById(`view-${viewName}`);

    if (targetView) {

        targetView.classList.add("active");

    }


    /* Atur menu atas */

    document.querySelectorAll(".top-item").forEach(item => {

        item.classList.remove("active");

    });


    const topButton =
        document.querySelector(
            `.top-item[data-view="${viewName}"]`
        );

    if (topButton) {

        topButton.classList.add("active");

    }


    /* Atur sidebar */

    document.querySelectorAll(".side-item").forEach(item => {

        item.classList.remove("active");

    });


    const sideButton =
        document.querySelector(
            `.side-item[data-view="${viewName}"]`
        );

    if (sideButton) {

        sideButton.classList.add("active");

    }


    /* Refresh data sesuai halaman */

    if (viewName === "beranda") {

        updateDashboard();

    }

    if (viewName === "dataLama") {

        renderHistory();

    }

}


/* ================= BUSINESS ================= */

const businessType =
    document.getElementById("businessType");

const historyBusiness =
    document.getElementById("historyBusiness");


businessType.addEventListener("change", () => {

    updateHomeBusiness();

});


historyBusiness.addEventListener("change", () => {

    renderHistory();

});


function getCurrentBusiness() {

    return businessType.value;

}


function updateHomeBusiness() {

    document.getElementById("homeBusiness").textContent =
        getCurrentBusiness();

}


/* ================= CALCULATE ================= */

document
    .getElementById("calculateBtn")
    .addEventListener("click", calculatePrediction);


function calculatePrediction() {

    const business =
        businessType.value;

    const itemName =
        document.getElementById("itemName").value.trim();

    const initialStock =
        Number(
            document.getElementById("initialStock").value
        );

    const salesPercent =
        Number(
            document.getElementById("salesPercent").value
        );

    const incomingStock =
        Number(
            document.getElementById("incomingStock").value
        );

    const periodType =
        document.getElementById("periodType").value;

    const periodCount =
        Number(
            document.getElementById("periodCount").value
        );


    /* VALIDASI */

    if (!itemName) {

        showToast("Nama barang belum diisi.");

        return;

    }


    if (
        !Number.isFinite(initialStock) ||
        initialStock < 0
    ) {

        showToast("Stok awal tidak valid.");

        return;

    }


    if (
        !Number.isFinite(salesPercent) ||
        salesPercent < 0 ||
        salesPercent > 100
    ) {

        showToast(
            "Persentase penjualan harus 0 sampai 100%."
        );

        return;

    }


    if (
        !Number.isFinite(incomingStock) ||
        incomingStock < 0
    ) {

        showToast("Jumlah barang masuk tidak valid.");

        return;

    }


    if (
        !Number.isInteger(periodCount) ||
        periodCount < 1
    ) {

        showToast("Jumlah periode minimal 1.");

        return;

    }


    /* PERSENTASE MENJADI DESIMAL */

    const r =
        salesPercent / 100;


    let stock =
        initialStock;


    const results = [];


    /* LOOP REKURENSI */

    for (
        let period = 1;
        period <= periodCount;
        period++
    ) {

        const stockBefore =
            stock;


        const sales =
            Math.round(
                stockBefore * r
            );


        let finalStock =
            Math.round(
                stockBefore -
                sales +
                incomingStock
            );


        if (finalStock < 0) {

            finalStock = 0;

        }


        results.push({

            period: period,

            label:
                getPeriodLabel(
                    periodType,
                    period
                ),

            stockBefore:
                Math.round(stockBefore),

            sales:
                Math.round(sales),

            incoming:
                Math.round(incomingStock),

            finalStock:
                Math.round(finalStock)

        });


        stock =
            finalStock;

    }


    currentResult = {

        id: Date.now(),

        business,

        itemName,

        initialStock:
            Math.round(initialStock),

        salesPercent,

        incomingStock:
            Math.round(incomingStock),

        periodType,

        periodCount,

        finalStock:
            Math.round(stock),

        results,

        createdAt:
            new Date().toISOString()

    };


    displayResult(currentResult);

}


/* ================= PERIOD LABEL ================= */

function getPeriodLabel(type, number) {

    if (type === "daily") {

        return `Hari ${number}`;

    }


    if (type === "weekly") {

        return `Minggu ${number}`;

    }


    if (type === "monthly") {

        const months = [

            "Januari",
            "Februari",
            "Maret",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Agustus",
            "September",
            "Oktober",
            "November",
            "Desember"

        ];


        const currentMonth =
            new Date().getMonth();


        const index =
            (
                currentMonth +
                number -
                1
            ) % 12;


        return months[index];

    }


    if (type === "yearly") {

        return `Tahun ${new Date().getFullYear() + number - 1}`;

    }


    return `Periode ${number}`;

}


/* ================= DISPLAY RESULT ================= */

function displayResult(data) {

    document
        .getElementById("resultContainer")
        .classList.remove("hidden");


    document
        .getElementById("resultTitle")
        .textContent =
        `${data.itemName} - ${data.business}`;


    document
        .getElementById("resultInitial")
        .textContent =
        formatNumber(data.initialStock);


    document
        .getElementById("resultSales")
        .textContent =
        `${data.salesPercent}%`;


    document
        .getElementById("resultIncoming")
        .textContent =
        formatNumber(data.incomingStock);


    document
        .getElementById("resultFinal")
        .textContent =
        formatNumber(data.finalStock);


    renderPredictionTable(data.results);

    renderRecurrence(data);

    drawChart(data.results);


    /* Scroll ke hasil */

    setTimeout(() => {

        document
            .getElementById("resultContainer")
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    }, 100);

}


/* ================= TABLE ================= */

function renderPredictionTable(results) {

    const table =
        document.getElementById("predictionTable");


    table.innerHTML = "";


    results.forEach(result => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>${result.label}</strong>
            </td>

            <td>
                ${formatNumber(result.stockBefore)}
            </td>

            <td>
                ${formatNumber(result.sales)}
            </td>

            <td>
                ${formatNumber(result.incoming)}
            </td>

            <td>
                ${formatNumber(result.finalStock)}
            </td>

        `;


        table.appendChild(row);

    });

}


/* ================= RECURRENCE ================= */

function renderRecurrence(data) {

    const container =
        document.getElementById(
            "recurrenceSteps"
        );


    container.innerHTML = "";


    data.results.forEach(result => {

        const step =
            document.createElement("div");


        step.className =
            "recurrence-step";


        step.innerHTML = `

            <b>${result.label}</b> :

            S = (1 − ${data.salesPercent / 100})
            × ${formatNumber(result.stockBefore)}
            + ${formatNumber(result.incoming)}

            =

            <strong>
                ${formatNumber(result.finalStock)}
            </strong>

        `;


        container.appendChild(step);

    });

}


/* ================= CHART ================= */

function drawChart(results) {

    const canvas =
        document.getElementById("stockChart");


    const ctx =
        canvas.getContext("2d");


    const rect =
        canvas.getBoundingClientRect();


    const ratio =
        window.devicePixelRatio || 1;


    canvas.width =
        rect.width * ratio;


    canvas.height =
        250 * ratio;


    ctx.scale(ratio, ratio);


    const width =
        rect.width;


    const height =
        250;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    if (!results.length) {
        return;
    }


    const values =
        results.map(
            result => result.finalStock
        );


    const maxValue =
        Math.max(
            ...values,
            1
        );


    const padding = 35;


    const chartWidth =
        width - padding * 2;


    const chartHeight =
        height - padding * 2;


    /* GRID */

    ctx.strokeStyle =
        "rgba(148,163,184,0.10)";

    ctx.lineWidth = 1;


    for (
        let i = 0;
        i <= 4;
        i++
    ) {

        const y =
            padding +
            (
                chartHeight *
                i /
                4
            );


        ctx.beginPath();

        ctx.moveTo(
            padding,
            y
        );

        ctx.lineTo(
            width - padding,
            y
        );

        ctx.stroke();

    }


    /* LINE */

    ctx.beginPath();


    results.forEach(
        (result, index) => {

            const x =
                padding +
                (
                    index /
                    Math.max(
                        results.length - 1,
                        1
                    )
                ) *
                chartWidth;


            const y =
                height -
                padding -
                (
                    result.finalStock /
                    maxValue
                ) *
                chartHeight;


            if (index === 0) {

                ctx.moveTo(x, y);

            } else {

                ctx.lineTo(x, y);

            }

        }
    );


    ctx.strokeStyle =
        "#3b82f6";

    ctx.lineWidth = 3;

    ctx.stroke();


    /* POINT */

    results.forEach(
        (result, index) => {

            const x =
                padding +
                (
                    index /
                    Math.max(
                        results.length - 1,
                        1
                    )
                ) *
                chartWidth;


            const y =
                height -
                padding -
                (
                    result.finalStock /
                    maxValue
                ) *
                chartHeight;


            ctx.beginPath();

            ctx.arc(
                x,
                y,
                4,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                "#38bdf8";

            ctx.fill();

        }
    );


    /* LABEL */

    ctx.fillStyle =
        "#64748b";

    ctx.font =
        "10px Segoe UI";


    results.forEach(
        (result, index) => {

            if (
                results.length <= 10 ||
                index === 0 ||
                index === results.length - 1
            ) {

                const x =
                    padding +
                    (
                        index /
                        Math.max(
                            results.length - 1,
                            1
                        )
                    ) *
                    chartWidth;


                ctx.fillText(
                    result.label,
                    x - 15,
                    height - 8
                );

            }

        }
    );

}


/* ================= SAVE ================= */

document
    .getElementById("savePredictionBtn")
    .addEventListener(
        "click",
        savePrediction
    );


function savePrediction() {

    if (!currentResult) {

        showToast(
            "Belum ada hasil prediksi."
        );

        return;

    }


    const allData =
        getAllData();


    const business =
        currentResult.business;


    if (!allData[business]) {

        allData[business] = [];

    }


    allData[business].push(
        currentResult
    );


    saveAllData(allData);


    showToast(
        "Data prediksi berhasil disimpan."
    );


    updateDashboard();

}


/* ================= HISTORY ================= */

function renderHistory() {

    const business =
        historyBusiness.value;


    const allData =
        getAllData();


    const records =
        allData[business] || [];


    const container =
        document.getElementById(
            "historyContainer"
        );


    container.innerHTML = "";


    if (!records.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div>📭</div>

                <h3>Belum Ada Data</h3>

                <p>
                    Belum ada data prediksi untuk
                    ${business}.
                </p>

            </div>

        `;

        return;

    }


    records
        .slice()
        .reverse()
        .forEach(record => {

            const item =
                document.createElement("div");


            item.className =
                "history-item";


            const date =
                new Date(
                    record.createdAt
                );


            item.innerHTML = `

                <div class="history-top">

                    <h3>
                        📦 ${escapeHTML(record.itemName)}
                    </h3>

                    <span>
                        ${date.toLocaleDateString("id-ID")}
                    </span>

                </div>


                <div class="history-details">

                    <div class="history-detail">

                        <span>Usaha</span>

                        <strong>
                            ${escapeHTML(record.business)}
                        </strong>

                    </div>


                    <div class="history-detail">

                        <span>Stok Awal</span>

                        <strong>
                            ${formatNumber(record.initialStock)}
                        </strong>

                    </div>


                    <div class="history-detail">

                        <span>Periode</span>

                        <strong>
                            ${record.periodCount}
                            ${getPeriodName(record.periodType)}
                        </strong>

                    </div>


                    <div class="history-detail">

                        <span>Stok Akhir</span>

                        <strong>
                            ${formatNumber(record.finalStock)}
                        </strong>

                    </div>

                </div>

            `;


            container.appendChild(item);

        });

}


function getPeriodName(type) {

    if (type === "daily") {
        return "hari";
    }

    if (type === "weekly") {
        return "minggu";
    }

    if (type === "monthly") {
        return "bulan";
    }

    if (type === "yearly") {
        return "tahun";
    }

    return "periode";

}


/* ================= DELETE BUSINESS ================= */

document
    .getElementById("clearBusinessBtn")
    .addEventListener(
        "click",
        deleteBusinessData
    );


function deleteBusinessData() {

    const business =
        historyBusiness.value;


    const allData =
        getAllData();


    if (
        !allData[business] ||
        allData[business].length === 0
    ) {

        showToast(
            `Belum ada data ${business}.`
        );

        return;

    }


    const confirmed =
        confirm(
            `Hapus semua data prediksi untuk ${business}?`
        );


    if (!confirmed) {
        return;
    }


    delete allData[business];


    saveAllData(allData);


    renderHistory();

    updateDashboard();


    showToast(
        `Data ${business} berhasil dihapus.`
    );

}


/* ================= DASHBOARD ================= */

function updateDashboard() {

    const allData =
        getAllData();


    const currentBusiness =
        getCurrentBusiness();


    const records =
        allData[currentBusiness] || [];


    let total = 0;


    Object.values(allData)
        .forEach(records => {

            total += records.length;

        });


    document
        .getElementById("totalData")
        .textContent = total;


    document
        .getElementById("businessCount")
        .textContent =
        Object.keys(allData).length || 1;


    document
        .getElementById("homeBusiness")
        .textContent =
        currentBusiness;


    if (records.length) {

        const latest =
            records[records.length - 1];


        document
            .getElementById("lastPrediction")
            .textContent =
            formatNumber(
                latest.finalStock
            );

    } else {

        document
            .getElementById("lastPrediction")
            .textContent =
            "-";

    }


    renderRecentActivity(
        records
    );

}


function renderRecentActivity(records) {

    const container =
        document.getElementById(
            "recentActivity"
        );


    if (!records.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div>📭</div>

                <p>Belum ada aktivitas.</p>

                <small>
                    Silakan lakukan perhitungan stok terlebih dahulu.
                </small>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    records
        .slice(-5)
        .reverse()
        .forEach(record => {

            const date =
                new Date(
                    record.createdAt
                );


            const item =
                document.createElement("div");


            item.className =
                "activity-item";


            item.innerHTML = `

                <div class="activity-icon">
                    📦
                </div>

                <div>

                    <strong>
                        ${escapeHTML(record.itemName)}
                    </strong>

                    <small>
                        Prediksi stok:
                        ${formatNumber(record.finalStock)}
                        ·
                        ${date.toLocaleDateString("id-ID")}
                    </small>

                </div>

            `;


            container.appendChild(item);

        });

}


/* ================= RATING ================= */

document
    .querySelectorAll("#stars button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                selectedRating =
                    Number(
                        button.dataset.rating
                    );


                document
                    .querySelectorAll("#stars button")
                    .forEach(star => {

                        const rating =
                            Number(
                                star.dataset.rating
                            );


                        star.classList.toggle(
                            "active",
                            rating <= selectedRating
                        );

                    });

            }
        );

    });


document
    .getElementById("sendRatingBtn")
    .addEventListener(
        "click",
        sendRating
    );


function sendRating() {

    if (selectedRating === 0) {

        showToast(
            "Silakan pilih rating terlebih dahulu."
        );

        return;

    }


    const name =
        document
            .getElementById("ratingName")
            .value
            .trim();


    const evaluation =
        document
            .getElementById("ratingText")
            .value
            .trim();


    const suggestion =
        document
            .getElementById("ratingSuggestion")
            .value
            .trim();


    const message =

`📋 PENILAIAN SISTEM PREDIKSI STOK

⭐ Rating: ${selectedRating}/5

👤 Nama:
${name || "-"}

📝 Penilaian:
${evaluation || "-"}

💡 Saran:
${suggestion || "-"}`;


    /*
       GANTI NOMOR INI DENGAN NOMOR WHATSAPP
       PENGELOLA SISTEM.
       
       Format:
       628xxxxxxxxxx
       
       Jangan menggunakan +.
    */

    const whatsappNumber =
        "62895326891406";


    const url =
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;


    window.open(
        url,
        "_blank"
    );

}


/* ================= UTILITIES ================= */

function formatNumber(number) {

    return Number(
        number
    ).toLocaleString(
        "id-ID"
    );

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 2500);

}


/* ================= INITIALIZE ================= */

updateDashboard();

updateHomeBusiness();

renderHistory();
