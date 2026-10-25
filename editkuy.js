<script>
    /*
      KONFIGURASI PEMILIK:
      1. Ganti nomor di bawah dengan nomor WhatsApp bisnis milikmu.
      2. Gunakan kode negara, tanpa tanda +, spasi, atau tanda hubung.
         Contoh format Indonesia: 6281234567890
      3. Jangan gunakan nomor orang lain tanpa izin.
    */
    const EDITKUY_CONFIG = {
      whatsappNumber: "6281234567890", // GANTI dengan nomor WhatsApp kamu
      businessName: "EditKuy"
    };

    const packagePrices = {
      "Mini Kuy": 15000,
      "Creative Kuy": 35000,
      "Custom Kuy": null
    };

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

    function rupiah(amount) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency", currency: "IDR", maximumFractionDigits: 0
      }).format(amount);
    }

    function showToast(message) {
      toast.textContent = message;
      toast.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
    }

    function validateForm(showMessages = true) {
      const name = fields.name.value.trim();
      const contact = fields.contact.value.trim();
      const service = fields.service.value;
      const pack = fields.pack.value;
      const brief = fields.brief.value.trim();
      const phoneDigits = contact.replace(/[^\d]/g, "");
      const phoneLooksValid = phoneDigits.length >= 9 && phoneDigits.length <= 15;
      const checks = {
        name: name.length >= 2,
        contact: phoneLooksValid,
        service: Boolean(service),
        pack: Boolean(pack),
        brief: brief.length >= 10
      };

      if (showMessages) {
        errors.name.textContent = checks.name ? "" : "Nama minimal 2 karakter.";
        errors.contact.textContent = checks.contact ? "" : "Masukkan nomor kontak yang valid (9–15 digit).";
        errors.service.textContent = checks.service ? "" : "Pilih jenis layanan.";
        errors.pack.textContent = checks.pack ? "" : "Pilih paket.";
        errors.brief.textContent = checks.brief ? "" : "Ceritakan kebutuhanmu minimal 10 karakter.";
      }
      return Object.values(checks).every(Boolean);
    }

    function updateSummary() {
      const name = fields.name.value.trim();
      const service = fields.service.value;
      const pack = fields.pack.value;
      const deadline = fields.deadline.value;
      const budget = fields.budget.value;
      const brief = fields.brief.value.trim();
      const price = packPrices[pack];

      document.getElementById("sumName").textContent = name || "Belum diisi";
      document.getElementById("sumService").textContent = service || "Belum dipilih";
      document.getElementById("sumPackage").textContent = pack || "Belum dipilih";
      document.getElementById("sumDeadline").textContent = deadline ? new Date(deadline + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Belum ditentukan";
      document.getElementById("sumBudget").textContent = budget || "Belum ditentukan";
      document.getElementById("sumBrief").textContent = brief ? (brief.length > 85 ? brief.slice(0, 82) + "…" : brief) : "Belum diisi";
      document.getElementById("sumPrice").textContent = price === null ? "Diskusi" : price ? rupiah(price) : "Rp0";

      const valid = validateForm(false);
      document.getElementById("summaryStatus").textContent = valid ? "Siap dikirim" : "Belum lengkap";
      document.getElementById("summaryStatus").style.background = valid ? "#e8f9ef" : "#fff0b7";
      document.getElementById("summaryStatus").style.color = valid ? "#177846" : "#7d5b00";
      whatsappBtn.disabled = !valid;
    }

    function buildOrderMessage() {
      const price = packagePrices[fields.pack.value];
      return [
        `Halo ${EDITKUY_CONFIG.businessName}, saya ingin memesan layanan kreatif.`,
        "",
        `Nama: ${fields.name.value.trim()}`,
        `Kontak pelanggan: ${fields.contact.value.trim()}`,
        `Layanan: ${fields.service.value}`,
        `Paket: ${fields.pack.value}`,
        `Estimasi harga: ${price === null ? "Diskusi dahulu" : rupiah(price)}`,
        `Target selesai: ${fields.deadline.value || "Fleksibel / dibicarakan"}`,
        `Anggaran: ${fields.budget.value || "Belum ditentukan"}`,
        `Detail kebutuhan: ${fields.brief.value.trim()}`,
        "",
        "Mohon konfirmasi ketersediaan, ruang lingkup pekerjaan, dan harga akhir. Terima kasih!"
      ].join("\n");
    }

    // Filter portofolio
    document.querySelectorAll(".filter-btn").forEach(button => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        document.querySelectorAll(".filter-btn").forEach(item => {
          const active = item === button;
          item.classList.toggle("active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        document.querySelectorAll(".portfolio-item").forEach(item => {
          item.hidden = filter !== "semua" && item.dataset.category !== filter;
        });
      });
    });

    // Pilihan paket otomatis mengisi formulir
    document.querySelectorAll(".choose-package").forEach(button => {
      button.addEventListener("click", () => {
        fields.pack.value = button.dataset.package;
        document.getElementById("pesan").scrollIntoView({ behavior: "smooth" });
        updateSummary();
        showToast(`${button.dataset.package} dipilih. Lengkapi formulir, ya!`);
      });
    });

    // Link layanan mengisi pilihan layanan
    document.querySelectorAll("[data-service]").forEach(link => {
      link.addEventListener("click", () => {
        fields.service.value = link.dataset.service;
        updateSummary();
      });
    });

    // Perbarui ringkasan ketika isi form berubah
    Object.values(fields).forEach(field => {
      field.addEventListener("input", updateSummary);
      field.addEventListener("change", updateSummary);
    });

    form.addEventListener("submit", event => {
      event.preventDefault();
      const valid = validateForm(true);
      updateSummary();
      if (!valid) {
        const firstInvalid = form.querySelector("input:invalid, select:invalid, textarea:invalid");
        if (firstInvalid) firstInvalid.focus();
        showToast("Periksa kembali kolom yang belum benar.");
        return;
      }
      showToast("Ringkasan siap! Kamu bisa mengirimnya ke WhatsApp.");
      document.querySelector(".summary-card").scrollIntoView({ behavior: "smooth", block: "center" });
    });

    form.addEventListener("reset", () => {
      setTimeout(() => {
        Object.values(errors).forEach(error => error.textContent = "");
        updateSummary();
        showToast("Formulir sudah direset.");
      }, 0);
    });

    whatsappBtn.addEventListener("click", () => {
      if (!validateForm(true)) {
        updateSummary();
        showToast("Lengkapi formulir sebelum mengirim.");
        return;
      }
      const number = EDITKUY_CONFIG.whatsappNumber.replace(/[^\d]/g, "");
      if (!number || number === "6281234567890") {
        showToast("Atur nomor WhatsApp bisnis di bagian konfigurasi JavaScript terlebih dahulu.");
        return;
      }
      const url = `https://wa.me/${number}?text=${encodeURIComponent(buildOrderMessage())}`;
      window.open(url, "_blank", "noopener,noreferrer");
    });

    // Batasi tanggal target minimal hari ini
    const today = new Date();
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    fields.deadline.min = localToday;
    document.getElementById("year").textContent = new Date().getFullYear();
    updateSummary();
  </script>
