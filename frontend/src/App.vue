<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import { loadDucks } from './stores/ducks.js'

const route = useRoute()
const router = useRouter()
const isLoading = ref(false)

const isDashboard = computed(() => route.path === '/dashboard')
const isMission = computed(() => ['/catalog', '/analysis', '/capture', '/captured', '/drone', '/map'].includes(route.path))

// Configure router to show loading during transitions
router.beforeEach((to, from, next) => {
  isLoading.value = true
  next()
})

router.afterEach(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 100)
})

onMounted(() => {
  loadDucks()
})
</script>

<template>
  <div class="app-container">
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">Carregando...</p>
    </div>

    <!-- Navigation Bar -->
    <nav v-if="isMission" class="top-nav">
      <div class="nav-content">
        <RouterLink to="/dashboard" class="nav-brand">
          <svg class="brand-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="4" y="4" width="16" height="16" rx="2"/>
            <path d="M9 8h6M9 12h6M9 16h4"/>
          </svg>
          <span class="brand-text">SISTEMA PRIMORDIAL</span>
        </RouterLink>
        
        <div class="nav-links">
          <RouterLink to="/dashboard" class="nav-link">
            <svg class="link-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span class="link-text">Dashboard</span>
          </RouterLink>
          <RouterLink to="/catalog" class="nav-link" :class="{ active: route.path === '/catalog' }">
            <svg class="link-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="4" width="16" height="16" rx="2"/>
              <path d="M9 8h6M9 12h6M9 16h4"/>
            </svg>
            <span class="link-text">Catalogar</span>
          </RouterLink>
          <RouterLink to="/analysis" class="nav-link" :class="{ active: route.path === '/analysis' }">
            <svg class="link-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <span class="link-text">Análise</span>
          </RouterLink>
          <RouterLink to="/capture" class="nav-link" :class="{ active: route.path === '/capture' }">
            <svg class="link-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
            <span class="link-text">Capturar</span>
          </RouterLink>
          <RouterLink to="/captured" class="nav-link" :class="{ active: route.path === '/captured' }">
            <svg class="link-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span class="link-text">Capturados</span>
          </RouterLink>
          <RouterLink to="/drone" class="nav-link" :class="{ active: route.path === '/drone' }">
            <svg class="link-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span class="link-text">Drone</span>
          </RouterLink>
          <RouterLink to="/map" class="nav-link" :class="{ active: route.path === '/map' }">
            <svg class="link-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span class="link-text">Mapa</span>
          </RouterLink>
        </div>
        
      </div>
    </nav>
    
    <RouterView />
  </div>
</template>

<style>
/* CSS Reset */
html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed,
figure, figcaption, footer, header, hgroup,
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}

/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure,
footer, header, hgroup, menu, nav, section {
  display: block;
}

body {
  line-height: 1;
  background-color: #0a0a0a;
}

ol, ul {
  list-style: none;
}

blockquote, q {
  quotes: none;
}

blockquote:before, blockquote:after,
q:before, q:after {
  content: '';
  content: none;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
}

*, *::before, *::after {
  box-sizing: border-box;
}

.app-container {
  min-height: 100vh;
}

.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(20, 20, 20, 0.95);
  border-bottom: 2px solid rgba(220, 38, 38, 0.5);
  backdrop-filter: blur(10px);
  padding: 16px 48px;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #dc2626;
  text-decoration: none;
  font-weight: 900;
  font-size: 18px;
  letter-spacing: 2px;
  transition: all 0.3s;
}

.nav-brand:hover {
  transform: translateY(-2px);
}

.brand-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  color: #dc2626;
  animation: pulse-red 2s ease-in-out infinite;
}

@keyframes pulse-red {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.brand-text {
  font-size: 16px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 10, 10, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-in;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(220, 38, 38, 0.2);
  border-top-color: #dc2626;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  box-shadow: 0 0 20px rgba(220, 38, 38, 0.6);
  margin-bottom: 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.loading-text {
  color: #dc2626;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 15px rgba(220, 38, 38, 0.8);
}

.nav-links {
  display: flex;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  color: #a3a3a3;
  text-decoration: none;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 8px;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.nav-link:hover {
  background: rgba(220, 38, 38, 0.1);
  border-color: rgba(220, 38, 38, 0.3);
  color: #e5e5e5;
}

.nav-link.active {
  background: rgba(220, 38, 38, 0.2);
  border-color: rgba(220, 38, 38, 0.5);
  color: #dc2626;
}

.link-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.link-text {
  font-size: 12px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(220, 38, 38, 0.2);
  border: 1px solid rgba(220, 38, 38, 0.5);
  border-radius: 8px;
  color: #dc2626;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:hover {
  background: rgba(220, 38, 38, 0.3);
  transform: translateX(-4px);
  box-shadow: 0 4px 16px rgba(220, 38, 38, 0.2);
}

.btn-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.btn-text {
  font-size: 12px;
}

@media (max-width: 1024px) {
  .nav-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .nav-links {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  
  .nav-link {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }
  
  .back-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .top-nav {
    padding: 12px 24px;
  }
  
  .link-text {
    display: none;
  }
  
  .nav-link {
    padding: 12px;
  }
  
  .link-icon {
    width: 20px;
    height: 20px;
  }
  
  .brand-text {
    font-size: 12px;
  }
}

</style>
