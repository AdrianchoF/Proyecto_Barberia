<template>
  <v-container fluid class="py-6">
    <!-- ══════════════════════════════ -->
    <!-- CARD: HEADER                  -->
    <!-- ══════════════════════════════ -->
    <v-card class="brand-card mb-6" elevation="2" rounded="xl">
      <div class="form-header">
        <div class="header-icon"><i class="fas fa-ad"></i></div>
        <div class="flex-grow-1">
          <h2 class="header-title">Cintas Promocionales</h2>
          <p class="header-subtitle">Controla los anuncios y textos que fluyen en la página principal</p>
        </div>
      </div>
    </v-card>

    <v-row v-if="cintaStore.loading" justify="center" class="my-10">
      <v-progress-circular indeterminate color="#ee6f38" size="64"></v-progress-circular>
    </v-row>

    <v-row v-else>
      <v-col v-for="cinta in cintaStore.cintas" :key="cinta.id" cols="12">
        <v-card class="ribbon-card overflow-hidden" elevation="3" rounded="xl">
          <div class="ribbon-header pa-4 d-flex align-center">
            <div class="ribbon-loc-badge">
              <i :class="cinta.ubicacion === 'servicios' ? 'fas fa-concierge-bell' : 'fas fa-box-open'"></i>
              Cinta: {{ cinta.ubicacion.toUpperCase() }}
            </div>
            <v-spacer></v-spacer>
            <v-switch
              v-model="cinta.activo"
              @change="toggleCinta(cinta)"
              color="#ee6f38"
              hide-details
              inset
              :label="cinta.activo ? 'Activada' : 'Desactivada'"
              class="active-switch"
            ></v-switch>
          </div>

          <v-card-text class="pa-6">
            <div class="preview-area mb-4">
              <div class="preview-label">Vista Previa Real</div>
              <div class="promo-ticker-preview" :class="{ 'disabled-ticker': !cinta.activo }">
                <div class="promo-track">
                  <span>{{ cinta.texto }}</span>
                </div>
              </div>
            </div>

            <v-textarea
              v-model="cinta.texto"
              label="Texto de la Cinta"
              variant="outlined"
              rounded="lg"
              color="#ee6f38"
              rows="3"
              counter
              hint="El pipe '|' se usa para separar los anuncios"
              persistent-hint
            ></v-textarea>
          </v-card-text>

          <v-divider></v-divider>
          <v-card-actions class="pa-4 bg-grey-lighten-5">
            <v-spacer></v-spacer>
            <v-btn
              color="#ee6f38"
              variant="flat"
              rounded="lg"
              class="px-8 text-white font-weight-bold"
              :loading="savingId === cinta.id"
              @click="saveCinta(cinta)"
            >
              <i class="fas fa-save mr-2"></i> Guardar Cambios
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar de Éxito -->
    <v-snackbar v-model="snackbar" color="success" rounded="pill" elevation="10">
      <div class="text-center font-weight-bold">
        <i class="fas fa-check-circle mr-2"></i> Cinta actualizada correctamente
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCintaStore } from '@/stores/cintas';

const cintaStore = useCintaStore();
const savingId = ref(null);
const snackbar = ref(false);

onMounted(async () => {
  await cintaStore.getCintas();
});

const toggleCinta = async (cinta) => {
  try {
    await cintaStore.updateCinta(cinta.id, { activo: cinta.activo });
    snackbar.value = true;
  } catch (error) {
    console.error('Error al cambiar estado:', error);
  }
};

const saveCinta = async (cinta) => {
  savingId.value = cinta.id;
  try {
    await cintaStore.updateCinta(cinta.id, { texto: cinta.texto });
    snackbar.value = true;
  } catch (error) {
    console.error('Error al guardar cinta:', error);
  } finally {
    savingId.value = null;
  }
};
</script>

<style scoped>
/* ── Header Principal ── */
.brand-card { border: none; overflow: hidden; }
.form-header {
  display: flex; align-items: center; gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #ee6f38 0%, #d45a22 100%);
  color: white;
}
.header-icon {
  width: 52px; height: 52px; min-width: 52px;
  border-radius: 14px; background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center; font-size: 24px;
}
.header-title { font-size: 1.5rem; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
.header-subtitle { font-size: 0.9rem; margin: 2px 0 0; opacity: 0.9; }

/* ── Ribbon Card ── */
.ribbon-card { border: 1px solid #eee; transition: all 0.3s ease; }
.ribbon-card:hover { border-color: #fde8d8; box-shadow: 0 10px 25px rgba(238, 111, 56, 0.08) !important; }

.ribbon-header { background: #fafafa; border-bottom: 1px solid #f0f0f0; }

.ribbon-loc-badge {
  background: #333; color: white;
  padding: 6px 16px; border-radius: 10px;
  font-size: 0.75rem; font-weight: 800; letter-spacing: 1px;
  display: flex; align-items: center; gap: 8px;
}
.ribbon-loc-badge i { color: #ee6f38; }

.active-switch { transform: scale(0.9); }

/* ── Preview Area ── */
.preview-area { background: #fdfdfd; padding: 16px; border-radius: 16px; border: 1px dashed #ddd; }
.preview-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #999; margin-bottom: 8px; }

.promo-ticker-preview {
  height: 40px;
  overflow: hidden;
  background-color: #ee6f38;
  color: white;
  font-weight: bold;
  white-space: nowrap;
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-size: 14px;
}

.disabled-ticker { background-color: #ccc !important; opacity: 0.5; }

.promo-track {
  display: inline-block;
  padding-left: 20%;
  animation: scroll-left 15s linear infinite;
}

@keyframes scroll-left {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-100%); }
}

.bg-grey-lighten-5 { background: #fafafa !important; }
</style>
