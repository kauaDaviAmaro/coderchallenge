<template>
  <div class="loading-screen" :class="{ 'redirecting': isRedirecting }">
    <div class="loading-overlay" v-if="showOverlay">
      <div class="overlay-content">
        <div class="spinner"></div>
        <p>Redirecionando...</p>
      </div>
    </div>
    
    <div class="content-wrapper">
      <div class="prompt-header">
        <span class="prompt-text">linux@system:~$</span>
        <div class="status-lights">
          <span class="light"></span>
          <span class="light"></span>
          <span class="light"></span>
        </div>
      </div>
      
      <div class="terminal-output">
        <div class="terminal-line" v-for="(line, index) in lines" :key="index" :style="{ animationDelay: `${index * 0.05}s` }">
          <span class="prompt">{{ line.prompt }}</span>
          <span class="command">{{ line.command }}</span>
          <span class="cursor" v-if="index === lines.length - 1 && !isTyping">█</span>
        </div>
        
        <div class="loading-ascii" v-if="lines.length > 8">
          <pre class="ascii-art">{{ asciiArt }}</pre>
        </div>
      </div>
      
      <div class="progress-bar-container" v-if="progress < 100">
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import '../assets/css/loading.css'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const lines = ref([])
const progress = ref(0)
const isTyping = ref(true)
const isRedirecting = ref(false)
const showOverlay = ref(false)
const asciiArt = ref('')

const linuxASCII = `  _     _   _  ___    _     __  
 / \\   | \\ | |/ _ \\  / \\   / /  
 | |   |  \\| | | | |/ _ \\ / /_  
 | |_  | |\\  | |_| / ___ \\ '_ \\ 
  \\__/ |_| \\_|\\___/_/   \\_\\___/ 
`

const commands = [
  { prompt: 'root@system:~#', command: 'dmesg --level=emerg,alert,crit,err' },
  { prompt: 'root@system:~#', command: '[   0.123456] Linux version 6.0.0' },
  { prompt: 'root@system:~#', command: '[   0.234567] Command line: BOOT_IMAGE=/boot/vmlinuz' },
  { prompt: 'root@system:~#', command: '[   0.345678] BIOS-provided physical RAM map:' },
  { prompt: 'root@system:~#', command: '[   0.456789] initramfs' },
  { prompt: 'root@system:~#', command: '[   1.234567] Freeing unused kernel memory: 1234K' },
  { prompt: 'root@system:~#', command: '[   2.345678] systemd[1]: System initialization complete' },
  { prompt: 'root@system:~#', command: '[   3.456789] systemd[1]: Started network manager' },
  { prompt: 'root@system:~#', command: '[   4.567890] systemd[1]: Started graphical target' },
  { prompt: 'linux@system:~$', command: 'echo "System ready"' },
  { prompt: 'linux@system:~$', command: 'System ready' },
]

onMounted(() => {
  let index = 0
  
  // Progress bar animation
  const progressInterval = setInterval(() => {
    if (progress.value < 95) {
      progress.value += Math.random() * 3
      if (progress.value > 95) progress.value = 95
    }
  }, 200)
  
  const addLine = () => {
    if (index < commands.length) {
      lines.value.push(commands[index])
      index++
      
      // Update progress
      const baseProgress = (index / commands.length) * 80
      if (index === commands.length) {
        progress.value = 100
        isTyping.value = false
        
        // Show ASCII art after last line
        setTimeout(() => {
          let asciiIndex = 0
          const addASCII = () => {
            if (asciiIndex < linuxASCII.length) {
              asciiArt.value = linuxASCII.slice(0, asciiIndex + 1)
              asciiIndex++
              setTimeout(addASCII, 50)
            }
          }
          addASCII()
          
          // Show overlay and redirect
          setTimeout(() => {
            clearInterval(progressInterval)
            showOverlay.value = true
            isRedirecting.value = true
            
            setTimeout(() => {
              router.push('/dashboard')
            }, 1500)
          }, 1000)
        }, 500)
      }
      
      setTimeout(addLine, index <= 3 ? 100 : index <= 6 ? 200 : 300)
    }
  }
  
  // Start adding lines after a short delay
  setTimeout(addLine, 300)
})
</script>
