<template>
    <div class="welcome-container">
        <div class="lines-animation">
            <div class="line" v-for="n in 10" :key="n" :style="{ 
                left: `${(n - 1) * 10}%`, 
                animationDelay: `${(n - 1) * 0.5}s`,
                animationDuration: `${3 + (n % 3)}s`
            }"></div>
        </div>
        <div class="content-wrapper">
            <h1 class="welcome-title">
                <span 
                    v-for="(letter, index) in letters" 
                    :key="index"
                    class="letter"
                    :class="{ 'visible': visibleIndices.includes(index) }"
                    :style="{ animationDelay: `${index * 0.05}s` }"
                >
                    {{ letter }}
                </span>
            </h1>
            <button 
                v-if="allLettersVisible" 
                class="defense-button"
                @click="initializeSystems"
            >
                INICIALIZAR SISTEMAS DE DEFESA
            </button>
        </div>
    </div>
</template>

<script setup>
import '../assets/css/welcome.css'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const letters = ['Q','U','A','C','K','D','O','W','N']
const visibleIndices = ref([])
let revealInterval = null

// Computed property to check if all letters are visible
const allLettersVisible = computed(() => {
    return visibleIndices.value.length === letters.length
})

const initializeSystems = () => {
    router.push('/loading')
}

onMounted(() => {
    // Create an array with indices from 0 to 6
    const indices = Array.from({ length: letters.length }, (_, i) => i)
    
    // Function to randomly reveal a letter
    const revealLetter = () => {
        if (indices.length === 0) {
            clearInterval(revealInterval)
            return
        }
        
        // Pick a random index from the remaining indices
        const randomIndex = Math.floor(Math.random() * indices.length)
        const indexToReveal = indices.splice(randomIndex, 1)[0]
        visibleIndices.value.push(indexToReveal)
    }
    
    // Start revealing letters at intervals
    revealInterval = setInterval(() => {
        revealLetter()
    }, 150)
})

onUnmounted(() => {
    if (revealInterval) {
        clearInterval(revealInterval)
    }
})
</script>
