import { useState, useEffect } from "react";
import api from "../services/api";
import rrtc from "../assets/rrtc.jpeg";
import { MapPin, Phone, Mail } from "lucide-react";
import { IoMdCheckmarkCircle } from "react-icons/io";
import Select from "react-select";

function KalkulatorPajak() {

  const selectStyles = {
    container: (base) => ({
      ...base,
      width: "100%"
    }),
    menu: (base) => ({
      ...base,
      width: "100%",
      maxWidth: "100%"
    }),
    option: (base) => ({
      ...base,
      whiteSpace: "normal",
      wordBreak: "break-word"
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999
    })
  };

  const [notif, setNotif] = useState({
    show: false,
    message: "",
    exiting: false
  });
  const [jenisPajak, setJenisPajak] = useState("");
  const [jenisPemotongan, setJenisPemotongan] = useState("");
  const [kodeObjekPajak, setKodePajak] = useState("");
  const [gaji, setGaji] = useState("");
  const [iuranPensiun, setIuranPensiun] = useState("");
  const [zakat, setZakat] = useState("");
  const [jenisPTT, setJenisPTT] = useState("");
  const [ptkp, setPtkp] = useState("");
  const [tarif, setTarif] = useState(0);
  const [skema, setSkema] = useState("gross");
  const [pph, setPph] = useState(null);
  const [loading, setLoading] = useState(false);
  const [masaAwal, setMasaAwal] = useState("");
  const [hasilTahunan, setHasilTahunan] = useState(null);
  const [pphTerpotong, setPphTerpotong] = useState("");
  const [masaAkhir, setMasaAkhir] = useState("");
  const [biayaJabatan, setBiayaJabatan] = useState("");
  const [modal, setModal] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
  });

  const [hasil, setHasil] = useState(null);
  const cleanGaji = Number((gaji || "").replace(/\./g, "")) || 0;

  const cleanIuranPensiun = Number((iuranPensiun || "").replace(/\./g, "")) || 0;
  const cleanZakat = Number((zakat || "").replace(/\./g, "")) || 0;

  const [pakaiAkumulasi, setPakaiAkumulasi] = useState(false);
  const [akumulasiBruto, setAkumulasiBruto] = useState("");
  const [golonganPns, setGolonganPns] = useState("");

  const golonganOptions = [
    { value: "1", label: "Golongan I dan II, Tamtama, Bintara" },
    { value: "3", label: "Golongan III, Perwira Pertama" },
    { value: "4", label: "Golongan IV, Perwira Menengah, Perwira Tinggi dan Pejabat Negara" },
  ];

  const [kodeObjekPph42, setKodeObjekPph42] = useState("");
  const [brutoPph42, setBrutoPph42] = useState("");
  const [tarifPph42, setTarifPph42] = useState(0);
  const [tarifBackend, setTarifBackend] = useState(null);
  const [penghasilanTerpotong, setPenghasilanTerpotong] = useState("");
  const [pakaiPenghasilanTerpotong, setPakaiPenghasilanTerpotong] = useState(false);
  const handlePph23 = async () => {
    const bruto = Number((brutoPph23 || "").replace(/\./g, "")) || 0;
    // const tarif = Number(tarifPph23) || 0;

    if (!kodeObjekPph23 || bruto <= 0) {
      showModal("warning", "Form Belum Lengkap", "Lengkapi data PPh 23 terlebih dahulu");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        kode_objek_pajak: kodeObjekPph23,
        gaji: bruto
      }
      const response = await api.post("/pph23", payload);
      const hasil =
        response.data?.data?.hasil_perhitungan ?? response.data?.hasil_perhitungan ?? response.data?.data ?? {};
      const nilaiPph = hasil?.pph23 ?? hasil?.pajak ?? 0;
      setPph(Number(nilaiPph));
      setNotif({
        show: true,
        message: "Perhitungan PPh 23 berhasil",
        exiting: false
      });

      setTimeout(() => {
        setNotif((prev) => ({ ...prev, exiting: true }));
      }, 2500);

      setTimeout(() => {
        setNotif({ show: false, message: "", exiting: false });
      }, 3000);
    } catch (error) {
      console.error("Error menghitung PPh 23:", error);
      showModal("error", "Gagal", "Terjadi kesalahan saat menghitung PPh 23");
    } finally {
      setLoading(false);
    }
  };

  const [kodeObjekPph23, setKodeObjekPph23] = useState("");
  const [brutoPph23, setBrutoPph23] = useState("");
  const [tarifPph23, setTarifPph23] = useState("");

  useEffect(() => {
    setJenisPemotongan("");
    setKodePajak("");
    setGaji("");
    setPtkp("");
    setTarif(0);
    setPph(null);
  }, [jenisPajak]);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka || 0);
  };

  const formatAngka = (value) => {
    const numberString = value.replace(/[^,\d]/g, "").toString();
    const split = numberString.split(",");
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);
    if (ribuan) {
      const separator = sisa ? "." : "";
      rupiah += separator + ribuan.join(".");
    }
    return rupiah;
  };

  const formatPersen = (nilai) => {
    if (!nilai) return "0";
    return Number(nilai);
  };
  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };

  const handleHitung = async () => {
    if (!jenisPajak) {
      showModal("warning", "Form Belum Lengkap", "Pilih jenis pajak terlebih dahulu");
      return;
    }

    if (jenisPajak === "pph21") {
      return handlePph21();
    }

    if (jenisPajak === "pph23") {
      return handlePph23();
    }
    if (jenisPajak === "pph4ayat2") {
      const bruto = Number((brutoPph42 || "").replace(/\./g, "")) || 0;

      if (!kodeObjekPph42 || bruto <= 0) {
        showModal("warning", "Form Belum Lengkap", "Lengkapi data PPh 4(2)");
        return;
      }
      try {
        setLoading(true);
        const payload = {
          kode_objek_pajak: kodeObjekPph42,
          gaji: bruto
        }
        const response = await api.post("/pph4", payload);
        const hasil = response.data?.data?.hasil_perhitungan ?? response.data?.hasil_perhitungan ?? response.data?.data ?? {};
        const nilaiPph = hasil?.["pph4(2)"] ?? 0;
        const tarifBackend = hasil?.tarif ?? 0;
        setPph(Number(nilaiPph));
        setTarifBackend(tarifBackend);
        setNotif({
          show: true,
          message: "Perhitungan PPh 4(2) berhasil",
          exiting: false
        });
        setTimeout(() => {
          setNotif((prev) => ({ ...prev, exiting: true }));
        }, 2500);
        setTimeout(() => {
          setNotif({ show: false, message: "", exiting: false });
        }, 3000);
      } catch (error) {
        console.error("Error menghitung PPh 4(2):", error);
        showModal("error", "Gagal", "Terjadi kesalahan saat menghitung PPh 4(2)");
      } finally {
        setLoading(false);
      }
      return;
    }
  };

  const handlePph21 = async () => {
    if (!jenisPemotongan) {
      showModal("warning", "Form Belum Lengkap", "Pilih jenis pemotongan terlebih dahulu");
      return;
    }
    let payload = {};


    if (jenisPemotongan === "bulanan") {
      if (!kodeObjekPajak || !ptkp || !gaji) {
        showModal("warning", "Form Belum Lengkap", "Lengkapi data bulanan terlebih dahulu");
        return;
      }

      const cleanPenghasilanTerpotong =
        pakaiPenghasilanTerpotong
          ? Number((penghasilanTerpotong || "").replace(/\./g, "")) || 0
          : 0;

      payload = {
        jenis_pemotongan: "bulanan",
        kode_objek_pajak: kodeObjekPajak,
        gaji: cleanGaji,
        ptkp,
        skema,
        penghasilanKenaPPh21: cleanPenghasilanTerpotong,

      };

    }

    else if (jenisPemotongan === "tahunan") {
      if (!ptkp || !gaji || !masaAwal || !masaAkhir) {
        showModal("warning", "Form Belum Lengkap", "Lengkapi data tahunan terlebih dahulu");
        return;
      }
      const cleanPphTerpotong = Number((pphTerpotong || "").replace(/\./g, "")) || 0;
      const cleanBiayaJabatan = Number((biayaJabatan || "").replace(/\./g, "")) || 0;
      const cleanTunjangan = Number((tunjanganPph || "").replace(/\./g, "")) || 0;
      const cleanPremi = Number((premiAsuransi || "").replace(/\./g, "")) || 0;
      const cleanBonus = Number((bonusThr || "").replace(/\./g, "")) || 0;

      payload = {
        jenis_pemotongan: "tahunan",
        gaji: cleanGaji,
        premi: cleanPremi,
        tunjangan: cleanTunjangan,
        bonus: cleanBonus,
        masaAwal: parseInt(masaAwal),
        masaAkhir: parseInt(masaAkhir),
        biayaJabatan: cleanBiayaJabatan,
        iuranPensiun: cleanIuranPensiun,
        zakat: cleanZakat,
        status: ptkp,
        pphTerpotong: cleanPphTerpotong
      };
    }
    else if (jenisPemotongan === "final") {

      if (!cleanGaji || cleanGaji <= 0) {
        showModal("warning", "Form Belum Lengkap", "Penghasilan harus diisi");
        return;
      }

      const cleanAkumulasi =
        pakaiAkumulasi
          ? Number((akumulasiBruto || "").replace(/\./g, "")) || 0
          : 0;

      payload = {
        jenis_pemotongan: "final",
        kode_objek_pajak: kodeObjekPajak,
        penghasilan: cleanGaji,
        akumulasi_bruto: cleanAkumulasi,
        golongan: golonganPns
      };

    }

    else if (jenisPemotongan === "tidak_final") {

      const cleanPenghasilanTerpotong =
        pakaiPenghasilanTerpotong
          ? Number((penghasilanTerpotong || "").replace(/\./g, "")) || 0
          : 0;

      if (!kodeObjekPajak || !gaji) {
        showModal("warning", "Form Belum Lengkap", "Lengkapi data tidak final terlebih dahulu");
        return;
      }

      if (kodeObjekPajak === "2110003" && !jenisPTT) {
        showModal("warning", "Form Belum Lengkap", "Pilih jenis objek pajak terlebih dahulu");
        return;
      }

      const wajibPTKP =
        kodeObjekPajak === "2110010" ||
        (kodeObjekPajak === "2110003" && jenisPTT === "bulanan");

      if (wajibPTKP && !ptkp) {
        showModal("warning", "Form Belum Lengkap", "Status PTKP wajib diisi");
        return;
      }

      payload = {
        jenis_pemotongan: "tidak_final",
        kode_objek_pajak: kodeObjekPajak,
        gaji: cleanGaji,
        skema,
        jenis_ptt: jenisPTT,
        penghasilanKenaPPh21: cleanPenghasilanTerpotong,
      };

      if (wajibPTKP) payload.ptkp = ptkp;

    }

    try {
      setLoading(true);

      let endpoint = "";

      if (jenisPemotongan === "bulanan") endpoint = "/pph21-bulanan";
      else if (jenisPemotongan === "tahunan") endpoint = "/tahunan";
      else if (jenisPemotongan === "final") endpoint = "/pph21-final";
      else if (jenisPemotongan === "tidak_final") endpoint = "/pph21-tidak-final";

      const response = await api.post(endpoint, payload);

      const hasil =
        response.data?.data?.hasil_perhitungan ??
        response.data?.hasil_perhitungan ??
        response.data?.data ??
        {};

      setHasil(hasil);

      setTarif(
        Number(
          hasil?.tarif ??
          hasil?.tarifEfektif ??
          hasil?.tarif_efektif ??
          0
        )
      );
      let nilaiPph = 0;
      if (jenisPemotongan === "tahunan") {
        setHasilTahunan(hasil);

        nilaiPph =
          hasil?.pph21KurangBayar ??
          hasil?.pph21_kurang_bayar ??
          0;
      } else {
        nilaiPph =
          hasil?.pph21Bulanan ??
          hasil?.pph21_bulanan ??
          hasil?.pph21 ??
          hasil?.pajak ??
          0;
      }

      setPph(Number(nilaiPph));


      setNotif({
        show: true,
        message: "Perhitungan berhasil dilakukan",
        exiting: false
      });

      setTimeout(() => {
        setNotif((prev) => ({ ...prev, exiting: true }));
      }, 2500);

      setTimeout(() => {
        setNotif({ show: false, message: "", exiting: false });
      }, 3000);

    } catch (error) {
      console.error("Error menghitung pajak:", error);
      showModal("error", "Gagal", "Terjadi kesalahan saat menghitung pajak");
    } finally {
      setLoading(false);
    }
  };

  const ptkpMapping = {
    "TK/0": 54000000,
    "TK/1": 58500000,
    "TK/2": 63000000,
    "TK/3": 67500000,
    "K/0": 58500000,
    "K/1": 63000000,
    "K/2": 67500000,
    "K/3": 72000000,
  };

  // const ptkpValue = ptkpMapping[ptkp] || 0;


  useEffect(() => {
    setKodeObjekPph23("");
    setBrutoPph23("");
    setTarifPph23("");
  }, [jenisPajak]);

  const cleanPenghasilanTerpotong =
    pakaiPenghasilanTerpotong
      ? Number((penghasilanTerpotong || "").replace(/\./g, "")) || 0
      : 0;

  const [tunjanganPph, setTunjanganPph] = useState("");
  const [premiAsuransi, setPremiAsuransi] = useState("");
  const [bonusThr, setBonusThr] = useState("");

  useEffect(() => {
    setGaji("");
    setPtkp("");
    setTarif(0);
    setPph(null);
    setHasilTahunan(null);
  }, [jenisPemotongan]);

  const objekPph23 = {
    "24-100-01": { nama: "Hadiah, Penghargaan, Bonus dan lainnya Selain yang Telah Dipotong PPh Pasal Ayat(1) Huruf E UU PPh", tarif: 15 },
    "24-100-02": { nama: "Sewa dan Penghasilan Lain Sehubung dengan Penggunaan Harta Kecuali Sewa Tanah dan Bangunan yang Telah DIkenai PPh Pasal 4 Ayat(2) UU PPh", tarif: 2 },
    "24-101-01": { nama: "Dividen", tarif: 15 },
    "24-102-01": { nama: "Bunga Selain yang Dikenakan PPh Pasal 4 ayat (2)", tarif: 15 },
    "24-103-01": { nama: "Royalti", tarif: 15 },

    "24-104-01": { nama: "Jasa Teknik", tarif: 2 },
    "24-104-02": { nama: "Jasa Manajemen", tarif: 2 },
    "24-104-03": { nama: "Jasa Konsultan", tarif: 2 },
    "24-104-04": { nama: "Jasa Penilai (Appraisal)", tarif: 2 },
    "24-104-05": { nama: "Jasa Aktuaris", tarif: 2 },
    "24-104-06": { nama: "Jasa Akutansi, Pembukuan, dan Atestasi Laporan Keuangan", tarif: 2 },
    "24-104-07": { nama: "Jasa Hukum", tarif: 2 },
    "24-104-08": { nama: "Jasa Arsitektur", tarif: 2 },
    "24-104-09": { nama: "Jasa Perencanaan Kota dan Arsitektur Landscape", tarif: 2 },
    "24-104-10": { nama: "Jasa Perancang (Design)", tarif: 2 },
    "24-104-11": { nama: "Jasa Pengeboran Dribling di bidang Penambangan Minyak dan Gas BUmi (Migas) Kecuali yang Dilakukan oleh Badan Usaha Tetap (BUT)", tarif: 2 },
    "24-104-12": { nama: "Jasa Penunjang di Bidang Usaha Panas Bumi dan Penambangan Minyak dan Gas Bumi (Migas)", tarif: 2 },
    "24-104-13": { nama: "Jasa Penambangan dan Jasa Penunjang di Bidang Usaha Panas Bumi dan Penambangan Minyak dan Gas Bumi (Migas)", tarif: 2 },
    "24-104-14": { nama: "Jasa Penunjang di Bidang Penerbangan dan Bandar Udara", tarif: 2 },
    "24-104-15": { nama: "Jasa Penebangan Hutan", tarif: 2 },
    "24-104-16": { nama: "Jasa Pengolahan Limbah", tarif: 2 },
    "24-104-17": { nama: "Jasa Penyedia Tenaga Kerja dan Tenaga Ahli (Outsoircing Service)", tarif: 2 },
    "24-104-18": { nama: "Jasa Perantara dan Keagenan", tarif: 2 },
    "24-104-19": { nama: "Jasa Bidang Perdagangan Surat-Surat Berharga, Kecuali yang Dilakukan Bursa Efek, Kustodian Sentral Efek Indonesia (KSEI) dan Kliring Penjaminan Efek Indonesia (KPEI)", tarif: 2 },
    "24-104-20": { nama: "Jasa Kustodian/Penyimpanan/Penitipan, Kecuali yang Dilakukan Oleh KSEI", tarif: 2 },
    "24-104-21": { nama: "Jasa Pengisian Suara (Dubbing) dan Sulih Suara", tarif: 2 },
    "24-104-22": { nama: "Jasa Mixing Film", tarif: 2 },
    "24-104-23": { nama: "Jasa Pembuatan Sarana Promosi Film, Iklan, Poster, Foto, Slide, Klise, Banner, Pamphlet, Baliho dan Folder", tarif: 2 },
    "24-104-24": { nama: "Jasa Sehubungan Dengan Software Atau Hardware Atau Sistem Komputer, Termasuk Perawatan, Pemeliharaan dan Perbaikan", tarif: 2 },
    "24-104-25": { nama: "Jasa Pembuatan dan Pengelolaan Website", tarif: 2 },
    "24-104-26": { nama: "Jasa Internet Termasuk Sambungannya", tarif: 2 },
    "24-104-27": { nama: "Jasa Penyimpanan, Pengolahan dan Penyaluran Data, Informasi dan Program", tarif: 2 },
    "24-104-28": { nama: "Jasa Instalasi/Pemasangan Mesin, Peralatan Listrik, Telepon, Air, Gas, Ac dan Tv Kabel, Selain Yang dilakukan Oleh Wajib Pajak yang RUang Lingkupnya DiBidang Konstruksi dan Mempunyai izin atau Sertifikasi Sebagai Pengusaha Konstruksi", tarif: 2 },
    "24-104-29": { nama: "Jasa Perawatan/Perbaikan/Pemeliharaan Mesin, Peralatan, Listrik, Telepon, Air, Gas, Ac dan Tv Kabel, Selain Yang Dilakukan Oleh WP yang Ruang Lingkupnya di Bidang Konstruksi dan Mempunyai Izin dan Sertifikat Sebagai Pengusaha Konstruksi", tarif: 2 },
    "24-104-30": { nama: "Jasa Perawatan Kendaraan dan Alat Transportasi Darat, Laut dan Udara", tarif: 2 },
    "24-104-31": { nama: "Jasa Maklon", tarif: 2 },
    "24-104-32": { nama: "Jasa Penyelidikan dan Keamanan", tarif: 2 },
    "24-104-33": { nama: "Jasa Penyelenggara Kegiatan Atau Event Organizer", tarif: 2 },
    "24-104-34": { nama: "Jasa Penyediaan Tempat atau Waktu Dalam Media Massa, Media Luar Ruang Atau Media Lain Untuk Penyampaian Infromasi dan Jasa", tarif: 2 },
    "24-104-35": { nama: "Jasa Pembasmian Hama", tarif: 2 },
    "24-104-36": { nama: "Jasa Kebersihan Atau Cleaning Service", tarif: 2 },
    "24-104-37": { nama: "JAsa Sedot Septic Tank", tarif: 2 },
    "24-104-38": { nama: "Jasa Pemeliharaan Kolam", tarif: 2 },
    "24-104-39": { nama: "Jasa Ketering Atau Tata Boga", tarif: 2 },
    "24-104-40": { nama: "Jasa Freight Forwading", tarif: 2 },
    "24-104-41": { nama: "Jasa Logistik", tarif: 2 },
    "24-104-42": { nama: "Jasa Pengurusan Dokumen", tarif: 2 },
    "24-104-43": { nama: "Jasa Pengepakan", tarif: 2 },
    "24-104-44": { nama: "Jasa Loading dan Unloading", tarif: 2 },
    "24-104-45": { nama: "Jasa Laboratium dan Pengujian Kecuali yang Dilakukan Oleh Lembaga atau Institusi Pendidikan Dalam Rangka Penelitian Akademis", tarif: 2 },
    "24-104-46": { nama: "Jasa Pengelolaan Parkir", tarif: 2 },
    "24-104-47": { nama: "Jasa Penyodiran Tanah", tarif: 2 },
    "24-104-48": { nama: "Jasa Penyiapan dan Pengolahan Lahan", tarif: 2 },
    "24-104-49": { nama: "Jasa Pembibitan dan Penanaman Bibit", tarif: 2 },
    "24-104-50": { nama: "Jasa Pemeliharaan Tanaman", tarif: 2 },
    "24-104-51": { nama: "Jasa Permanen", tarif: 2 },
    "24-104-52": { nama: "Jasa Pengolahan Hasil Pertanian, Perkebunan, Perikanan, Pertenakan dan Perhutanan ", tarif: 2 },
    "24-104-53": { nama: "Jasa Dekorasi", tarif: 2 },
    "24-104-54": { nama: "Jasa Pencetakan/Penerbitan", tarif: 2 },
    "24-104-55": { nama: "Jasa Penerjemah", tarif: 2 },
    "24-104-56": { nama: "Jasa Pengangkutan/Ekspedisi Kecuali Yang Telah Diatur Dalam Pasal 15 Undang-Undang Pajak Penghasilan", tarif: 2 },
    "24-104-57": { nama: "Jasa Pelayanan Pelabuhan", tarif: 2 },
    "24-104-58": { nama: "Jasa Pengangkutan Melalui Jalur Pipa", tarif: 2 },
    "24-104-59": { nama: "Jasa Pengelolaan Penitipan Anak", tarif: 2 },
    "24-104-60": { nama: "Jasa Pelatihan dan Kursus", tarif: 2 },
    "24-104-61": { nama: "Jasa Pengiriman dan Pengisian Uang ke ATM", tarif: 2 },
    "24-104-62": { nama: "Jasa Sertifikasi", tarif: 2 },
    "24-104-63": { nama: "Jasa Survey", tarif: 2 },
    "24-104-64": { nama: "Jasa Tester", tarif: 2 },
    "24-104-65": { nama: "Jasa Selain Jasa-jasa Tersebut di Atas yang Pembayaran DIbebankan pada APBN (Anggaran Pendapatan dan Belanja Negara) Atau APBD (Anggaran Pendapatan dan Belanja Daerah)", tarif: 2 },
    "24-104-66": { nama: "Jasa Penyelenggaraan Layanan Transaksi Pembayaran Terkait dengan Distribusi Token Oleh Penyelenggara Distribusi", tarif: 2 },
    "24-104-67": { nama: "Jasa Pemasaran dengan Media Voucer Oleh Penyelenggara Voucer", tarif: 2 },
    "24-104-68": { nama: "Jasa Penyelenggara Layanan Transaksi Pembayaran Terkait dengan Distribusi Voucer Oleh Penyelenggara Voucer dan Penyelenggara Distribusi", tarif: 2 },
    "24-104-69": { nama: "Jasa Penyelenggara Program Loyalitas dan Penghargaan Pelanggan (Costumer Loyalty/Reward Program) Oleh Penyelenggara Voucer", tarif: 2 },

  };
  const opsiPph23 = Object.entries(objekPph23).map(([kode, data]) => ({
    value: kode,
    label: `${kode} - ${data.nama}`,
    tarif: data.tarif
  }));

  const objekPph42 = {
    "28-401-01": { nama: "Bunga Obligasi, Surat Utang Negara, atau Obligasi Daerah yang Diterima Wajib Pajak Dalam Negeri dan Bentuk Usaha Tetap", tarif: 15 },
    "28-401-02": { nama: "Bunga Obligasi yang Diterima Wajib Pajak Luar Negeri", tarif: 20 },
    "28-401-03": { nama: "Bunga Obligasi yang Diterima Wajib Pajak Dalam Negeri dan Bentuk Usaha Tetap", tarif: 10 },
    "28-401-04": { nama: "Diskonto Surat Perbendaharaan Negara yang diterima Wajib Pajak Dalam Negeri dan Bentuk Usaha Tetap", tarif: 20 },
    "28-401-05": { nama: "Diskonto Surat Perbendaharaan Negara yang diterima Wajib Pajak Luar Negeri", tarif: 20 },
    "28-401-06": { nama: "Bunga Obligasi yang Diterima Wajib Pajak Dalam Negeri dan Bentuk Usaha Tetap", tarif: 10 },
    "28-401-XX": { nama: "Bunga/Diskonto Obligasi Surat Berharga Negara", tarif: 0 },
    "28-402-01": { nama: "Pengalihan Hak atas Tanah dan Bangunan", tarif: 2.50 },
    "28-402-02": { nama: "Pengalihan Rumah Sederhana dan Rumah Susun Sederhana yang Dilakukan WP yang Usaha Pokoknya Mengalihkan Hak atas Tanah dan Bangunan", tarif: 1 },
    "28-402-03": { nama: "Pengalihan Hak atas Tanah dan Bangunan kepada Pemerintah, BUMN yang Mendaoat Penugasan dari Pemerintah, Kepala Daerah, sesuai UU Pengadaan Tanah bagi pembangunan untuk Kepentingan Umum", tarif: 0 },
    "28-403-01": { nama: "Persewaan Tanah dan/atau Bangunan", tarif: 10 },
    "28-403-02": { nama: "Persewaan Tanah dan/atau Bangunan", tarif: 10 },
    "28-404-01": { nama: "Bunga Tabungan dan Bunga Diskonto yang Ditempatkan di Dalam Negeri yang Dananya Bersumber Selain dari Devisa Hasil Ekspor (DHE)", tarif: 20 },
    "28-404-02": { nama: "Bunga Deposito yang Ditempatkan di Dalam Negeri (mata uang IDR bersumber dari DHE tenor 1 bulan)", tarif: 7.50 },
    "28-404-03": { nama: "Bunga Deposito yang Ditempatkan di Dalam Negeri (mata uang IDR bersumber dari DHE tenor 3 bulan)", tarif: 5 },
    "28-404-04": { nama: "Bunga Deposito yang Ditempatkan di Dalam Negeri (mata uang IDR bersumber dari DHE tenor 6 bulan atau lebih)", tarif: 0 },
    "28-404-05": { nama: "Bunga Deposito yang Ditempatkan di Dalam Negeri (mata uang USD bersumber dari DHE tenor 1 bulan)", tarif: 10 },
    "28-404-06": { nama: "Bunga Deposito yang Ditempatkan di Dalam Negeri (mata uang USD bersumber dari DHE tenor 3 bulan)", tarif: 7.50 },
    "28-404-07": { nama: "Bunga Deposito yang Ditempatkan di Dalam Negeri (mata uang USD bersumber dari DHE tenor 6 bulan)", tarif: 2.50 },
    "28-404-08": { nama: "Bunga Deposito yang Ditempatkan di Dalam Negeri (mata uang USD bersumber dari DHE tenor lebih 6 bulan)", tarif: 0 },
    "28-404-09": { nama: "Bunga Deposito/Tabungan yang Ditempatkan di Luar Negeri Melalui Bank yang Didirikan atau Bertempat Kedudukan di Indonesia atau Cabang Bank Luar Negeri di Indonesia", tarif: 20 },
    "28-404-10": { nama: "Diskonto Sertifikat Bank Indonesia", tarif: 20 },
    "28-404-11": { nama: "Jasa Giro", tarif: 20 },
    "28-404-XX": { nama: "Bunga Deposito/Tabungan, Diskonto SBI dan Jasa Giro", tarif: 0 },
    "28-405-01": { nama: "Hadiah Undian (yang diterima Wajib Pajak dalam negeri)", tarif: 25 },
    "28-405-02": { nama: "Hadiah Undian (yang diterima Wajib Pajak luar negeri)", tarif: 25 },
    "28-406-01": { nama: "Transaksi Penjualan Saham di Bursa Efek (Bukan Saham Pendiri)", tarif: 0.10 },
    "28-407-01": { nama: "Transaksi Penjualan Saham di Bursa Efek (Saham Pendiri)", tarif: 0.50 },
    "28-408-01": { nama: "Transaksi Penjualan Saham Milik Perusahaan Modal Ventura Tidak di Bursa Efek", tarif: 0.10 },
    "28-409-15": { nama: "Pekerjaan Konstruksi yang Dilakukan oleh Penyedia Jasa yang Memiliki Sertifikat Badan Usaha Kualifikasi Kecil atau Sertifikat Kompetensi Kerja untuk Usaha Orang Perseorangan (Disetor Sendiri)", tarif: 1.75 },
    "28-409-16": { nama: "Pekerjaan Konstruksi yang DIlakukan oleh Penyedia Jasa yang Tidak Memiliki Sertifikat Badan Usaha Atau Sertifikat Kerja Untuk Orang Perseorangan (Disetor Sendiri)", tarif: 0.04 },
    "28-409-17": { nama: "Pekerjaan Kontruksi yang Dilakukan oleh Penyedia Jasa Memiliki Sertifikat Selain Sertifikat Badan Usaha Kualifikasi Kecil atau Sertifikat Kompetensi Kerja untuk Usaha Orang Perseorangan (Dosetor Sendiri)", tarif: 2.65 },
    "28-409-18": { nama: "Pekerjaan Kontruksi Terintergrasi yang Dilakukan oleh Penyedia Jasa yang Tidak Memiliki Sertifikat Kompetensi untuk Usaha Orang Perseorangan (Disetor Sendiri)", tarif: 2.65 },
    "28-409-19": { nama: "Pekerjaan Kontruksi Terintergrasi yang Dilakukan oleh Penyedia Jasa yang Tidak Memiliki Sertifikat Badan Usaha (Disetor Sendiri)", tarif: 4 },
    "28-409-20": { nama: "Jasa Konsultansi Kontruksi yang Dilakukan oleh Penyedia Jasa yang Memliki Sertifikat Kompetensi Kerja untuk Usaha Orang Perseorangan (Disetor Sendiri)", tarif: 3.50 },
    "28-409-21": { nama: "Jasa Konsultansi Kontruksi yang Dilakukan oleg Penyedia Jasa yang Tidak Memiliki Sertifikat Badan Usaha atau Sertifikat Kompetensi Kerja untuk Usaha Orang Perseorangan (Disetor Sendiri) ", tarif: 6 },
    "28-409-22": { nama: "Pekerjaan Kontruksi yang Dilakukan oleh Penyedia Jasa yang Memiliki Sertifikat Badan Usaha Kualifikasi Kecil atau Sertifikat Kompetensi Kerja untuk Usaha Orang Perseorangan", tarif: 1.75 },
    "28-409-23": { nama: "Pekerjaan Konstruksi yang Dilakukan Oleh Penyedia Jasa yang Tidak Memiliki Sertifikat Badan Usaha Atau Sertifikat KOmpetensi Kerja Untuk Usaha Orang Perseorangan", tarif: 4 },
    "28-409-24": { nama: "Pekerjaan Konstruksi yang Dilakukan oleh Penyedia Jasa yang Memiliki Sertifikat Selain Sertifikat Badan Usaha Kualifikasi Kecil atau Sertifikat KOmpetensi Kerja untuk Usaha Orang Perseorangan", tarif: 2.65 },
    "28-409-25": { nama: "Pekerjaan Kontruksi Terintergrasi yang Dilakukan Oleg Penyedia Jasa yang memiliki Sertifikat Badan Usaha", tarif: 2.65 },
    "28-409-26": { nama: "Pekerjaan Kontruksi Terintergrasi yang Dilakukan oleh Penyedia Jasa yang Tidak Memiliki Sertifikat Badan Usaha", tarif: 4 },
    "28-409-27": { nama: "Jasa Konsultansi Kontruksi yang Dilakukan oleh Penyedia Jasa Memiliki Sertifikat Badan Usaha atau sertifikat Kompetensi Kerja untuk Usaha Orang Perseorangan", tarif: 3.50 },
    "28-409-28": { nama: "Jasa Konsultansi Kontruksi yang Dilakukan oleh Penyedia Jasa yang Tidak Memiliki Sertifikat Badan Usaha atau Sertifikat Kompetensi untuk Usaha Orang Perseorangan", tarif: 6 },
    "28-417-01": { nama: "Bunga Simpanan yang Dibayarkan oleh Koperasi kepada Anggota Wajib Pajak Orang Pribadi (bunga sampai dengan Rp24.000,00)", tarif: 0 },
    "28-417-02": { nama: "Bunga Simpanan yang Dibayarkan oleh Koperasi kepada Anggota Wajib Pajak Orang Pribadi (bunga di atas Rp24.000,00)", tarif: 10 },
    "28-419-01": { nama: "Dividen yang Diterima/Diperoleh Wajib Pajak Orang Pribadi Dalam Negeri", tarif: 0 },
    "28-421-01": { nama: "Uplift Hulu Migas", tarif: 20 },
    "28-421-02": { nama: "Participating Interest Eksplorasi Hulu Migas", tarif: 5 },
    "28-421-03": { nama: "Participating Interest Eksploitasi Hulu Migas", tarif: 7 },
    "28-421-04": { nama: "Participating Interest Ekplorasi Hulu Migas", tarif: 5 },
    "28-421-05": { nama: "Participating Interest Eksploitasi Hulu Migas", tarif: 7 },
    "28-423-01": { nama: "Transaksi dengan Wajib Pajak yang menggunakan tarif Peraturan Pemertintah Nomor 23 Tahun 2018 dan/atau peraturan Pemerintah Nomor 55 Tahun 2022", tarif: 0.50},
    "28-423-02": { nama: "Pemotongan atau pemungutan PPh atas transaksi pembelian yang dilakukan oleh Wajib Pajak dengan Peredaran bruto tertentu sesuai dengan peraturan Pemerintahan Nomor 55 Tahun 2022" , tarif: 0},
    "28-423-03": { nama: "Transaksi dengan Wajib Pajak orang pribadi yang memiliki peredaran bruto tertentu sesuai PP 55 Tahun 2022 dengan peredaran usaha s.d 500 juta" , tarif: 0},
    "28-423-12": { nama: "Pemotongan/Pemungutan PPh atas transaksi penjualan atau penyerahan jasa yang di lakukan oleh Wajib Pajak yang memenuhi persyaratan tertentu untuk di kenai PPh yang bersifat final dengan tarif 0% di IKN (PPh UMKM di IKN)", tarif: 0},
    "28-423-13": { nama: "Pemotongan/Pemungutan PPh atas transaksi pembelian yang di lakukan oleh Wajib Pajak yang memanfaatkan fasilitasa PPh final dengan tarif 0% di IKN (PPh UMKM di IKN)", tarif: 0},
    "28-499-02": { nama: "Penghasilan yang Diterima atau Diperoleh Sehubungan dengan Kerja Sama dengan Lembaga Pengelola Investasi (LPI)", tarif: 7.50},
 
  };
  const opsiPph42 = Object.entries(objekPph42).map(([kode, data]) => ({
    value: kode,
    label: `${kode} - ${data.nama}`,
    tarif: data.tarif
  }));

  useEffect(() => {
    setKodeObjekPph42("");
    setBrutoPph42("");
    setTarifPph42(0);
  }, [jenisPajak]);


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      <div className="bg-blue-950 text-blue-100 text-xs">
        <div className="max-w-7xl mx-auto px-8 py-2 flex justify-between">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>Jl. S. Supriadi No.136, Kota Blitar</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} />
              <span>0821 4242 2828</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} />
              <span>admin@rrtc.com</span>
            </div>
          </div>
        </div>
      </div>

      <header className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center gap-4">
          <div className="bg-white p-2 rounded-xl shadow-md">
            <img src={rrtc} className="w-12 h-12 object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-bold">RRTC.ID</h1>
            <p className="text-sm text-blue-200">Sistem Perhitungan PPh 21</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-8 py-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <label className="text-xs text-gray-500">Jenis Pajak</label>
            <select
              value={jenisPajak}
              onChange={(e) => setJenisPajak(e.target.value)}
              className="w-full border rounded-md p-2 mt-1 mb-4 text-sm"
            >
              <option value="">Pilih Jenis Pajak</option>
              <option value="pph21">PPh 21</option>
              <option value="pph23">PPh 23</option>
              <option value="pph4ayat2">PPh 4 (2)</option>

            </select>

            {jenisPajak === "pph21" && (
              <>
                <label className="text-xs text-gray-500">
                  Jenis Pemotongan
                </label>
                <select
                  value={jenisPemotongan}
                  onChange={(e) => setJenisPemotongan(e.target.value)}
                  className="w-full border rounded-md p-2 mt-1 mb-4 text-sm"
                >
                  <option value="">Pilih Jenis Pemotongan</option>
                  <option value="bulanan">Bulanan</option>
                  <option value="tahunan">Tahunan</option>
                  <option value="final">Final</option>
                  <option value="tidak_final">Tidak Final</option>
                </select>
              </>
            )}


            {jenisPemotongan === "tidak_final" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1">
                      Kode Objek Pajak
                    </label>
                    <select
                      value={kodeObjekPajak}
                      onChange={(e) => {
                        setKodePajak(e.target.value);
                        setPtkp("");
                        setJenisPTT("");
                      }}
                      className="w-full border rounded-md p-2 text-sm"
                    >
                      <option value="">Pilih Kode Pajak</option>
                      <option value="2110003">21-100-03 - Pegawai Tidak Tetap</option>
                      <option value="2110004">21-100-04 - Distributor Pemasaran Berjenjang</option>
                      <option value="2110005">21-100-05 - Agen Asuransi </option>
                      <option value="2110006">21-100-06 - Penjaja Barang Dagangan</option>
                      <option value="2110007">21-100-07 - Tenaga Ahli</option>
                      <option value="2110008">21-100-08 - Seniman</option>
                      <option value="2110009">21-100-09 - Bukan Pegawai Lainnya</option>
                      <option value="2110010">21-100-10 - Imbalan Tidak Teratur Dewan Komisaris / Pengawas</option>
                      <option value="2110011">21-100-11 - Bonus / Tantiem untuk Mantan Pegawai</option>
                      <option value="2110012">21-100-12 - Pegawai yang melakukan Penarikan Uang Pensiun</option>
                      <option value="2110013">21-100-13 - Peserta Kegiatan</option>
                    </select>
                  </div>

                  {kodeObjekPajak === "2110003" && (
                    <div>
                      <label className="text-xs text-gray-500 mb-1">
                        Jenis Objek Pajak
                      </label>
                      <select
                        value={jenisPTT}
                        onChange={(e) => setJenisPTT(e.target.value)}
                        className="w-full border rounded-md p-2 text-sm"
                      >
                        <option value="">Pilih Jenis Objek Pajak</option>
                        <option value="harian">Upah Pegawai Tidak Tetap Non Bulanan</option>
                        <option value="bulanan">Upah Pegawai Tidak Tetap Bulanan</option>
                      </select>
                    </div>
                  )}

                  {(kodeObjekPajak === "2110010" ||
                    (kodeObjekPajak === "2110003" && jenisPTT === "bulanan")) && (
                      <div>
                        <label className="text-xs text-gray-500 mb-1">
                          Status PTKP
                        </label>
                        <select
                          value={ptkp}
                          onChange={(e) => setPtkp(e.target.value)}
                          className="w-full border rounded-md p-2 text-sm"
                        >
                          <option value="">Pilih Status PTKP</option>
                          {Object.keys(ptkpMapping).map((key) => (
                            <option key={key} value={key}>
                              {key} - {ptkpMapping[key].toLocaleString("id-ID")}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                </div>

                {kodeObjekPajak === "2110010" && (
                  <div className="flex gap-2 mt-4 mb-4">
                    <button
                      onClick={() => setSkema("gross")}
                      className={`flex-1 py-2 rounded-md text-xs ${skema === "gross"
                        ? "bg-blue-800 text-white"
                        : "bg-gray-200"
                        }`}
                    >
                      Gross
                    </button>
                    <button
                      onClick={() => setSkema("grossUp")}
                      className={`flex-1 py-2 rounded-md text-xs ${skema === "grossUp"
                        ? "bg-blue-800 text-white"
                        : "bg-gray-200"
                        }`}
                    >
                      Gross Up
                    </button>
                  </div>
                )}

                {/* Penghasilan */}
                <label className="text-xs text-gray-500 mt-4">
                  Penghasilan
                </label>
                <input
                  type="text"
                  value={gaji}
                  onChange={(e) => setGaji(formatAngka(e.target.value))}
                  className="w-full border rounded-md p-2 mt-1 mb-3 text-sm"
                />

                {/* Tambahan untuk Komisaris */}
                {kodeObjekPajak === "2110010" && (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={pakaiPenghasilanTerpotong}
                        onChange={(e) =>
                          setPakaiPenghasilanTerpotong(e.target.checked)
                        }
                      />
                      <label className="text-xs text-gray-500">
                        Ada penghasilan yang telah dipotong PPh21 sebelumnya
                      </label>
                    </div>

                    {pakaiPenghasilanTerpotong && (
                      <>
                        <label className="text-sm">
                          Penghasilan yang telah dipotong PPh21 pada masa pajak yang sama
                        </label>

                        <input
                          type="text"
                          value={penghasilanTerpotong}
                          onChange={(e) =>
                            setPenghasilanTerpotong(formatAngka(e.target.value))
                          }
                          className="w-full border rounded-md p-2 mt-1 mb-4 text-sm"
                        />
                      </>
                    )}
                  </>
                )}
              </>
            )}
            {jenisPemotongan === "bulanan" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div className="flex flex-col">
                    <label className="text-xs text-gray-500 mb-1">
                      Kode Objek Pajak
                    </label>
                    <select
                      value={kodeObjekPajak}
                      onChange={(e) => setKodePajak(e.target.value)}
                      className="w-full border rounded-md p-2 text-sm"
                    >
                      <option value="">Pilih Kode Objek Pajak</option>
                      <option value="2110001">21-100-1 Pegawai Tetap</option>
                      <option value="2110002">21-100-2 Penerima Pensiun Berkala</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs text-gray-500 mb-1">
                      Status PTKP
                    </label>
                    <select
                      value={ptkp}
                      onChange={(e) => setPtkp(e.target.value)}
                      className="w-full border rounded-md p-2 text-sm"
                    >
                      <option value="">Pilih Status PTKP</option>
                      {Object.keys(ptkpMapping).map((key) => (
                        <option key={key} value={key}>
                          {key} - {ptkpMapping[key].toLocaleString("id-ID")}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                <label className="text-xs text-gray-500 mt-4">
                  Gaji  Bulanan
                </label>
                <input
                  type="text"
                  value={gaji}
                  onChange={(e) => setGaji(formatAngka(e.target.value))}
                  className="w-full border rounded-md p-2 mt-1 mb-4 text-sm"
                />
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={pakaiPenghasilanTerpotong}
                    onChange={(e) => setPakaiPenghasilanTerpotong(e.target.checked)}
                  />
                  <label className="text-xs text-gray-500">
                    Ada penghasilan yang telah dipotong PPh21 sebelumnya
                  </label>
                </div>
                {pakaiPenghasilanTerpotong && (
                  <>
                    <label className="text-sm">
                      Penghasilan yang telah dipotong PPh21 pada masa pajak yang sama
                    </label>

                    <input
                      type="text"
                      value={penghasilanTerpotong}
                      onChange={(e) => setPenghasilanTerpotong(formatAngka(e.target.value))}
                      className="w-full border rounded-md p-2 mt-1 mb-4 text-sm"
                    />
                  </>
                )}

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setSkema("gross")}
                    className={`flex-1 py-2 rounded-md text-xs ${skema === "gross"
                      ? "bg-blue-800 text-white"
                      : "bg-gray-200"
                      }`}
                  >
                    Gross
                  </button>
                  <button
                    onClick={() => setSkema("grossUp")}
                    className={`flex-1 py-2 rounded-md text-xs ${skema === "grossUp"
                      ? "bg-blue-800 text-white"
                      : "bg-gray-200"
                      }`}
                  >
                    Gross Up
                  </button>
                </div>
              </>
            )}

            {jenisPemotongan === "tahunan" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className="text-xs text-gray-500 mb-1">
                      Status PTKP
                    </label>
                    <select
                      value={ptkp}
                      onChange={(e) => setPtkp(e.target.value)}
                      className="w-full border rounded-md p-2 text-sm mb-4"
                    >
                      <option value="">Pilih Status PTKP</option>
                      {Object.keys(ptkpMapping).map((key) => (
                        <option key={key} value={key}>
                          {key} - {ptkpMapping[key].toLocaleString("id-ID")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mt-4">
                      Gaji/Pensiunan/Bruto
                    </label>
                    <input
                      type="text"
                      value={gaji}
                      onChange={(e) => setGaji(formatAngka(e.target.value))}
                      className="w-full border rounded-md p-2 mt-1 mb-4 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div>
                    <label className="text-xs text-gray-500">
                      Tunjangan PPh
                    </label>
                    <input
                      type="text"
                      value={tunjanganPph}
                      onChange={(e) => setTunjanganPph(formatAngka(e.target.value))}
                      className="w-full border rounded-md p-2 mt-1 mb-4 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">
                      Premi Asuransi
                    </label>
                    <input
                      type="text"
                      value={premiAsuransi}
                      onChange={(e) => setPremiAsuransi(formatAngka(e.target.value))}
                      className="w-full border rounded-md p-2 mt-1 mb-4 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">
                      Bonus / THR / Natura
                    </label>
                    <input
                      type="text"
                      value={bonusThr}
                      onChange={(e) => setBonusThr(formatAngka(e.target.value))}
                      className="w-full border rounded-md p-2 mt-1 mb-4 text-sm"
                    />
                  </div>

                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">
                      Iuran Pensiun
                    </label>
                    <input
                      type="text"
                      value={iuranPensiun}
                      onChange={(e) => setIuranPensiun(formatAngka(e.target.value))}
                      className="w-full border rounded-md p-2 mt-1 mb-4 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">
                      Biaya Jabatan
                    </label>
                    <input
                      type="text"
                      value={biayaJabatan}
                      onChange={(e) => setBiayaJabatan(formatAngka(e.target.value))}
                      className="w-full border rounded-md p-2 mt-1 mb-4 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">
                      Zakat
                    </label>
                    <input
                      type="text"
                      value={zakat}
                      onChange={(e) => setZakat(formatAngka(e.target.value))}
                      className="w-full border rounded-md p-2 mt-1 mb-4 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">
                      Pph 21 Sudah Terpotong
                    </label>
                    <input
                      type="text"
                      value={pphTerpotong}
                      onChange={(e) => setPphTerpotong(formatAngka(e.target.value))}
                      className="w-full border rounded-md p-2 mt-1 mb-4 text-sm"
                    />
                  </div>


                </div>


                <div className="mb-4">
                  <label className="text-gray-500 text-xs">Masa Penghasilan</label>
                  <div className="mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <select
                        value={masaAwal}
                        onChange={(e) => setMasaAwal(e.target.value)}
                        className="w-full border rounded-md p-2 text-sm"
                      >
                        <option value="">Masa Awal</option>
                        <option value="1">Januari</option>
                        <option value="2">Februari</option>
                        <option value="3">Maret</option>
                        <option value="4">April</option>
                        <option value="5">Mei</option>
                        <option value="6">Juni</option>
                        <option value="7">Juli</option>
                        <option value="8">Agustus</option>
                        <option value="9">September</option>
                        <option value="10">Oktober</option>
                        <option value="11">November</option>
                        <option value="12">Desember</option>
                      </select>

                      <select
                        value={masaAkhir}
                        onChange={(e) => setMasaAkhir(e.target.value)}
                        className="w-full border rounded-md p-2 text-sm"
                      >
                        <option value="">Masa Akhir</option>
                        <option value="1">Januari</option>
                        <option value="2">Februari</option>
                        <option value="3">Maret</option>
                        <option value="4">April</option>
                        <option value="5">Mei</option>
                        <option value="6">Juni</option>
                        <option value="7">Juli</option>
                        <option value="8">Agustus</option>
                        <option value="9">September</option>
                        <option value="10">Oktober</option>
                        <option value="11">November</option>
                        <option value="12">Desember</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}
            {jenisPajak === "pph21" && jenisPemotongan && (
              <>
                {jenisPemotongan && (
                  <>
                    {jenisPemotongan === "final" && (
                      <>
                        <label className="text-xs text-gray-500">Kode Objek Pajak</label>
                        <select
                          value={kodeObjekPajak}
                          onChange={(e) => {
                            setKodePajak(e.target.value);
                            setPakaiAkumulasi(false);
                            setAkumulasiBruto("");
                            setGolonganPns("");
                          }}
                          className="w-full border rounded-md p-2 text-sm"
                        >
                          <option value="">Pilih Kode Pajak</option>
                          <option value="2140101">
                            21-401-01 Uang Pesangon yang Dibayarkan Sekaligus
                          </option>

                          <option value="2140102">
                            21-401-02 Uang Manfaat Pensiun, Tunjangan Hari Tua
                          </option>

                          <option value="2140201">
                            21-402-01 Honor PNS / TNI / POLRI (APBN/APBD)
                          </option>
                        </select>

                        <label className="text-xs text-gray-500 mt-4">Penghasilan Bruto</label>
                        <input
                          type="text"
                          value={gaji}
                          onChange={(e) => setGaji(formatAngka(e.target.value))}
                          className="w-full border rounded-md p-2 mt-1 mb-3 text-sm"
                        />

                        {/* KHUSUS 2140101 & 2140102 */}
                        {(kodeObjekPajak === "2140101" || kodeObjekPajak === "2140102") && (
                          <>
                            <div className="flex items-center gap-2 mb-2">
                              <input
                                type="checkbox"
                                checked={pakaiAkumulasi}
                                onChange={(e) => setPakaiAkumulasi(e.target.checked)}
                              />
                              <label className="text-xs text-gray-500">
                                Akumulasi Penghasilan Bruto Sebelumnya
                              </label>
                            </div>

                            {pakaiAkumulasi && (
                              <>
                                <label className="text-sm ">
                                  Akumulasi Penghasilan Bruto Sebelumnya
                                </label>
                                <input
                                  type="text"
                                  value={akumulasiBruto}
                                  onChange={(e) => setAkumulasiBruto(formatAngka(e.target.value))}
                                  className="w-full border rounded-md p-2 mt-1 mb-3 text-sm"
                                />
                              </>
                            )}
                          </>
                        )}


                        {kodeObjekPajak === "2140201" && (
                          <>
                            <label className="text-xs text-gray-500 mt-3">
                              Golongan
                            </label>
                            <Select
                              options={golonganOptions}
                              placeholder="Pilih Golongan"
                              isSearchable
                              className="w-full text-sm mb-4"
                              menuPortalTarget={document.body}
                              styles={selectStyles}
                              onChange={(selected) => {
                                setGolonganPns(selected?.value || "")
                              }}
                            />
                          </>
                        )}
                      </>
                    )}
                    <button
                      onClick={handleHitung}
                      disabled={loading}
                      className="w-full bg-blue-900 hover:bg-blue-950 text-white py-2 rounded-md text-sm font-semibold"
                    >
                      {loading ? "Memproses..." : "Hitung Pajak"}
                    </button>
                  </>
                )}
              </>


            )}





            {jenisPajak === "pph23" && (
              <>
                <label className="text-xs text-gray-500">Kode Objek Pajak</label>
                <Select
                  options={opsiPph23}
                  placeholder="Pilih Kode Objek Pajak"
                  isSearchable
                  className="w-full text-sm mb-4"
                  menuPortalTarget={document.body}
                  styles={selectStyles}
                  onChange={(selected) => {
                    setKodeObjekPph23(selected?.value || "");
                    setTarifPph23(selected?.tarif || 0);
                  }}
                />
                <label className="text-xs text-gray-500">Penghasilan Bruto</label>
                <input
                  type="text"
                  value={brutoPph23}
                  onChange={(e) => setBrutoPph23(formatAngka(e.target.value))}
                  className="w-full border rounded-md p-2 mt-1 mb-4 text-sm"
                />

                <label className="text-xs text-gray-500">Tarif (%)</label>
                <input
                  type="text"
                  value={`${tarifPph23}%`}
                  readOnly
                  className="w-full border rounded-md p-2 mt-1 mb-4 text-sm bg-gray-100"
                />

                <button
                  onClick={handleHitung}
                  disabled={loading}
                  className="w-full bg-blue-900 hover:bg-blue-950 text-white py-2 rounded-md text-sm font-semibold"
                >
                  {loading ? "Memproses..." : "Hitung Pajak"}
                </button>
              </>
            )}

            {jenisPajak === "pph4ayat2" && (
              <>
                <label className="text-xs text-gray-500">Kode Objek Pajak</label>
                <Select
                  options={opsiPph42}
                  placeholder="Pilih Kode Objek Pajak"
                  isSearchable
                  className="w-full border rounded-md p-2 mt-1 mb-4 text-sm"
                  menuPortalTarget={document.body}
                  styles={selectStyles}
                  onChange={(val) => {
                    setKodeObjekPph42(val?.value);
                    setTarifPph42(val?.tarif);
                  }}
                />

                <label className="text-xs text-gray-500">Penghasilan Bruto</label>
                <input
                  type="text"
                  value={brutoPph42}
                  onChange={(e) => setBrutoPph42(formatAngka(e.target.value))}
                  className="w-full border rounded-md p-2 mt-1 mb-4 text-sm"
                />

                <label className="text-xs text-gray-500">Tarif</label>
                <input
                  value={`${tarifPph42}%`}
                  readOnly
                  className="w-full border rounded-md p-2 mt-1 mb-4 text-sm bg-gray-100"
                />

                <button
                  onClick={handleHitung}
                  disabled={loading}
                  className="w-full bg-blue-900 hover:bg-blue-950 text-white py-2 rounded-md text-sm font-semibold"
                >
                  {loading ? "Memproses..." : "Hitung Pajak"}
                </button>
              </>
            )}
          </div>


          {jenisPajak === "pph21" && (
            <div className="bg-white rounded-lg shadow-sm border p-6 w-full max-w-full">
              <h3 className="text-sm font-semibold text-gray-700 mb-5">
                Ringkasan
              </h3>

              {pph === null && !loading ? (
                <p className="text-xs text-gray-400">
                  Hasil akan muncul setelah perhitungan
                </p>
              ) : (
                <>
                  <div className="space-y-2 text-xs mb-4">

                    <div className="flex justify-between">
                      <span>Jenis Pemotongan</span>
                      <span className="capitalize font-medium">{jenisPemotongan}</span>
                    </div>

                    {jenisPemotongan === "bulanan" && (
                      <>
                        <div className="flex justify-between">
                          <span>DPP</span>
                          <span>{formatRupiah(hasil?.dpp ?? 0)}</span>
                        </div>

                        {(kodeObjekPajak === "2101005" || kodeObjekPajak === "2101003") && pakaiPenghasilanTerpotong && (
                          <div className="flex justify-between text-gray-600">
                            <span>Penghasilan Telah Dipotong</span>
                            <span>{formatRupiah(cleanPenghasilanTerpotong)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Tarif Efektif</span>
                          <span>{formatPersen(tarif)}</span>
                        </div>
                      </>
                    )}

                    {jenisPemotongan === "tahunan" && hasilTahunan && (
                      <>
                        <div className="flex justify-between">
                          <span>Penghasilan Bruto</span>
                          <span>{formatRupiah(hasilTahunan.bruto)}</span>
                        </div>

                        <div className="flex justify-between">
                          <span>Pengurangan</span>
                          <span>{formatRupiah(hasilTahunan.pengurangan)}</span>
                        </div>

                        <div className="flex justify-between">
                          <span>Penghasilan Netto</span>
                          <span>{formatRupiah(hasilTahunan.netto)}</span>
                        </div>

                        {/* <div className="flex justify-between">
            <span>PPh Pasal 21 Terutang</span>
            <span>{formatRupiah(hasilTahunan.pph21Terutang)}</span>
          </div> */}
                        <div className="flex justify-between">
                          <span>PPh Pasal 21 Sudah Dipotong</span>
                          <span>{formatRupiah(hasilTahunan.pph21SudahDipotong)}</span>
                        </div>


                      </>
                    )}

                    {jenisPemotongan === "final" && (
                      <>
                        <div className="flex justify-between">
                          <span>DPP</span>
                          <span>{formatRupiah(hasil?.dpp ?? 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tarif</span>
                          <span>{formatPersen(tarif)}</span>
                        </div>
                      </>
                    )}

                    {jenisPemotongan === "tidak_final" && (
                      <>
                        <div className="flex justify-between">
                          <span>DPP</span>
                          <span>{formatRupiah(hasil?.dpp)}</span>
                        </div>

                        <div className="flex justify-between">
                          <span>Tarif</span>
                          <span>{formatPersen(hasil?.tarif)}</span>
                        </div>

                      </>
                    )}
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-4 text-center">
                    <p className="text-xs text-gray-500">
                      {jenisPajak === "pph21" ? "PPh 21" : "PPh 23"}
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatRupiah(pph)}
                    </p>
                  </div>
                </>
              )}

            </div>
          )}

          {jenisPajak === "pph23" && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-5">
                Ringkasan
              </h3>

              {pph === null && !loading ? (
                <p className="text-xs text-gray-400">
                  Hasil akan muncul setelah perhitungan
                </p>
              ) : (
                <>
                  <div className="space-y-2 text-xs mb-4">

                    <div className="flex justify-between">
                      <span>Kode Objek Pajak</span>
                      <span className="font-medium">{kodeObjekPph23}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Penghasilan Bruto</span>
                      <span>{formatRupiah(Number((brutoPph23 || "").replace(/\./g, "")))}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Tarif</span>
                      <span>{(Number(tarifPph23)/100).toFixed(2)}</span>
                    </div>

                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">PPh 23 </p>
                    <p className="text-lg font-bold text-blue-900">
                      {formatRupiah(pph)}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
          {jenisPajak === "pph4ayat2" && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-5">
                Ringkasan
              </h3>

              {pph === null && !loading ? (
                <p className="text-xs text-gray-400">
                  Hasil akan muncul setelah perhitungan
                </p>
              ) : (
                <>
                  <div className="space-y-2 text-xs mb-4">


                    <div className="flex justify-between">
                      <span className="font-semibold">Jenis Pemotongan</span>
                      <span className="font-medium">PPh 4(2)</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Penghasilan Bruto</span>
                      <span>
                        {formatRupiah(
                          Number((brutoPph42 || "").replace(/\./g, ""))
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Tarif</span>
                      <span>
                        {tarifBackend !== null ? tarifBackend : tarifPph42}
                      </span>
                    </div>

                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">PPh 4(2)</p>
                    <p className="text-lg font-bold text-blue-900">
                      {formatRupiah(pph)}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {modal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h2 className="text-lg font-semibold mb-2">{modal.title}</h2>
            <p className="text-sm text-gray-600 mb-5">{modal.message}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setModal({ ...modal, open: false })}
                className="px-4 py-2 bg-blue-900 text-white text-sm rounded-md"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {notif.show && (
        <div
          className={`fixed top-5 right-5 bg-blue-400 text-white px-4 py-3 rounded-lg shadow-lg text-sm
    flex items-center gap-2
    ${notif.exiting ? "animate-slideOut" : "animate-slideIn"}`}
        >
          <IoMdCheckmarkCircle size={20} className="shrink-0" />
          <span>{notif.message}</span>
        </div>
      )}
    </div>
  );
}

export default KalkulatorPajak;