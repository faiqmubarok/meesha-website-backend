// Contoh implementasi frontend dengan fetch API

const registerForm = document.getElementById("register-form") as HTMLFormElement;

registerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nameInput = document.getElementById("name") as HTMLInputElement;
  const emailInput = document.getElementById("email") as HTMLInputElement;
  const phoneInput = document.getElementById("phone") as HTMLInputElement;
  const passwordInput = document.getElementById("password") as HTMLInputElement;

  // Validasi form
  if (!nameInput.value || !emailInput.value || !passwordInput.value) {
    displayErrorMessage("Nama, email, dan password wajib diisi.");
    return;
  }

  const registerData = {
    name: nameInput.value,
    email: emailInput.value,
    phone: phoneInput.value,
    password: passwordInput.value,
  };

  try {
    const response = await fetch("http://localhost:3001/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Simpan token ke localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect ke halaman utama atau dashboard
      window.location.href = "/dashboard";
    } else {
      // Tampilkan pesan error dari respons backend
      displayErrorMessage(data.message || "Terjadi kesalahan pada server.");
    }
  } catch (error) {
    console.error("Error during registration:", error);
    displayErrorMessage("Terjadi kesalahan saat mendaftar. Silakan coba lagi.");
  }
});

// Fungsi untuk menampilkan pesan error
function displayErrorMessage(message: string) {
  const errorElement = document.getElementById("error-message");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
}
