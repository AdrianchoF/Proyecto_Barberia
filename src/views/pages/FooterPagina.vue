<template>
  <footer class="footer-modern">
    <v-container class="py-16">
      <v-row>
        <!-- Columna 1: Branding y Redes -->
        <v-col cols="12" md="4" class="mb-8 mb-md-0">
          <div class="footer-branding">
            <img src="/imagenes/logo/logo2.png" alt="Logo" class="footer-logo mb-6" />
            <p class="footer-about">
              Expertos en el arte de la barbería tradicional con un toque moderno. 
              Más que un corte, una experiencia de estilo completa.
            </p>
            <div class="social-icons-row mt-6">
              <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
              <a href="#" class="social-link"><i class="fab fa-facebook-f"></i></a>
              <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
              <a href="#" class="social-link"><i class="fab fa-whatsapp"></i></a>
            </div>
          </div>
        </v-col>

        <!-- Columna 2: Enlaces Rápidos -->
        <v-col cols="12" sm="6" md="4" class="mb-8 mb-md-0 d-flex justify-md-center">
          <div class="footer-links">
            <h4 class="footer-title">ENLACES RÁPIDOS</h4>
            <ul class="footer-nav">
              <li><a href="#servicios-section">NUESTROS SERVICIOS</a></li>
              <li><a href="#barberos-section">NUESTRO EQUIPO</a></li>
              <li><a href="#productos-section">GALERÍA DE PRODUCTOS</a></li>
              <li><a href="#ubicacion-section">¿DÓNDE ESTAMOS?</a></li>
              <li><a href="/login1">MI CUENTA</a></li>
            </ul>
          </div>
        </v-col>

        <!-- Columna 3: Contacto -->
        <v-col cols="12" sm="6" md="4">
          <div class="footer-contact">
            <h4 class="footer-title">ATENCIÓN AL CLIENTE</h4>
            <ul class="contact-list">
              <li>
                <i class="fas fa-phone-alt"></i>
                <span>+57 333 7206 604</span>
              </li>
              <li>
                <i class="fas fa-envelope"></i>
                <span>contacto@stylehub.com</span>
              </li>
              <li>
                <i class="fas fa-map-marker-alt"></i>
                <span>Calle 25 # 12-34 Barrio El Recreo, Montería - Colombia</span>
              </li>
              <li>
                <i class="fas fa-calendar-check"></i>
                <span>Lunes - Sábado: 8:00 AM - 8:30 PM</span>
              </li>
              <li>
                <i class="fas fa-calendar-check"></i>
                <span>Domingo: 8:00 AM - 2:00 PM</span>
              </li>
            </ul>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Barra de Copyright -->
    <div class="footer-bottom">
      <v-container>
        <div class="d-flex flex-column flex-sm-row align-center gap-4">
          <span class="copyright">© 2026 StyleHub Barber Shop. Todos los derechos reservados.</span>
          <div class="legal-links">
            <span class="mx-2 desktop-only text-grey-darken-2">|</span>
            <a href="#">Privacidad</a>
            <span class="mx-2">|</span>
            <a href="#">Términos</a>
          </div>
        </div>
      </v-container>
    </div>
  </footer>
</template>

<script setup>
// No logic needed for this redesigned static footer
</script>

<style scoped>
.footer-modern {
  background-color: #0d0d0d;
  color: #fff;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-family: 'Outfit', sans-serif;
}

.footer-logo {
  height: 60px;
  width: auto;
}

.footer-about {
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.8;
  font-size: 15px;
  max-width: 350px;
}

.footer-title {
  color: #ee6f38;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: 1px;
  margin-bottom: 30px;
  text-transform: uppercase;
}

.footer-nav, .contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-nav li {
  margin-bottom: 15px;
}

.footer-nav a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.footer-nav a:hover {
  color: #ee6f38;
  padding-left: 8px;
}

.contact-list li {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
}

.contact-list i {
  color: #ee6f38;
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.social-icons-row {
  display: flex;
  gap: 15px;
}

.social-link {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.social-link:hover {
  background: #ee6f38;
  color: white;
  transform: translateY(-5px);
  border-color: #ee6f38;
}

.footer-bottom {
  background-color: #0a0a0a;
  padding: 25px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.copyright {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.legal-links a {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  transition: color 0.3s ease;
}

.legal-links a:hover {
  color: #ee6f38;
}

@media (max-width: 600px) {
  .footer-title {
    margin-bottom: 20px;
  }
}
</style>