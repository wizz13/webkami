// Fungsi untuk memulai atau menghentikan pemutaran audio
function togglePlayback() {
  var audio = document.getElementById("bgMusic");
  var button = document.getElementById("musicButton");
  
  if (audio.paused) {
    audio.play();
    button.textContent = "🔊"; // Mengubah ikon tombol menjadi 🔊 ketika audio diputar
  } else {
    audio.pause();
    button.textContent = "🔈"; // Mengubah ikon tombol menjadi 🔈 ketika audio dihentikan
  }
}

// Menambahkan event listener ke tombol untuk memanggil fungsi togglePlayback() ketika tombol diklik
document.getElementById("musicButton").addEventListener("click", togglePlayback);
