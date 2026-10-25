
"use strict";

// ========================================
// 1. KONFIGURASI EDITKUY
// ========================================
const EDITKUY_CONFIG = {
  whatsappNumber: "6281234567890", // Ganti dengan nomor WhatsApp bisnis
  businessName: "EditKuy"
};

// Harga setiap paket
const packagePrices = {
  "Mini Kuy": 15000,
  "Creative Kuy": 35000,
  "Custom Kuy": null
};

// ========================================
// 2. MENGAMBIL ELEMEN HTML
// ========================================
const form = document.getElementById("orderForm");

const fields = {
  name: document.getElementById("customerName"),
  contact: document.getElementById("customerContact"),
  service: document.getElementById("service"),
  pack: document.getElementById("package"),
  deadline: document.getElementById("deadline"),
  budget: document.getElementById("budget"),
  brief: document.getElementById("brief")
};

const errors = {
  name: document.getElementById("nameError"),
  contact: document.getElementById("contactError"),
  service: document.getElementById("serviceError"),
  pack: document.getElementById("packageError"),
  brief: document.getElementById("briefError")
};

const whatsappBtn = document.getElementById("whatsappBtn");
const toast = document.getElementById("toast");
let toastTimer;

// Pastikan elemen penting tersedia
if (form && whatsappBtn && toast) {

  // ========================================
  // 3. FUNGSI BANTUAN
  // ========================================

  // Mengubah angka menjadi format rupiah
  function rupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Menampilkan notifikasi kecil
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  // ========================================
  // 4. VALIDASI FORMULIR
  // ========================================
  function validateForm(showMessages = true) {
    const name = fields.name.value.trim();
    const contact = fields.contact.value.trim();
    const service = fields.service.value;
    const pack = fields.pack.value;
    const brief = fields.brief.value.trim();

    // Mengambil angka saja dari nomor kontak
    const phoneDigits = contact.replace(/\D/g, "");

    const checks = {
      name: name.length >= 2,
      contact:
        phoneDigits.length >= 9 &&
        phoneDigits.length <= 15,
      service: Boolean(service),
      pack: Boolean(pack),
      brief: brief.length >= 10
    };

    // Menampilkan pesan kesalahan
    if (showMessages) {
      errors.name.textContent = checks.name
        ? ""
        : "Nama minimal 2 karakter.";

      errors.contact.textContent = checks.contact
        ? ""
        : "Masukkan nomor kontak yang valid (9–15 digit).";

      errors.service.textContent = checks.service
        ? ""
        : "Pilih jenis layanan.";

      errors.pack.textContent = checks.pack
        ? ""
        : "Pilih paket.";

      errors.brief.textContent = checks.brief
        ? ""
        : "Ceritakan kebutuhanmu minimal 10 karakter.";
    }

    // Semua kolom wajib harus valid
    return Object.values(checks).every(Boolean);
  }

  // ========================================
  // 5. MEMPERBARUI RINGKASAN PESANAN
  // ========================================
  function updateSummary() {
    const name = fields.name.value.trim();
    const service = fields.service.value;
    const pack = fields.pack.value;
    const deadline = fields.deadline.value;
    const budget = fields.budget.value;
    const brief = fields.brief.value.trim();

    // FIX: gunakan packagePrices, bukan packPrices
    const price = Object.prototype.hasOwnProperty.call(
      packagePrices,
      pack
    )
      ? packagePrices[pack]
      : 0;

    document.getElementById("sumName").textContent =
      name || "Belum diisi";

    document.getElementById("sumService").textContent =
      service || "Belum dipilih";

    document.getElementById("sumPackage").textContent =
      pack || "Belum dipilih";

    document.getElementById("sumDeadline").textContent =
      deadline
        ? new Date(deadline + "T00:00:00").toLocaleDateString(
            "id-ID",
            {
              day: "numeric",
              month: "long",
              year: "numeric"
            }
          )
        : "Belum ditentukan";

    document.getElementById("sumBudget").textContent =
      budget || "Belum ditentukan";

    document.getElementById("sumBrief").textContent =
      brief
        ? brief.length > 85
          ? brief.slice(0, 82) + "…"
          : brief
        : "Belum diisi";

    document.getElementById("sumPrice").textContent =
      price === null
        ? "Diskusi"
        : rupiah(price);

    // Periksa kelengkapan formulir
    const valid = validateForm(false);
    const status = document.getElementById("summaryStatus");

    status.textContent = valid
      ? "Siap dikirim"
      : "Belum lengkap";

    status.style.background = valid
      ? "#e8f9ef"
      : "#fff0b7";

    status.style.color = valid
      ? "#177846"
      : "#7d5b00";

    // Tombol WhatsApp aktif jika formulir valid
    whatsappBtn.disabled = !valid;
  }

  // ========================================
  // 6. MENYUSUN PESAN WHATSAPP
  // ========================================
  function buildOrderMessage() {
    const price = packagePrices[fields.pack.value];

    return [
      `Halo ${EDITKUY_CONFIG.businessName}, saya ingin memesan layanan kreatif.`,
      "",
      `Nama: ${fields.name.value.trim()}`,
      `Kontak pelanggan: ${fields.contact.value.trim()}`,
      `Layanan: ${fields.service.value}`,
      `Paket: ${fields.pack.value}`,
      `Estimasi harga: ${
        price === null ? "Diskusi dahulu" : rupiah(price)
      }`,
      `Target selesai: ${
        fields.deadline.value || "Fleksibel / dibicarakan"
      }`,
      `Anggaran: ${
        fields.budget.value || "Belum ditentukan"
      }`,
      `Detail kebutuhan: ${fields.brief.value.trim()}`,
      "",
      "Mohon konfirmasi ketersediaan, ruang lingkup pekerjaan, dan harga akhir. Terima kasih!"
    ].join("\n");
  }

  // ========================================
  // 7. FILTER PORTOFOLIO
  // ========================================
  document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      document.querySelectorAll(".filter-btn").forEach(item => {
        const active = item === button;

        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      document.querySelectorAll(".portfolio-item").forEach(item => {
        item.hidden =
          filter !== "semua" &&
          item.dataset.category !== filter;
      });
    });
  });

  // ========================================
  // 8. PILIH PAKET OTOMATIS
  // ========================================
  document.querySelectorAll(".choose-package").forEach(button => {
    button.addEventListener("click", () => {
      fields.pack.value = button.dataset.package;

      document.getElementById("pesan").scrollIntoView({
        behavior: "smooth"
      });

      updateSummary();

      showToast(
        `${button.dataset.package} dipilih. Lengkapi formulir, ya!`
      );
    });
  });

  // ========================================
  // 9. PILIH LAYANAN OTOMATIS
  // ========================================
  document.querySelectorAll("[data-service]").forEach(link => {
    link.addEventListener("click", () => {
      fields.service.value = link.dataset.service;
      updateSummary();
    });
  });

  // ========================================
  // 10. PERBARUI RINGKASAN SAAT FORM DIISI
  // ========================================
  Object.values(fields).forEach(field => {
    field.addEventListener("input", updateSummary);
    field.addEventListener("change", updateSummary);
  });

  // ========================================
  // 11. SAAT FORMULIR DIKIRIM
  // ========================================
  form.addEventListener("submit", event => {
    event.preventDefault();

    const valid = validateForm(true);
    updateSummary();

    if (!valid) {
      // Arahkan pengguna ke kolom yang belum valid
      const firstInvalid = Object.keys(fields).find(key => {
        return errors[key] &&
          errors[key].textContent !== "";
      });

      if (firstInvalid) {
        fields[firstInvalid].focus();
      } else {
        const requiredField = Object.keys(fields).find(key => {
          return !fields[key].value.trim() &&
            ["name", "contact", "service", "pack", "brief"].includes(key);
        });

        if (requiredField) {
          fields[requiredField].focus();
        }
      }

      showToast("Periksa kembali kolom yang belum benar.");
      return;
    }

    showToast(
      "Ringkasan siap! Kamu bisa mengirimnya ke WhatsApp."
    );

    document.querySelector(".summary-card").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  });

  // ========================================
  // 12. RESET FORMULIR
  // ========================================
  form.addEventListener("reset", () => {
    setTimeout(() => {
      Object.values(errors).forEach(error => {
        error.textContent = "";
      });

      updateSummary();
      showToast("Formulir sudah direset.");
    }, 0);
  });

  // ========================================
  // 13. KIRIM PESAN KE WHATSAPP
  // ========================================
  whatsappBtn.addEventListener("click", () => {
    if (!validateForm(true)) {
      updateSummary();
      showToast("Lengkapi formulir sebelum mengirim.");
      return;
    }

    const number = EDITKUY_CONFIG.whatsappNumber.replace(/\D/g, "");

    // Cegah penggunaan nomor contoh
    if (!number || number === "6281234567890") {
      showToast(
        "Atur nomor WhatsApp bisnis di konfigurasi JavaScript terlebih dahulu."
      );
      return;
    }

    const message = encodeURIComponent(buildOrderMessage());
    const url = `https://wa.me/${number}?text=${message}`;

    window.open(url, "_blank", "noopener,noreferrer");
  });

  // ========================================
  // 14. TANGGAL DAN TAHUN OTOMATIS
  // ========================================

  // Target selesai tidak boleh sebelum hari ini
  const today = new Date();

  const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 10);

  fields.deadline.min = localToday;

  // Tahun otomatis di footer
  document.getElementById("year").textContent =
    new Date().getFullYear();

  // Tampilkan ringkasan saat halaman pertama dibuka
  updateSummary();
}
